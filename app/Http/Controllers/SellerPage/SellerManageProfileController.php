<?php

namespace App\Http\Controllers\SellerPage;

use App\Http\Controllers\Controller;

use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class SellerManageProfileController extends Controller
{
    /**
     * Get seller profile data
     */
    public function getProfile(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $store = Seller::with(["sellerStore"])
                ->where('seller_id', $user->seller_id)
                ->first();

            return response()->json([
                'success' => true,
                'user' => [
                    'user_id' => $user->user_id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'profile_image' => $user->profile_image,
                    'created_at' => $user->created_at,
                ],
                'store' => $store ? [
                    'store_id' => $store->sellerStore->store_id,
                    'store_name' => $store->sellerStore->store_name,
                    'store_description' => $store->sellerStore->store_description,
                    'store_address' => $store->sellerStore->store_address,
                    'store_phone' => $store->sellerStore->store_phone,
                    'store_image' => $store->sellerStore->store_image,
                ] : null
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch profile data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user personal information (users table)
     */
    public function updateUserProfile(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Validation rules for user data
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,email,' . $user->user_id . ',user_id',
                'phone' => 'nullable|string|max:20',
                'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update user personal information
            $user->name = $request->name;
            $user->email = $request->email;
            $user->phone = $request->phone;

            // Handle profile image upload
            if ($request->hasFile('profile_image')) {
                // Delete old profile image if exists
                if ($user->profile_image && Storage::disk('public')->exists($user->profile_image)) {
                    Storage::disk('public')->delete($user->profile_image);
                }

                $profileImage = $request->file('profile_image');
                $profileImagePath = $profileImage->store('sellers/profile_images', 'public');
                $user->profile_image = $profileImagePath;
            }

            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Personal information updated successfully',
                'user' => [
                    'user_id' => $user->user_id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'profile_image' => $user->profile_image,
                    'created_at' => $user->created_at,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update personal information',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update store information (seller_stores table)
     */
    public function updateStoreProfile(Request $request)
    {
        try {
            $user = Auth::user()->seller;

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Validation rules for store data
            $validator = Validator::make($request->all(), [
                'store_name' => 'required|string|max:255',
                'store_description' => 'nullable|string',
                'store_address' => 'nullable|string',
                'store_phone' => 'nullable|string|max:20',
                'store_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update or create store information
            $store = Seller::with(["sellerStore"])
                ->where('seller_id', $user->seller_id)
                ->first();

            $store->sellerStore->store_name = $request->store_name;
            $store->sellerStore->store_description = $request->store_description;
            $store->sellerStore->store_address = $request->store_address;
            $store->sellerStore->store_phone = $request->store_phone;

            // Handle store image upload
            if ($request->hasFile('store_image')) {
                // Delete old store image if exists
                if ($store->store_image && Storage::disk('public')->exists($store->sellerStore->store_image)) {
                    Storage::disk('public')->delete($store->sellerStore->store_image);
                }

                $storeImage = $request->file('store_image');
                $storeImagePath = $storeImage->store('sellers/store_images', 'public');
                $store->sellerStore->store_image = $storeImagePath;
            }

            $store->save();
            $store->sellerStore->save();

            return response()->json([
                'success' => true,
                'message' => 'Store information updated successfully',
                'store' => [
                    'store_name' => $store->store_name,
                    'store_description' => $store->store_description,
                    'store_address' => $store->store_address,
                    'store_phone' => $store->store_phone,
                    'store_image' => $store->store_image,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update store information',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user password
     */
    public function updatePassword(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if current password matches
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect',
                ], 422);
            }

            // Check if new password is different from current password
            if (Hash::check($request->new_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'New password must be different from current password',
                ], 422);
            }

            // Update the password
            $user->password = Hash::make($request->new_password);
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Password updated successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update password',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete user profile image
     */
    public function deleteProfileImage(Request $request)
    {
        try {
            $user = Auth::user();

            if ($user->profile_image && Storage::disk('public')->exists($user->profile_image)) {
                Storage::disk('public')->delete($user->profile_image);
                $user->profile_image = null;
                $user->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Profile image deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete profile image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete store image
     */
    public function deleteStoreImage(Request $request)
    {
        try {
            $user = Auth::user()->seller;
            $store = Seller::with(["sellerStore"])
                ->where('seller_id', $user->seller_id)
                ->first();

            if ($store && $store->sellerStore->store_image && Storage::disk('public')->exists($store->sellerStore->store_image)) {
                Storage::disk('public')->delete($store->sellerStore->store_image);
                $store->sellerStore->store_image = null;
                $store->sellerStore->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Store image deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete store image',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}