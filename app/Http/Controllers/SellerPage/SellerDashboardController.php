<?php

namespace App\Http\Controllers\SellerPage;

use App\Http\Controllers\Controller;

use App\Models\Order;
use App\Models\Product;
use App\Models\Seller;

use Exception;

class SellerDashboardController extends Controller
{
    protected $user_id;

    protected $seller_id;

    public function __construct()
    {
        $this->user_id = session('user_id');
        $this->seller_id = session('seller_id');
    }

    // Get the data for the seller dashboard
    public function getData_dashboard()
    {
        $seller_storeInfo = Seller::with([
            'sellerStore',
            'product'
        ])
            ->where('seller_id', $this->seller_id)
            ->get();

        $order_data = Order::with([
            "orderItems.product" => function ($query) {
                $query->orderBy('created_at', 'desc');
            },
            "sellerEarning",
            "user",
        ])
            ->where("seller_id", $this->seller_id)
            ->orderBy("created_at", "desc")
            ->get();

        return response()->json([
            "seller_storeInfo" => $seller_storeInfo,
            "order_data" => $order_data,
        ]);
    }

    // Get the data for featured products
    public function get_FeaturedProducts()
    {
        try {
            $featured_products = Product::with([
                "productImage"
            ])
                ->where("seller_id", $this->seller_id)
                ->where("featured", True)
                ->get();

            return response()->json([
                "featured_products" => $featured_products
            ]);
        } catch (Exception $e) {
            return response()->json([
                "errorMessage" => $e->getMessage()
            ]);
        }
    }
}
