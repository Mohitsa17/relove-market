<?php

namespace App\Http\Controllers\AdminPage;

use App\Http\Controllers\Controller;
use App\Models\SellerRegistration;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SellerPendingController extends Controller
{
    /**
     * Get paginated seller registrations — returns data in Laravel paginator format
     * so the frontend (PendingSellerTable.jsx) can read responseData.data, current_page etc.
     */
    public function getSellerList(Request $request)
    {
        try {
            $status  = $request->get('status', 'Pending');
            $search  = $request->get('search', '');
            $perPage = (int) $request->get('per_page', 5);
            $page    = (int) $request->get('page', 1);

            $query = SellerRegistration::orderBy('created_at', 'desc');

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

            $total    = $query->count();
            $lastPage = max(1, (int) ceil($total / $perPage));
            $page     = min($page, $lastPage);
            $offset   = ($page - 1) * $perPage;

            $registrations = $query->offset($offset)->limit($perPage)->get();

            // Map each registration to match the exact field names the frontend uses:
            // seller.registration_id, seller.name, seller.email, seller.store_name,
            // seller.status, seller.created_at, seller.business.business_type
            $data = $registrations->map(function ($reg) {
                return [
                    'registration_id'    => $reg->registration_id,
                    'name'               => $reg->name,
                    'email'              => $reg->email,
                    'phone_number'       => $reg->phone_number,
                    'store_name'         => $reg->store_name,
                    'store_description'  => $reg->store_description,
                    'store_address'      => $reg->store_address,
                    'store_city'         => $reg->store_city,
                    'store_state'        => $reg->store_state,
                    'verification_type'  => $reg->verification_type,
                    'verification_image' => $reg->verification_image
                        ? asset('storage/' . $reg->verification_image)
                        : null,
                    'status'    => $reg->status,
                    'created_at' => $reg->created_at?->toDateTimeString(),
                    // Nested business object so seller.business.business_type works in React
                    'business' => [
                        'business_type' => $reg->business_id ?? 'N/A',
                    ],
                ];
            })->values()->toArray();

            // Return exactly the Laravel paginator shape the frontend expects
            return response()->json([
                'data'         => $data,
                'total'        => $total,
                'per_page'     => $perPage,
                'current_page' => $page,
                'last_page'    => $lastPage,
                'from'         => $total === 0 ? 0 : $offset + 1,
                'to'           => $total === 0 ? 0 : min($offset + $perPage, $total),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching seller list: ' . $e->getMessage());
            // Return an empty paginated response so the frontend gracefully shows "No seller registrations found"
            return response()->json([
                'data'         => [],
                'total'        => 0,
                'per_page'     => 5,
                'current_page' => 1,
                'last_page'    => 1,
                'from'         => 0,
                'to'           => 0,
                'error'        => $e->getMessage(),
            ]);
        }
    }

    /**
     * Approve or Reject a seller registration.
     * Action buttons call: POST /api/admin/pending-seller/{id}/action { action: 'Approved'|'Rejected' }
     */
    public function handleAction(Request $request, $id)
    {
        try {
            $action = $request->input('action'); // 'Approved' or 'Rejected'

            $registration = SellerRegistration::findOrFail($id);

            if ($action === 'Approved') {
                DB::transaction(function () use ($registration) {
                    $registration->status = 'Approved';
                    $registration->save();

                    // Upgrade the user account to seller role
                    $user = User::where('email', $registration->email)->first();
                    if ($user) {
                        $sellerRole = \App\Models\Role::where('role_name', 'seller')->first();
                        if ($sellerRole) {
                            $user->role_id = $sellerRole->id;
                            $user->save();
                        }

                        // Create seller profile if model exists
                        if (class_exists(\App\Models\Seller::class)) {
                            \App\Models\Seller::updateOrCreate(
                                ['user_id' => $user->id],
                                [
                                    'seller_name'   => $registration->store_name,
                                    'phone_number'  => $registration->phone_number,
                                    'store_address' => $registration->store_address,
                                    'business_id'   => $registration->business_id,
                                ]
                            );
                        }
                    }
                });
            } elseif ($action === 'Rejected') {
                $registration->status = 'Rejected';
                $registration->save();
            } else {
                return response()->json(['error' => 'Invalid action. Use Approved or Rejected.'], 400);
            }

            return response()->json([
                'success'        => true,
                'successMessage' => "Registration {$action} successfully.",
                'status'         => $registration->status,
            ]);
        } catch (\Exception $e) {
            Log::error('Error handling seller action: ' . $e->getMessage());
            return response()->json([
                'error'   => 'Failed to process action',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
