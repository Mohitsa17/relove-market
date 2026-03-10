<?php

namespace App\Http\Controllers\SellerPage;

use App\Events\OrderCompleted;
use App\Http\Controllers\Controller;

use App\Models\Order;
use Exception;
use Illuminate\Http\Request;

class SellerManageOrderController extends Controller
{
    protected $user_id;

    protected $seller_id;

    public function __construct()
    {
        $this->user_id = session('user_id');
        $this->seller_id = session('seller_id');
    }

    public function get_listOrder(Request $request)
    {
        try {
            $search = $request->input('search', '');
            $status = $request->input('status', '');
            $sort = $request->input('sort', 'created_at');
            $order = $request->input('order', 'desc');
            $page = $request->input('page', 1);

            $query = Order::with(['user', 'orderItems.product', "orderItems.productImage"])
                ->where('seller_id', $this->seller_id);

            // Apply search filter
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('order_id', 'LIKE', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'LIKE', "%{$search}%")
                                ->orWhere('email', 'LIKE', "%{$search}%");
                        })
                        ->orWhereHas('orderItems.product', function ($productQuery) use ($search) {
                            $productQuery->where('product_name', 'LIKE', "%{$search}%");
                        })
                        ->orWhere('amount', 'LIKE', "%{$search}%");
                });
            }

            // Apply status filter
            if (!empty($status)) {
                $query->where('order_status', $status);
            }

            // Calculate total counts and amounts BEFORE pagination
            $totalCounts = $this->calculateTotalStats($query);

            // Apply sorting and pagination
            $paginated = $query->orderBy($sort, $order)->paginate(5, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $paginated->items(),
                'total' => $paginated->total(),
                'from' => $paginated->firstItem(),
                'to' => $paginated->lastItem(),
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'is_search' => !empty($search),
                'total_counts' => $totalCounts['counts'],
                'total_amounts' => $totalCounts['amounts']
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching orders: ' . $e->getMessage()
            ], 500);
        }
    }

    private function calculateTotalStats($query)
    {
        // Clone the query to avoid affecting the main query
        $countQuery = clone $query;

        // Get all orders (without pagination) for stats calculation
        $allOrders = $countQuery->get();

        $counts = [
            'All' => 0,
            'Pending' => 0,
            'Processing' => 0,
            'Shipped' => 0,
            'Delivered' => 0,
            'Completed' => 0,
            'Cancelled' => 0,
        ];

        $amounts = [
            'All' => 0,
            'Pending' => 0,
            'Processing' => 0,
            'Shipped' => 0,
            'Delivered' => 0,
            'Completed' => 0,
            'Cancelled' => 0,
        ];

        foreach ($allOrders as $order) {
            $status = $order->order_status ?: 'Processing';
            $amount = floatval($order->total_amount ?: $order->amount ?: 0);

            $counts['All']++;
            $counts[$status] = ($counts[$status] ?? 0) + 1;
            $amounts['All'] += $amount;
            $amounts[$status] = ($amounts[$status] ?? 0) + $amount;
        }

        return [
            'counts' => $counts,
            'amounts' => $amounts
        ];
    }

    public function updateStatus(Request $request, $orderId)
    {
        try {
            $order = Order::where('seller_id', $this->seller_id)
                ->findOrFail($orderId);

            $validated = $request->validate([
                'status' => 'required|in:Pending,Processing,Shipped,Delivered,Cancelled'
            ]);

            if ($validated['status'] === 'Completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Sellers cannot mark orders as completed. This status is set automatically when buyers confirm receipt.'
                ], 403);
            }

            $order->update(['order_status' => $validated['status']]);

            if ($validated['status'] === 'Delivered') {
                // Trigger earnings update
                event(new OrderCompleted($order));
            }

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'order' => $order->load('user', 'orderItems.product', 'orderItems.productImage')
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating order status: ' . $e->getMessage()
            ], 500);
        }
    }
}
