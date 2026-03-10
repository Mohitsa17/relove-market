<?php

namespace App\Http\Controllers\AdminPage;

use App\Mail\ProductBlockedNotification;
use App\Mail\ProductFlaggedNotification;
use App\Mail\ProductUnblockedNotification;
use App\Models\Product;
use App\Http\Controllers\Controller;
use App\Models\Rating;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ProductModerationController extends Controller
{
    public function get_allProducts(Request $request)
    {
        try {
            $query = Product::with(['category', 'seller.sellerStore', 'ratings', 'productImage']);

            // Search filter
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('product_name', 'ILIKE', "%{$search}%")
                        ->orWhereHas('seller', function ($q) use ($search) {
                            $q->where('seller_name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('category', function ($q) use ($search) {
                            $q->where('category_name', 'like', "%{$search}%");
                        });
                });
            }

            // Status filter
            if ($request->has('status') && $request->status) {
                $query->where('product_status', $request->status);
            }

            // Rating filter
            if ($request->has('rating') && !empty($request->rating)) {
                switch ($request->rating) {
                    case 'low':
                        $query->where('products.total_ratings', '<', 2.5);
                        break;
                    case 'medium':
                        $query->whereBetween('products.total_ratings', [2.5, 4]);
                        break;
                    case 'high':
                        $query->where('products.total_ratings', '>=', 4);
                        break;
                }
            }

            // Pagination
            $perPage = $request->per_page ?? 10;
            $products = $query->paginate($perPage);

            // Add calculated fields for frontend
            $products->getCollection()->transform(function ($product) {
                $product->average_rating = $product->ratings->avg('rating') ?? 0;
                $product->reviews_count = $product->ratings->count();
                $product->negative_reviews_count = $product->ratings->where('rating', '<', 3)->count();
                return $product;
            });

            return response()->json([
                'products' => $products
            ]);
        } catch (Exception $e) {
            Log::error('Error fetching products: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch products',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function get_product_stats()
    {
        try {
            $totalProducts = Product::count();
            $activeProducts = Product::where('product_status', 'available')->count();
            $flaggedProducts = Product::where('product_status', 'flagged')->count();
            $blockedProducts = Product::where('product_status', 'blocked')->count();

            // Count low rated products (average rating < 2.5)
            $lowRatedProducts = Product::with('ratings')
                ->get()
                ->filter(function ($product) {
                    return ($product->ratings->avg('rating') ?? 0) < 2.5;
                })
                ->count();

            return response()->json([
                'total' => $totalProducts,
                'active' => $activeProducts,
                'flagged' => $flaggedProducts,
                'blocked' => $blockedProducts,
                'lowRated' => $lowRatedProducts,
            ]);
        } catch (Exception $e) {
            Log::error('Error fetching product stats: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch product stats',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getProductAnalysis($id)
    {
        $product = Product::with(['seller', 'category'])
            ->findOrFail($id);

        // Get ratings with user info
        $ratings = Rating::with('user')
            ->where('product_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Basic stats
        $totalReviews = $ratings->count();
        $averageRating = $ratings->avg('rating') ?? 0;
        $negativeReviews = $ratings->where('rating', '<', 3)->count();
        $positiveReviews = $ratings->where('rating', '>=', 4)->count();

        // Get recent reviews (last 30 days) as collection
        $recentReviews = $ratings->where('created_at', '>=', now()->subDays(30));

        // Monthly averages (last 6 months) - PostgreSQL version
        $ratingHistory = Rating::where('product_id', $id)
            ->where('created_at', '>=', now()->subMonths(6))
            ->selectRaw("to_char(created_at, 'YYYY-MM') as month, AVG(rating::float) as average_rating")
            ->groupByRaw("to_char(created_at, 'YYYY-MM')")
            ->orderBy('month')
            ->get();

        return response()->json([
            'product' => [
                'product_id' => $product->product_id,
                'product_name' => $product->product_name,
                'product_status' => $product->product_status,
                'seller' => $product->seller,
                'category' => $product->category,
            ],
            'average_rating' => round($averageRating, 1),
            'total_reviews' => $totalReviews,
            'negative_reviews' => $negativeReviews,
            'positive_reviews' => $positiveReviews,
            'recent_reviews' => $recentReviews->map(function ($rating) {
                return [
                    'rating' => $rating->rating,
                    'created_at' => $rating->created_at->toISOString(),
                ];
            })->values()->all(), // Convert to array
            'recent_reviews_count' => $recentReviews->count(), // Add count separately
            'rating_history' => $ratingHistory,
            'reviews' => $ratings->take(20)->map(function ($rating) {
                return [
                    'id' => $rating->id,
                    'rating' => $rating->rating,
                    'comment' => $rating->comment,
                    'created_at' => $rating->created_at->toISOString(),
                    'user' => $rating->user ? [
                        'name' => $rating->user->name,
                        'profile_image' => $rating->user->profile_image,
                    ] : null,
                ];
            })->values()->all(),
        ]);
    }

    public function block_product(Request $request, $productId)
    {
        try {
            $product = Product::with(['seller', 'category'])->findOrFail($productId);

            // Update product status to blocked
            $product->update([
                'product_status' => 'blocked',
                'blocked_at' => now(),
                'block_reason' => $request->reason ?? 'Violation of platform policies'
            ]);

            // Send email notification to the seller
            if ($product->seller && $product->seller->email) {
                Mail::to($product->seller->email)->send(
                    new ProductBlockedNotification($product, $request->reason)
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Product has been blocked successfully',
                'product' => $product
            ]);

        } catch (Exception $e) {
            Log::error("Error blocking product {$productId}: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to block product',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function unblock_product(Request $request, $productId)
    {
        try {
            $product = Product::with(['seller', 'category'])->findOrFail($productId);

            // Update product status back to available (not 'active')
            $product->update([
                'product_status' => 'available',
                'blocked_at' => null,
                'block_reason' => null
            ]);

            // Send email notification for unblocking
            if ($product->seller && $product->seller->email) {
                Mail::to($product->seller->email)->send(
                    new ProductUnblockedNotification($product)
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Product has been unblocked successfully',
                'product' => $product
            ]);

        } catch (Exception $e) {
            Log::error("Error unblocking product {$productId}: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to unblock product',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function flag_product(Request $request, $productId)
    {
        try {
            $product = Product::with(['seller', 'category'])->findOrFail($productId);

            $product->update([
                'product_status' => 'flagged',
                'flagged_at' => now(),
                'flag_reason' => $request->reason ?? 'Under review for policy violation'
            ]);

            // Send email notification for flagging
            if ($product->seller && $product->seller->email) {
                Mail::to($product->seller->email)->send(
                    new ProductFlaggedNotification($product, $request->reason)
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Product has been flagged successfully',
                'product' => $product
            ]);

        } catch (Exception $e) {
            Log::error("Error flagging product {$productId}: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to flag product',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}