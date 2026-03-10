<?php

namespace App\Http\Controllers\AdminPage;

use App\Http\Controllers\Controller;

use App\Models\User;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class UserManagementController extends Controller
{
    public function getUserList(Request $request)
    {
        try {
            $query = User::with('role');

            // Filter by role - only apply if not empty
            if ($request->has('role') && !empty($request->role)) {
                $query->whereHas('role', function ($q) use ($request) {
                    $q->where('role_name', $request->role);
                });
            }

            // Filter by status - only apply if not empty
            if ($request->has('status') && !empty($request->status)) {
                $query->where('status', $request->status);
            }

            // Search by name or email - only apply if not empty
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Pagination
            $perPage = $request->get('per_page', 10);
            $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json($users);

        } catch (\Exception $e) {
            \Log::error('Error fetching users: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch users'], 500);
        }
    }

    public function getUserDetails($id)
    {
        $user = User::with(['role'])->findOrFail($id);

        return response()->json([
            'data' => [
                'id' => $user->user_id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_image' => $user->profile_image,
                'status' => $user->status,
                'role' => $user->role,
                'phone' => $user->phone,
                'address' => $user->address,
                'country' => $user->country,
                'created_at' => $user->created_at,
                'email_verified_at' => $user->email_verified_at,
                'last_login_at' => $user->last_login_at,
                'last_login_ip' => $user->last_login_ip,
                'login_count' => $user->login_count,
                'date_of_birth' => $user->date_of_birth,
                'gender' => $user->gender,
                'preferences' => $user->preferences,
            ]
        ]);
    }

    public function handleUserActions(Request $request)
    {
        try {
            $request->validate([
                'action' => 'required|in:block,unblock,delete',
                'user_ids' => 'required|array',
                'user_ids.*' => 'exists:users,user_id',
            ]);

            DB::beginTransaction();

            $userIds = $request->user_ids;
            $action = $request->action;


            switch ($action) {
                case 'block':
                    $users = User::whereIn('user_id', $userIds)->get();
                    User::whereIn('user_id', $userIds)->update(['status' => 'Blocked']);

                    // Send email notifications for blocked users
                    foreach ($users as $user) {
                        $this->sendBlockNotificationEmail($user);
                    }

                    $message = count($userIds) . ' user(s) blocked successfully';
                    break;

                case 'unblock':
                    $users = User::whereIn('user_id', $userIds)->get();
                    User::whereIn('user_id', $userIds)->update(['status' => 'Active']);

                    // Send email notifications for unblocked users
                    foreach ($users as $user) {
                        $this->sendUnblockNotificationEmail($user);
                    }

                    $message = count($userIds) . ' user(s) unblocked successfully';
                    break;

                case 'delete':
                    $users = User::whereIn('user_id', $userIds)->get();

                    // Send email notifications for deleted users
                    foreach ($users as $user) {
                        $this->sendAccountDeletionEmail($user);
                    }

                    User::whereIn('user_id', $userIds)->delete();
                    $message = count($userIds) . ' user(s) deleted successfully';
                    break;

                default:
                    throw new \Exception('Invalid action');
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => $message
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error performing user action: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to perform action'
            ], 500);
        }
    }

    /**
     * Send block notification email to user
     */
    private function sendBlockNotificationEmail(User $user)
    {
        try {
            $subject = 'Account Blocked - Relove Market';

            $data = [
                'userName' => $user->name,
                'supportEmail' => 'support@relovemarket.com',
                'currentDate' => now()->format('F j, Y'),
                'platformName' => 'Relove Market'
            ];

            Mail::send('AdminPage/account-blocked', $data, function ($message) use ($user, $subject) {
                $message->to($user->email)
                    ->subject($subject)
                    ->from('noreply@relovemarket.com', 'Relove Market');
            });

            \Log::info("Block notification email sent to: {$user->email}");

        } catch (\Exception $e) {
            \Log::error("Failed to send block notification email to {$user->email}: " . $e->getMessage());
        }
    }

    /**
     * Send unblock notification email to user
     */
    private function sendUnblockNotificationEmail(User $user)
    {
        try {
            $subject = 'Account Reactivated - Relove Market';

            $data = [
                'userName' => $user->name,
                'supportEmail' => 'support@relovemarket.com',
                'currentDate' => now()->format('F j, Y'),
                'platformName' => 'Relove Market'
            ];

            Mail::send('AdminPage/account-unblocked', $data, function ($message) use ($user, $subject) {
                $message->to($user->email)
                    ->subject($subject)
                    ->from('noreply@relovemarket.com', 'Relove Market');
            });

            \Log::info("Unblock notification email sent to: {$user->email}");

        } catch (\Exception $e) {
            \Log::error("Failed to send unblock notification email to {$user->email}: " . $e->getMessage());
        }
    }

    /**
     * Send account deletion notification email to user
     */
    private function sendAccountDeletionEmail(User $user)
    {
        try {
            $subject = 'Account Deleted - Relove Market';

            $data = [
                'userName' => $user->name,
                'supportEmail' => 'support@relovemarket.com',
                'currentDate' => now()->format('F j, Y'),
                'platformName' => 'Relove Market'
            ];

            Mail::send('AdminPage/account-deleted', $data, function ($message) use ($user, $subject) {
                $message->to($user->email)
                    ->subject($subject)
                    ->from('noreply@relovemarket.com', 'Relove Market');
            });

            \Log::info("Account deletion email sent to: {$user->email}");

        } catch (\Exception $e) {
            \Log::error("Failed to send account deletion email to {$user->email}: " . $e->getMessage());
        }
    }

    public function getUserStats()
    {
        try {
            $stats = [
                'total' => User::count(),
                'active' => User::where('status', 'Active')->count(),
                'blocked' => User::where('status', 'Blocked')->count(),
                'pending' => User::where('status', 'Pending')->count(),
                'buyers' => User::whereHas('role', function ($q) {
                    $q->where('role_name', 'Buyer');
                })->count(),
                'sellers' => User::whereHas('role', function ($q) {
                    $q->where('role_name', 'Seller');
                })->count(),
                'admins' => User::whereHas('role', function ($q) {
                    $q->where('role_name', 'Admin');
                })->count(),
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            \Log::error('Error fetching user stats: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch stats'], 500);
        }
    }
}