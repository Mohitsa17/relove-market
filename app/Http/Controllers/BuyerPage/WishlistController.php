<?php

namespace App\Http\Controllers\BuyerPage;

use App\Http\Controllers\Controller;

use App\Models\Wishlist;

use Exception;

use Illuminate\Http\Request;

class WishlistController extends Controller
{
    protected $user_id;

    public function __construct()
    {
        $this->user_id = session('user_id');
    }

    // Code for getting all the wishlist item for specific user
    public function get_allWishlist()
    {
        $all_wishlist = Wishlist::with([
            "product",
            "productImage",
            "ratings",
            "productVariant",
        ])
            ->where("user_id", $this->user_id)
            ->get();

        return response()->json(
            $all_wishlist
        );
    }

    // Code for validate that did the user have ever like the product before
    public function get_wishlist($product_id)
    {
        try {
            $is_wishlisted = Wishlist::where(
                "product_id",
                $product_id
            )
                ->where("user_id", $this->user_id)
                ->first();

            if ($is_wishlisted != null) {
                return response()->json([
                    "is_wishlisted" => true
                ]);
            }

            return response()->json([
                "is_wishlisted" => false
            ]);
        } catch (Exception $e) {
            return response()->json([
                "errorMessage" => $e->getMessage()
            ]);
        }
    }

    // Code for storing the product as a wishlist
    public function store_wishlist(Request $request)
    {
        $product_id = $request->input("product_id");

        try {
            $wishlistData = [
                'user_id' => $this->user_id,
                'product_id' => $product_id,
            ];

            // Add variant data if provided
            if ($request->has('selected_variant')) {
                $wishlistData['selected_variant'] = json_encode($request->selected_variant);
            }

            // Check if already in wishlist
            $existingWishlist = Wishlist::where('user_id', $this->user_id)
                ->where('product_id', $product_id)
                ->first();

            if ($existingWishlist) {
                // Update existing wishlist item with new variant/options
                $existingWishlist->update($wishlistData);
            } else {
                // Create new wishlist item
                Wishlist::create($wishlistData);
            }

            return response()->json([
                'successMessage' => 'Product added to wishlist',
                "data" => $wishlistData
            ]);
        } catch (Exception $e) {
            return response()->json(["errorMessage" => $e->getMessage()]);
        }
    }

    public function updateVariant(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,product_id',
            'variant_data' => 'required|array'
        ]);

        $wishlistItem = Wishlist::where('user_id', $this->user_id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($wishlistItem) {
            $wishlistItem->update([
                'selected_variant' => json_encode($request->variant_data)
            ]);

            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false], 404);
    }

    // Code for removing the product from wishlist (Can removed more than 1 at one time)
    public function remove_wishlist(Request $request)
    {
        try {
            $productIds = $request->input('product_id'); // array from frontend

            if (!is_array($productIds)) {
                $productIds = [$productIds]; // make sure it's an array
            }

            $deletedCount = Wishlist::where('user_id', $this->user_id)
                ->whereIn('product_id', $productIds)
                ->delete();

            if ($deletedCount > 0) {
                return response()->json([
                    'successMessage' => 'Selected products have been removed from wishlist'
                ]);
            }

            return response()->json([
                'errorMessage' => 'Products not found in wishlist'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'errorMessage' => $e->getMessage()
            ], 500);
        }
    }
}
