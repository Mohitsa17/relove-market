<?php

namespace App\Http\Controllers\AdminPage;

use App\Http\Controllers\Controller;
use App\Models\SellerRegistration;
use App\Models\User;
use App\Models\Seller;
use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SellerPendingController extends Controller
{
    /**
     * Get the list of seller registrations, optionally filtered by status.
     */
    public function getSellerList(Request $request)
    {
        try {
            $status = $request->get('status', 'Pending');
            $search = $request->get('search', '');

            $query = SellerRegistration::with('business')
                ->orderBy('created_at', 'desc');

            if ($status && $status !== 'All') {
                $query->where('status', $status);
            }

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'ilike', "%{$search}%")
                      ->orWhere('store_name', 'ilike', "%{$search}%")
                      ->orWhere('email', 'ilike', "%{$search}%")
                      ->orWhere('registration_id', 'ilike', "%{$search}%");
                });
            }

            $registrations = $query->get()->map(function ($reg) {
                return [
                    'id'                  => $reg->registration_id,
                    'name'                => $reg->name,
                    'email'               => $reg->email,
                    'phone_number'        => $reg->phone_number,
                    'store_name'          => $reg->store_name,
                    'store_description'   => $reg->store_description,
                    'store_address'       => $reg->store_address,
                    'store_city'          => $reg->store_city,
                    'store_state'         => $reg->store_state,
                    'business_type'       => $reg->business?->business_type ?? 'N/A',
                    'verification_type'   => $reg->verification_type,
                    'verification_image'  => $reg->verification_image
                        ? asset('storage/' . $reg->verification_image)
                        : null,
                    'status'              => $reg->status,
                    'applied_at'          => $reg->created_at?->toDateTimeString(),
                ];
            });

            return response()->json([
                'registrations' => $registrations,
                'total'         => $registrations->count(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching seller list: ' . $e->getMessage());
            return response()->json([
                'error'   => 'Failed to fetch seller registrations',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Approve or Reject a seller registration.
     */
    public function handleAction(Request $request, $id)
    {
        try {
            $action = $request->input('action'); // 'Approved' or 'Rejected'

            $registration = SellerRegistration::findOrFail($id);

            if ($action === 'Approved') {
                DB::transaction(function () use ($registration) {
                    // Update registration status
                    $registration->status = 'Approved';
                    $registration->save();

                    // Find the user by email and upgrade to seller role
                    $user = User::where('email', $registration->email)->first();
                    if ($user) {
                        // Find or create seller role
                        $sellerRole = \App\Models\Role::where('role_name', 'seller')->first();
                        if ($sellerRole) {
                            $user->role_id = $sellerRole->id;
                            $user->save();
                        }

                        // Create seller profile if Seller model exists
                        if (class_exists(\App\Models\Seller::class)) {
                            \App\Models\Seller::updateOrCreate(
                                ['user_id' => $user->id],
                                [
                                    'seller_name'  => $registration->store_name,
                                    'phone_number' => $registration->phone_number,
                                    'store_address' => $registration->store_address,
                                    'business_id'  => $registration->business_id,
                                ]
                            );
                        }
                    }
                });
            } elseif ($action === 'Rejected') {
                $registration->status = 'Rejected';
                $registration->save();
            } else {
                return response()->json(['error' => 'Invalid action'], 400);
            }

            return response()->json([
                'success' => true,
                'message' => "Registration {$action} successfully.",
                'status'  => $registration->status,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error handling seller action: ' . $e->getMessage());
            return response()->json([
                'error'   => 'Failed to process action',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
