<?php

namespace App\Http\Controllers\BuyerPage;

use App\Http\Controllers\Controller;

use App\Events\BuyerPage\ProductDetails\ReviewsUpdate;

use App\Models\Category;
use App\Models\Product;
use App\Models\Rating;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

use Exception;
use DB;

class ProductManagementController extends Controller
{
    protected $user_id;

    public function __construct()
    {
        $this->user_id = session('user_id');
    }

    public function getCategoryCounts(Request $request)
    {
        $search = $request->input('search');

        $query = DB::table('products')
            ->join('categories', 'products.category_id', '=', 'categories.category_id')
            ->where('products.product_status', '!=', 'blocked');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('products.product_name', 'like', '%' . $search . '%')
                    ->orWhere('products.product_description', 'like', '%' . $search . '%');
            });
        }

        // Get counts by category with search filter
        $counts = $query->selectRaw('categories.category_name, COUNT(products.product_id) as count')
            ->groupBy('categories.category_id', 'categories.category_name')
            ->get()
            ->pluck('count', 'category_name');

        return response()->json(['categoryCounts' => $counts]);
    }

    // Code for API/filter requests
    public function shoppingApi(Request $request)
    {
        try {
            \Log::info('🛍️ SHOPPING API - Received request:', $request->all());

            $searchTerm = $request->get('search', '');
            $categoriesFilter = $request->get('categories', []);
            $priceRange = $request->get('price_range', [0, 1000]);
            $conditionsFilter = $request->get('conditions', []);

            // FIX: Handle categories whether they come as string or array
            if (!is_array($categoriesFilter) && !empty($categoriesFilter)) {
                $categoriesFilter = [$categoriesFilter]; // Convert string to array
            }

            if (is_array($categoriesFilter)) {
                $categoriesFilter = array_filter($categoriesFilter); // Remove empty values
            }

            \Log::info('🔍 Processed categories filter:', [
                'raw_categories' => $request->get('categories'),
                'processed_categories' => $categoriesFilter,
                'is_array' => is_array($categoriesFilter),
                'count' => is_array($categoriesFilter) ? count($categoriesFilter) : 0
            ]);

            $query = Product::with([
                'productImage',
                'productVariant',
                'category',
                'ratings',
                'seller.sellerStore',
                'orderItems'
            ])
                ->where('product_status', 'available')
                ->orderBy('featured', 'desc');

            if ($searchTerm !== null && trim($searchTerm) !== '') {
                $query->where('product_name', 'ILIKE', '%' . $searchTerm . '%');
            }

            // Apply category filter - NOW HANDLES STRING INPUT
            if (!empty($categoriesFilter) && is_array($categoriesFilter)) {
                \Log::info('🎯 Applying category filter:', $categoriesFilter);

                // Convert category names to category IDs
                $categoryIds = Category::whereIn('category_name', $categoriesFilter)
                    ->pluck('category_id')
                    ->toArray();

                \Log::info('🔄 Converted category names to IDs:', [
                    'category_names' => $categoriesFilter,
                    'category_ids' => $categoryIds
                ]);

                if (!empty($categoryIds)) {
                    // Filter by category_id
                    $query->whereIn('category_id', $categoryIds);
                    \Log::info('📊 Products matching category filter: ' . $query->count());
                } else {
                    \Log::info('❌ No category IDs found for: ' . implode(', ', $categoriesFilter));
                    // Return no results if category doesn't exist
                    $query->where('category_id', 0);
                }
            }

            // Apply price range filter - FIX: Handle string input
            if (is_string($priceRange)) {
                $priceRange = explode(',', $priceRange);
            }

            if (is_array($priceRange) && count($priceRange) === 2) {
                $minPrice = floatval($priceRange[0]);
                $maxPrice = floatval($priceRange[1]);

                if ($minPrice >= 0 && $maxPrice > 0 && $minPrice <= $maxPrice) {
                    $query->whereBetween('product_price', [$minPrice, $maxPrice]);
                }
            }

            // Apply condition filter - FIX: Handle string input
            if (!is_array($conditionsFilter) && !empty($conditionsFilter)) {
                $conditionsFilter = [$conditionsFilter];
            }

            if (!empty($conditionsFilter) && is_array($conditionsFilter)) {
                $query->whereIn('product_condition', $conditionsFilter);
            }

            $list_shoppingItem = $query->paginate(6);
            $list_categoryItem = Category::all();

            \Log::info('📤 SHOPPING API - Sending response:', [
                'current_page' => $list_shoppingItem->currentPage(),
                'last_page' => $list_shoppingItem->lastPage(),
                'total' => $list_shoppingItem->total(),
                'per_page' => $list_shoppingItem->perPage(),
                'search_term' => $searchTerm,
                'categories_filter' => $categoriesFilter,
                'results_count' => $list_shoppingItem->count()
            ]);

            return response()->json([
                'success' => true,
                'list_shoppingItem' => $list_shoppingItem,
                'list_categoryItem' => $list_categoryItem,
                'search_query' => $searchTerm,
            ]);

        } catch (Exception $e) {
            \Log::error('❌ SHOPPING API Error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Error fetching products',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    // Code for calling the similar product based on product image
    public function getRecommendations(Request $request)
    {
        $productId = $request->input('product_id');
        $topK = 20;
        $similarityThreshold = $request->input('similarity_threshold', 0.70);

        \Log::info('Starting recommendation process', [
            'product_id' => $productId,
            'top_k' => $topK,
            'similarity_threshold' => $similarityThreshold
        ]);

        try {
            $response = Http::timeout(30)->post(env('ML_SERVICE_URL') . '/recommend/', [
                'product_id' => $productId,
                'top_k' => $topK,
                'similarity_threshold' => $similarityThreshold
            ]);

            if (!$response->successful()) {
                \Log::error('ML service error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return response()->json(['error' => 'Recommendation service unavailable'], 500);
            }

            $data = $response->json();

            // Check if we have an error from ML service
            if (isset($data['error'])) {
                \Log::warning('ML service returned error', ['error' => $data['error']]);
                return response()->json([
                    'error' => $data['error'],
                    'message' => $data['message'] ?? 'No recommendations found',
                ], 404);
            }

            // Check if we have recommendations
            if (!isset($data['recommendations']) || empty($data['recommendations'])) {
                \Log::warning('No recommendations from ML service');
                return response()->json([
                    'error' => 'No recommendations found',
                    'message' => 'No similar products found above the similarity threshold',
                ], 404);
            }

            \Log::info('ML service returned recommendations', [
                'count' => count($data['recommendations'])
            ]);

            // Process recommendations with strict duplicate removal
            $seenProductIds = [];
            $processedRecommendations = [];

            foreach ($data['recommendations'] as $rec) {
                $recProductId = $rec['product_id'] ?? null;

                // Skip if no product ID, current product, or duplicate
                if (
                    !$recProductId ||
                    $recProductId == $productId ||
                    in_array($recProductId, $seenProductIds)
                ) {
                    continue;
                }

                $seenProductIds[] = $recProductId;
                $processedRecommendations[] = $rec;

                // Stop if we have enough unique recommendations
                if (count($processedRecommendations) >= $topK) {
                    break;
                }
            }

            \Log::info('After duplicate filtering', [
                'original_count' => count($data['recommendations']),
                'unique_count' => count($processedRecommendations),
                'product_ids' => $seenProductIds
            ]);

            if (empty($processedRecommendations)) {
                \Log::warning('No unique recommendations after filtering');
                return response()->json([
                    'error' => 'No unique recommendations found',
                    'message' => 'All recommended products are duplicates or invalid'
                ], 404);
            }

            // Get product IDs for database query
            $productIds = array_column($processedRecommendations, 'product_id');

            // Query database for product details
            $products = Product::with([
                "productImage",
                "productVideo",
                "productFeature",
                "productIncludeItem",
                'orderItems',
                "ratings",
                "category",
            ])
                ->whereIn('product_id', $productIds)
                ->where('product_status', '!=', 'blocked')
                ->get()
                ->keyBy('product_id'); // Key by product_id for easy lookup

            \Log::info('Database query results', [
                'requested_ids' => $productIds,
                'found_products' => $products->count()
            ]);

            // Build final recommendations array
            $finalRecommendations = [];
            foreach ($processedRecommendations as $rec) {
                $product = $products->get($rec['product_id']);

                if (!$product) {
                    \Log::warning('Product not found in database', ['product_id' => $rec['product_id']]);
                    continue;
                }

                $finalRecommendations[] = [
                    'product_id' => $rec['product_id'],
                    'similarity' => $rec['similarity'],
                    'similarity_percentage' => round($rec['similarity'] * 100, 1),
                    'ai_confidence' => $rec['similarity'] >= 0.8 ? 'high' : ($rec['similarity'] >= 0.6 ? 'medium' : 'low'),
                    'product' => $product
                ];
            }

            \Log::info('Final recommendations prepared', [
                'count' => count($finalRecommendations),
                'product_ids' => array_column($finalRecommendations, 'product_id')
            ]);

            if (empty($finalRecommendations)) {
                return response()->json([
                    'error' => 'No valid products found',
                    'message' => 'Recommended products were not found in the database'
                ], 404);
            }

            return response()->json([
                "recommendations" => $finalRecommendations,
                "search_metrics" => $data['search_metrics'] ?? [],
                "source_product" => $data['source_product'] ?? null,
                "total_found" => count($finalRecommendations)
            ]);

        } catch (Exception $e) {
            \Log::error('Recommendation process failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Recommendation failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Code for user to make a review and comment on the product and store in the database.
    public function make_review(Request $request)
    {
        try {
            $validated = $request->validate([
                'product_id' => 'required|exists:products,product_id',
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string|max:1000',
            ]);

            $review = Rating::create([
                'product_id' => $validated['product_id'],
                'user_id' => $this->user_id, // or $request->user_id if passed
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
            ]);

            $review->load([
                'user' => function ($query) {
                    $query->select('user_id', 'name', 'profile_image');
                }
            ]);

            // Update product ratings summary
            $this->updateProductRatings($validated['product_id']);

            // Broadcast event
            broadcast(new ReviewsUpdate($review));

            return response()->json([
                'message' => 'Review submitted successfully.',
                'review' => $review
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                "errorMessage" => $e->getMessage()
            ]);
        }
    }

    // Function to update product ratings summary
    private function updateProductRatings($productId)
    {
        try {
            // Get all ratings for this product
            $ratings = Rating::where('product_id', $productId)->get();

            if ($ratings->count() > 0) {
                // Calculate average rating
                $averageRating = $ratings->avg('rating');
                $totalRatings = $ratings->count();

                // Calculate rating distribution
                $ratingDistribution = [
                    5 => $ratings->where('rating', 5)->count(),
                    4 => $ratings->where('rating', 4)->count(),
                    3 => $ratings->where('rating', 3)->count(),
                    2 => $ratings->where('rating', 2)->count(),
                    1 => $ratings->where('rating', 1)->count(),
                ];

                // Update product table
                Product::where('product_id', $productId)->update([
                    'total_ratings' => round($averageRating, 2),
                ]);

                \Log::info("Product ratings updated for product ID: {$productId}", [
                    'average_rating' => $averageRating,
                    'total_ratings' => $totalRatings,
                    'rating_distribution' => $ratingDistribution
                ]);
            }

        } catch (Exception $e) {
            \Log::error("Error updating product ratings for product ID: {$productId}", [
                'error' => $e->getMessage()
            ]);
        }
    }

    public function get_allProducts(Request $request)
    {
        try {
            $query = Product::with(['category', 'seller.sellerStore', 'ratings']);

            // Search filter
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('product_name', 'like', "%{$search}%")
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
            if ($request->has('rating') && $request->rating) {
                switch ($request->rating) {
                    case 'low':
                        $query->whereHas('ratings', function ($q) {
                            $q->havingRaw('AVG(rating) < 2.5');
                        });
                        break;
                    case 'medium':
                        $query->whereHas('ratings', function ($q) {
                            $q->havingRaw('AVG(rating) BETWEEN 2.5 AND 4');
                        });
                        break;
                    case 'high':
                        $query->whereHas('ratings', function ($q) {
                            $q->havingRaw('AVG(rating) > 4');
                        });
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
            return response()->json([
                'error' => 'Failed to fetch product stats',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
