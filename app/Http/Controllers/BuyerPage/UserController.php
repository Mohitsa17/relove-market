<?php

namespace App\Http\Controllers\BuyerPage;

use App\Http\Controllers\Controller;

use App\Models\Business;
use App\Models\Category;
use App\Models\Product;
use App\Models\Wishlist;

use Illuminate\Http\Request;

use Inertia\Inertia;

class UserController extends Controller
{
    protected $user_id;

    public function __construct()
    {
        $this->user_id = session('user_id');
    }

    // Code for returning the home page
    public function homepage()
    {
        $list_shoppingItem = Product::with([
            'productImage',
            'category'
        ])
            ->where("product_status", '!=', "blocked")
            ->get();

        $list_categoryItem = Category::all();

        return Inertia::render(
            'BuyerPage/HomePage',
            [
                "list_shoppingItem" => $list_shoppingItem,
                "list_categoryItem" => $list_categoryItem,
            ]
        );
    }

    // Code for returning the about us page
    public function aboutus()
    {
        return Inertia::render('BuyerPage/AboutUs');
    }

    // Code for returning the shopping page
    public function shopping(Request $request)
    {
        $query = Product::with([
            'productImage',
            'productVariant',
            'category',
            'ratings',
            'seller.sellerStore',
            "orderItems"
        ])
            ->where("product_status", '!=', "blocked")
            ->orderBy('featured', 'DESC');

        // Apply search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('product_name', 'like', '%' . $search . '%')
                    ->orWhere('product_description', 'like', '%' . $search . '%')
                    ->orWhereHas('category', function ($categoryQuery) use ($search) {
                        $categoryQuery->where('category_name', 'like', '%' . $search . '%');
                    });
            });
        }

        // Apply category filter from query parameters
        if ($request->has('categories')) {
            $categories = $request->categories;

            // Handle both array and string input
            if (!is_array($categories)) {
                $categories = [$categories];
            }

            \Log::info('🎯 Applying category filter in shopping method:', [
                'categories' => $categories,
                'type' => gettype($request->categories)
            ]);

            if (!empty($categories)) {
                $query->whereHas('category', function ($categoryQuery) use ($categories) {
                    $categoryQuery->whereIn('category_name', $categories);
                });
            }
        }

        // Default sorting
        $query->orderBy('created_at', 'desc');

        $list_shoppingItem = $query->paginate(6);
        $list_categoryItem = Category::all();

        // Pass the current category filter to the frontend
        $currentCategories = $request->has('categories') ?
            (is_array($request->categories) ? $request->categories : [$request->categories]) : [];

        return Inertia::render("BuyerPage/ShopPage", [
            'list_shoppingItem' => $list_shoppingItem,
            'list_categoryItem' => $list_categoryItem,
            'filters' => $request->only(['search', 'categories']),
            'currentCategories' => $currentCategories
        ]);
    }

    // Code for returning the seller benefit page
    public function sellerBenefit()
    {
        return Inertia::render("BuyerPage/SellerBenefit");
    }

    // Code for returning the product details page
    public function productDetails($product_id)
    {
        $product_info = Product::with([
            'productImage',
            "productVideo",
            "productFeature",
            "productIncludeItem",
            "productVariant",
            "seller.sellerStore",
            "ratings.user",
            "orderItems"
        ])
            ->where('product_id', $product_id)
            ->get();

        return Inertia::render(
            "BuyerPage/ProductDetails",
            [
                'product_info' => $product_info,
            ]
        );
    }

    // Code for returning the seller registration page
    public function sellerRegistration()
    {
        $list_business = Business::all();

        return Inertia::render(
            "BuyerPage/SellerRegistration",
            [
                'list_business' => $list_business
            ]
        );
    }

    // Code for returning the seller shop page
    public function sellerShop()
    {
        return Inertia::render('BuyerPage/SellerShop');
    }

    // Code for returning the wishlist page
    public function wishlist()
    {
        $user_wishlist = Wishlist::with([
            "user",
            "product",
            "productImage",
            "product.seller",
            "productVariant"
        ])
            ->where("user_id", $this->user_id)
            ->get();

        return Inertia::render(
            "BuyerPage/Wishlist",
            [
                "user_wishlist" => $user_wishlist,
            ]
        );
    }

    // Code for returning the profile page
    public function profile()
    {
        return Inertia::render("BuyerPage/ProfilePage");
    }

    // Code for returning the buyer chat page
    public function buyerChat()
    {
        return Inertia::render("BuyerPage/BuyerChatPage");
    }

    // Code for returning the checkout page
    public function checkoutPage(Request $request)
    {
        // First, try to get data from session (for page refreshes)
        $sessionCheckoutData = $request->session()->get('checkout_data');

        // If we have session data, use it
        if ($sessionCheckoutData) {
            return Inertia::render('BuyerPage/Checkout', [
                'list_product' => $sessionCheckoutData['items'],
                'platform_tax' => $sessionCheckoutData['platform_tax'],
            ]);
        }

        // Otherwise, try to get data from request (direct access)
        $list_product = $request->input('items');
        $single_checkoutData = $request->input('single_checkoutData');

        $platform_tax = 0.08;

        if ($single_checkoutData && !$list_product) {
            $list_product = $single_checkoutData;
        }

        // If no data found, redirect back to cart
        if (!$list_product) {
            return redirect()->route('cart')->with('error', 'Please select items to checkout first.');
        }

        return Inertia::render('BuyerPage/Checkout', [
            'list_product' => $list_product,
            'platform_tax' => $platform_tax,
        ]);
    }

    public function checkoutProcess(Request $request)
    {
        $checkoutItems = $request->input('items');
        $platform_tax = 0.08;

        // Validate the checkout items
        if (!$checkoutItems || !is_array($checkoutItems) || count($checkoutItems) === 0) {
            return redirect()->back()->with('error', 'No items selected for checkout.');
        }

        // Store checkout data in session for page refresh handling
        $request->session()->put('checkout_data', [
            'items' => $checkoutItems,
            'platform_tax' => $platform_tax,
            'timestamp' => now()->timestamp
        ]);

        // Flash the session data for immediate use
        $request->session()->flash('checkout_data', [
            'items' => $checkoutItems,
            'platform_tax' => $platform_tax,
            'timestamp' => now()->timestamp
        ]);

        // Redirect to checkout page with GET request
        return redirect()->route('checkout');
    }
}
