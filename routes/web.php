<?php

use App\Http\Controllers\BuyerPage\HomePageController;
use App\Http\Controllers\BuyerPage\ProductManagementController;
use App\Http\Controllers\BuyerPage\UserController;

use App\Http\Controllers\SellerPage\SellerController;
use App\Http\Controllers\AdminPage\AdminController;

use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ChatController;

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('homepage');
});

// General Page that can be access without login
Route::get('/relove-market', [UserController::class, 'homepage'])->name('homepage');
Route::get("/about-us", [UserController::class, 'aboutus'])->name("about-us");
Route::get("/shopping", [UserController::class, 'shopping'])->name("shopping");
Route::get('/api/shopping/category-counts', [ProductManagementController::class, 'getCategoryCounts']);
Route::get('/api/shopping', [ProductManagementController::class, 'shoppingApi']);
Route::get("/seller-benefit", [UserController::class, 'sellerBenefit'])->name("seller-benefit");
Route::get("/product-details/{productId}", [UserController::class, "productDetails"])->name('product-details');
Route::get('/seller-shop', [UserController::class, 'sellerShop'])->name('seller-shop');

// Code for calling the product image based recommendation for user
Route::post("/api/recommend", [ProductManagementController::class, "getRecommendations"])->name("recommend");
Route::post('/camera-search', [HomePageController::class, 'cameraSearch'])->name("camera-search");

// Code for calling the featured and flash sale products on the home page
Route::get("/get-featured-products", [HomePageController::class, "get_featuredProducts"])->name("get-featured-products");
Route::get("/get-flash-sale-products", [HomePageController::class, "get_flashSaleProducts"])->name("get-flash-sale-products");

// Need to login account and is a buyer can access this all feature
Route::middleware(["is_buyer"])->group(function () {
    Route::get("/seller-registration", [UserController::class, "sellerRegistration"])->name('seller-registration');
    Route::get("/profile", [UserController::class, "profile"])->name("profile");
    Route::get('/cart', [UserController::class, 'wishlist'])->name('cart');
    Route::get('/buyer-chat', [UserController::class, 'buyerChat'])->name('buyer-chat');

    Route::get('/checkout', [UserController::class, 'checkoutPage'])->name('checkout');
    Route::post('/checkout-process', [UserController::class, 'checkoutProcess'])->name('checkout-process');
    Route::post("/validate-stock", [PaymentController::class, "validateStock"]);
    Route::post('/create-payment-intent', [PaymentController::class, 'createPaymentIntent']);
    Route::post('/confirm-payment', [PaymentController::class, 'confirmPayment']);
    Route::get('/order/{orderId}', [PaymentController::class, 'getOrder']);
    Route::get('/orders', [PaymentController::class, 'listOrders']);
    Route::get('/order-success', [PaymentController::class, "show_orderSuccess"]);
});

// need to login account and is a seller can access all this feature
Route::middleware(['is_seller'])->group(function () {
    Route::get('/seller-dashboard', [SellerController::class, 'sellerDashboard'])->name('seller-dashboard');
    Route::get("/seller-manage-product", [SellerController::class, "sellerManageProduct"])->name("seller-manage-product");
    Route::get("/seller-manage-order", [SellerController::class, "sellerOrderPage"])->name("seller-manage-order");
    Route::get("/seller-manage-earning", [SellerController::class, "sellerEarningPage"])->name("seller-manage-earning");
    Route::get("/seller-help-support", [SellerController::class, "sellerHelpSupportPage"])->name("seller-help-support");
    Route::get('/seller-manage-profile', [SellerController::class, 'getProfile'])->name("seller-manage-profile");
    Route::get('/seller-chat', [ChatController::class, "sellerChat"])->name('seller-chat');
});

// need to login account and is a admin can access all this feature
Route::middleware(["is_admin"])->group(function () {
    Route::get('/admin-dashboard', [AdminController::class, 'adminDashboard'])->name('admin-dashboard');
    Route::get("/pending-seller-list", [AdminController::class, "pendingSellerTable"])->name("pending-seller-list");
    Route::get("/admin-profile", [AdminController::class, 'profilePage'])->name("admin-profile");
    Route::get("/list-transaction", [AdminController::class, 'transactionPage'])->name("list-transaction");
    Route::get("/product-moderation", [AdminController::class, "productModeration"])->name("product-moderation");
    Route::get("/user-management", [AdminController::class, "userManagement"])->name("user-management");
});

// code for calling and setting the chat communication between buyer and seller
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/conversations', [ChatController::class, 'getConversations']);
    Route::get('/messages/{conversationId}', [ChatController::class, 'getMessages']);
    Route::post('/send-message', [ChatController::class, 'sendMessage']);
    Route::post('/conversations/{conversationId}/mark-read', [ChatController::class, 'markAsRead']);
    Route::post('/start-conversation', [ChatController::class, 'startConversation']);
});

require __DIR__ . '/auth.php';
require __DIR__ . '/api.php';
