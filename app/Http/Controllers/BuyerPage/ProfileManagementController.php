<?php

namespace App\Http\Controllers\BuyerPage;

use App\Events\OrderCompleted;
use App\Http\Controllers\Controller;

use App\Models\Order;
use App\Models\SellerEarning;
use App\Models\User;

use Exception;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileManagementController extends Controller
{
    protected $user_id;

    public function __construct()
    {
        $this->user_id = session('user_id');
    }

    // Code for view the order history on profile page.
    public function orderHistory()
    {
        $list_order = Order::with([
            "orderItems.product",
            "orderItems.product.productImage",
            "orderItems.product.seller.sellerStore",
            "user",
        ])
            ->where("user_id", $this->user_id)
            ->orderBy("created_at", "desc")
            ->get();

        return response()->json($list_order);
    }

    public function checkAddress(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'hasValidAddress' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Based on your HandleInertiaRequests structure, the address fields are:
            // 'address', 'city', 'zip_code'
            $requiredFields = [
                'address',
                'city',
                'zip_code'
            ];

            $hasValidAddress = true;
            $missingFields = [];

            foreach ($requiredFields as $field) {
                if (empty($user->$field)) {
                    $hasValidAddress = false;
                    $missingFields[] = $field;
                }
            }

            // Additional validation: check if address fields are not just empty strings
            if ($hasValidAddress) {
                foreach ($requiredFields as $field) {
                    if (trim($user->$field) === '') {
                        $hasValidAddress = false;
                        $missingFields[] = $field;
                        break;
                    }
                }
            }

            return response()->json([
                'hasValidAddress' => $hasValidAddress,
                'missingFields' => $missingFields,
                'userAddress' => $hasValidAddress ? [
                    'address' => $user->address,
                    'city' => $user->city,
                    'zip_code' => $user->zip_code,
                    // Note: Based on your structure, there's no state or country field
                    // If you need these, you might want to add them to your users table
                ] : null,
                'message' => $hasValidAddress
                    ? 'Address is complete and valid'
                    : 'Please complete your shipping address'
            ]);

        } catch (Exception $e) {
            \Log::error('Error checking user address: ' . $e->getMessage());

            return response()->json([
                'hasValidAddress' => false,
                'error' => 'Unable to verify address',
                'message' => 'Error checking address information'
            ], 500);
        }
    }

    // Code for updating the information and image on profile page.
    public function updateProfile(Request $request)
    {
        try {
            Log::info('🎯 Profile update request received', [
                'all_data' => $request->all(),
                'files' => $request->file() ? array_keys($request->file()) : 'no files',
                'has_profile_image' => $request->hasFile('profile_image') ? 'yes' : 'no',
            ]);

            // ✅ Validate input
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:255',
                'zip_code' => 'nullable|string|max:10',
                'profile_image' => 'nullable|file|mimes:jpg,jpeg,png|max:9999',
            ]);

            if ($validator->fails()) {
                Log::error('❌ Validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();
            Log::info('✅ Validation passed', $validated);

            // ✅ Find user by email
            $user = User::where('email', $validated['email'])->first();

            if (!$user) {
                Log::error('❌ User not found with email: ' . $validated['email']);
                return response()->json([
                    'success' => false,
                    'message' => 'User not found with this email.',
                ], 404);
            }

            Log::info('✅ User found', ['user_id' => $user->user_id, 'email' => $user->email]);

            // ✅ Handle profile image upload
            if ($request->hasFile('profile_image')) {
                Log::info('📁 Profile image file detected', [
                    'file_name' => $request->file('profile_image')->getClientOriginalName(),
                    'file_size' => $request->file('profile_image')->getSize(),
                    'file_mime' => $request->file('profile_image')->getMimeType(),
                ]);

                $image = $request->file('profile_image');
                $directory = "profile_images/{$user->user_id}";

                Log::info('📂 Attempting to store in directory: ' . $directory);

                // Create directory if it doesn't exist
                if (!Storage::disk('public')->exists($directory)) {
                    Log::info('📁 Creating directory: ' . $directory);
                    $created = Storage::disk('public')->makeDirectory($directory);
                    Log::info('📁 Directory created: ' . ($created ? 'yes' : 'no'));
                }

                // Generate unique filename
                $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();

                Log::info('📝 Generated filename: ' . $filename);

                // Store the file
                $path = $image->storeAs($directory, $filename, 'public');

                Log::info('💾 File stored at path: ' . $path);

                if ($user->profile_image && Storage::disk('public')->exists($user->profile_image)) {
                    Storage::disk('public')->delete($user->profile_image);
                }

                if ($path) {
                    $validated['profile_image'] = $path;
                    Log::info('✅ Profile image path saved: ' . $path);

                    // Check if file actually exists
                    $fileExists = Storage::disk('public')->exists($path);
                    Log::info('🔍 File exists in storage: ' . ($fileExists ? 'yes' : 'no'));
                } else {
                    Log::error('❌ Failed to store profile image');
                }
            } else {
                Log::info('📭 No profile image file in request');
            }

            // ✅ Update the user's data
            Log::info('🔄 Updating user data', $validated);
            $user->update($validated);

            // Refresh user data
            $user->refresh();

            // Prepare user data for response
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'city' => $user->city,
                'zip_code' => $user->zip_code,
                'profile_image' => $user->profile_image,
            ];

            // Add full URL if profile image exists
            if ($user->profile_image) {
                $userData['profile_image_url'] = asset('storage/' . $user->profile_image);
                Log::info('🌐 Profile image URL: ' . $userData['profile_image_url']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully!',
                'user' => $userData,
            ]);

        } catch (Exception $e) {
            Log::error('💥 Profile update error: ' . $e->getMessage());
            Log::error('📝 Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Error updating profile: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function updatePassword(Request $request)
    {
        // Validate the request
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();

        // Check if current password matches
        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        // Check if new password is different from current password
        if (Hash::check($request->new_password, $user->password)) {
            throw ValidationException::withMessages([
                'new_password' => ['The new password must be different from your current password.'],
            ]);
        }

        // Update the password
        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'message' => 'Password updated successfully!',
        ]);
    }

    public function confirmDelivery($orderId)
    {
        try {
            $order = Order::with('orderItems.product.seller', 'orderItems.product')->findOrFail($orderId);

            // Verify the order belongs to the authenticated buyer
            if ($order->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this order'
                ], 403);
            }

            // Check if order is in Delivered status
            if ($order->order_status !== 'Delivered') {
                return response()->json([
                    'success' => false,
                    'message' => 'Order is not in delivered status'
                ], 400);
            }

            // Check if order is already completed
            if ($order->order_status === 'Completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Order has already been completed'
                ], 400);
            }

            // Validate order items exist
            if ($order->orderItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order does not contain any items'
                ], 400);
            }

            // Validate seller information
            foreach ($order->orderItems as $orderItem) {
                if (!$orderItem->product || !$orderItem->product->seller) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid product or seller information in order items'
                    ], 400);
                }
            }

            // Start database transaction
            DB::beginTransaction();

            // Update order status to Completed
            $order->update([
                'order_status' => 'Completed',
                'completed_at' => now()
            ]);

            // Calculate and process commission with featured product validation
            $commissionResult = $this->processCommission($order);

            DB::commit();

            // Notify seller about completed order and commission
            event(new OrderCompleted($order));

            // Prepare response message based on commission type
            $message = 'Delivery confirmed successfully. ';
            if ($commissionResult['has_featured_products']) {
                $message .= "Commission processed: 10% for featured products, 8% for standard products. Total commission: {$commissionResult['total_commission']}.";
            } else {
                $message .= "8% commission applied. Total commission: {$commissionResult['total_commission']}.";
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'order' => $order,
                'commission_details' => $commissionResult
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            \Log::error('Delivery confirmation failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm delivery. Please try again.'
            ], 500);
        }
    }

    protected function processCommission($order)
    {
        $standardCommissionRate = 0.08; // 8% for standard products
        $featuredCommissionRate = 0.10; // 10% for featured products

        $totalAmount = floatval($order->amount);

        // Analyze order items to calculate commission separately
        $featuredProductsTotal = 0;
        $standardProductsTotal = 0;
        $featuredProducts = [];
        $standardProducts = [];

        foreach ($order->orderItems as $orderItem) {
            $itemTotal = floatval($orderItem->price) * intval($orderItem->quantity);

            if ($orderItem->product->featured) {
                $featuredProductsTotal = $totalAmount;
                $featuredProducts[] = [
                    'product_id' => $orderItem->product->product_id,
                    'product_name' => $orderItem->product->product_name,
                    'amount' => $itemTotal,
                    'commission_rate' => '10%'
                ];
            } else {
                $standardProductsTotal = $totalAmount;
                $standardProducts[] = [
                    'product_id' => $orderItem->product->product_id,
                    'product_name' => $orderItem->product->product_name,
                    'amount' => $itemTotal,
                    'commission_rate' => '8%'
                ];
            }
        }

        // Calculate commission separately for featured and standard products
        $featuredCommission = $featuredProductsTotal * $featuredCommissionRate;
        $standardCommission = $standardProductsTotal * $standardCommissionRate;
        $totalCommission = $featuredCommission + $standardCommission;
        $payoutAmount = $totalAmount - $totalCommission;

        $hasFeaturedProducts = $featuredProductsTotal > 0;

        $seller = $order->orderItems->first()->product->seller;

        // Create earnings record
        $earning = SellerEarning::create([
            'seller_id' => $seller->seller_id,
            'order_id' => $order->order_id,
            'amount' => $totalAmount,
            'commission_rate' => $hasFeaturedProducts ? $featuredCommissionRate : $standardCommissionRate, // Primary rate
            'commission_deducted' => $totalCommission,
            'payout_amount' => $payoutAmount,
            'status' => 'Pending',
            'processed_at' => now()
        ]);

        // Return commission details for response
        return [
            'has_featured_products' => $hasFeaturedProducts,
            'total_commission' => 'RM ' . number_format($totalCommission, 2),
            'commission_breakdown' => [
                'featured_products' => [
                    'amount' => $featuredProductsTotal,
                    'commission_rate' => '10%',
                    'commission_amount' => $featuredCommission,
                    'count' => count($featuredProducts)
                ],
                'standard_products' => [
                    'amount' => $standardProductsTotal,
                    'commission_rate' => '8%',
                    'commission_amount' => $standardCommission,
                    'count' => count($standardProducts)
                ]
            ],
            'payout_amount' => $payoutAmount,
            'earning_id' => $earning->id
        ];
    }
}
