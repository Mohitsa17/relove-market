<?php

namespace App\Http\Controllers\AdminPage;

use App\Events\AdminPage\Transactions\PaymentReleased;

use App\Http\Controllers\Controller;

use App\Models\Order;
use App\Models\SellerEarning;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TransactionManagementController extends Controller
{

    public function getData(Request $request)
    {
        $query = Order::with([
            "user",
            "seller",
            "orderItems.product",
            "sellerEarning"
        ]);

        // Apply filters
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('order_id', 'like', '%' . $request->search . '%')
                    ->orWhereHas('user', function ($q) use ($request) {
                        $q->where('name', 'like', '%' . $request->search . '%');
                    })
                    ->orWhereHas('seller', function ($q) use ($request) {
                        $q->where('seller_name', 'like', '%' . $request->search . '%');
                    });
            });
        }

        if ($request->has('status') && $request->status !== 'All') {
            if ($request->status === 'paid') {
                $query->where('order_status', 'Completed')
                    ->whereHas('sellerEarning', function ($q) {
                        $q->where('status', 'Pending');
                    });
            } elseif ($request->status === 'released') {
                $query->whereHas('sellerEarning', function ($q) {
                    $q->where('status', 'Released');
                });
            } else {
                $query->where('order_status', $request->status);
            }
        }

        if ($request->has('payment_method') && $request->payment_method !== 'All') {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->has('start_date') && $request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Get all transactions (no pagination) for metrics calculation
        $allTransactions = $query->get();

        // Calculate metrics
        $completedTransactions = $allTransactions->filter(function ($transaction) {
            return $transaction->order_status === 'Completed' ||
                $transaction->order_status === 'Payment Released';
        });

        $pendingRelease = $allTransactions->filter(function ($transaction) {
            return $transaction->order_status === 'Completed' &&
                $transaction->sellerEarning->first()?->status === 'Pending';
        });

        $releasedPayments = $allTransactions->filter(function ($transaction) {
            return $transaction->payment_status === 'released' ||
                $transaction->sellerEarning->first()?->status === 'Released';
        });

        $totalRevenue = $completedTransactions->sum(function ($transaction) {
            return floatval($transaction->sellerEarning->first()?->commission_deducted ?? 0);
        });

        $totalAmountPending = $pendingRelease->sum(function ($transaction) {
            return floatval($transaction->sellerEarning->first()?->payout_amount ?? 0);
        });

        return response()->json([
            'success' => true,
            'data' => [
                'totalRevenue' => $totalRevenue,
                'completedTransactions' => $completedTransactions->count(),
                'pendingRelease' => $pendingRelease->count(),
                'releasedPayments' => $releasedPayments->count(),
                'totalAmountPending' => $totalAmountPending,
            ]
        ]);
    }

    public function filterFunction(Request $request)
    {
        $query = Order::with([
            "user",
            "seller",
            "orderItems.product",
            "sellerEarning"
        ]);

        // Apply filters
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('order_id', 'like', '%' . $request->search . '%')
                    ->orWhereHas('user', function ($q) use ($request) {
                        $q->where('name', 'like', '%' . $request->search . '%');
                    })
                    ->orWhereHas('seller', function ($q) use ($request) {
                        $q->where('seller_name', 'like', '%' . $request->search . '%');
                    });
            });
        }

        if ($request->has('status') && $request->status !== 'All') {
            if ($request->status === 'paid') {
                $query->where('order_status', 'Completed')
                    ->whereHas('sellerEarning', function ($q) {
                        $q->where('status', 'Pending');
                    });
            } elseif ($request->status === 'released') {
                $query->whereHas('sellerEarning', function ($q) {
                    $q->where('status', 'Released');
                });
            } else {
                $query->where('order_status', $request->status);
            }
        }

        if ($request->has('payment_method') && $request->payment_method !== 'All') {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->has('start_date') && $request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $perPage = $request->get('per_page', 5);
        $transactions = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $transactions
        ]);
    }

    // Function for releasing the payment to the seller.
    public function releasePayment($orderId)
    {
        try {
            DB::beginTransaction();

            // Find the transaction by order_id
            $transaction = SellerEarning::with(['seller', 'order'])
                ->where("order_id", $orderId)
                ->firstOrFail();

            \Log::info('Releasing payment for order', [
                'order_id' => $orderId,
                'transaction_id' => $transaction->id,
                'current_status' => $transaction->status
            ]);

            // Check if payment can be released - Enhanced validations
            if ($transaction->order->payment_status !== 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment cannot be released. Transaction payment status is not paid.'
                ], 400);
            }

            if ($transaction->order->order_status !== 'Completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment cannot be released. Order is not completed.'
                ], 400);
            }

            // Check if payment is already released in seller_earnings
            if ($transaction->status === 'Released') {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment has already been released to seller.'
                ], 400);
            }

            // Update transaction status
            $transaction->update([
                'status' => 'Released',
                'paid_at' => now(),
            ]);

            DB::commit();

            // Broadcast payment released event with proper data
            try {
                event(new PaymentReleased($transaction));

                \Log::info('Payment released event broadcasted', [
                    'order_id' => $orderId,
                    'seller_id' => $transaction->seller->seller_id,
                    'amount' => $transaction->payout_amount
                ]);
            } catch (\Throwable $e) {
                \Log::error('Broadcast failed: ' . $e->getMessage(), [
                    'order_id' => $orderId,
                    'seller_id' => $transaction->seller->seller_id
                ]);
                // Don't fail the whole request if broadcast fails
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment successfully released to seller.',
                'data' => $transaction->fresh(['seller', 'order'])
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            \Log::error('Transaction not found: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Transaction not found for this order.'
            ], 404);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Payment release failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to release payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order tracking information
     */
    public function getOrderTracking($orderId)
    {
        try {
            $orderTracking = SellerEarning::with(['seller', 'order'])
                ->where('order_id', $orderId)
                ->firstOrFail();

            \Log::info("Order Tracking" . json_decode($orderTracking));

            $orderStatusSteps = [
                ['status' => 'Pending', 'description' => 'Order placed', 'completed' => false],
                ['status' => 'Processing', 'description' => 'Seller processing order', 'completed' => false],
                ['status' => 'Shipped', 'description' => 'Order shipped to buyer', 'completed' => false],
                ['status' => 'Delivered', 'description' => 'Order delivered successfully', 'completed' => false],
                ['status' => 'Confirmed', 'description' => 'Buyer confirmed order', 'completed' => false],
                ['status' => 'Completed', 'description' => 'Order completed', 'completed' => false],
                ['status' => 'Released', 'description' => 'Payment released to seller', 'completed' => false],
            ];

            // Mark completed steps based on current status
            $currentStatusIndex = array_search($orderTracking->order->order_status, array_column($orderStatusSteps, 'status'));

            if ($currentStatusIndex !== false) {
                foreach ($orderStatusSteps as $index => &$step) {
                    $step['completed'] = $index <= $currentStatusIndex;
                    $step['current'] = $index === $currentStatusIndex;
                }
            }

            // Check payment release status
            $isPaymentReleased = $orderTracking && $orderTracking->status === 'Released';

            // Check if order is complete
            $isOrderComplete = in_array($orderTracking->order->order_status, ['Completed']);

            return response()->json([
                'success' => true,
                'data' => [
                    'orderTracking' => $orderTracking,
                    'tracking_steps' => $orderStatusSteps,
                    'is_order_complete' => $isOrderComplete,
                    'is_payment_complete' => $isPaymentReleased,
                    'completion_message' => $isOrderComplete ?
                        'This order has been completed successfully.' :
                        'Order is in progress.'
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Order tracking failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to get order tracking information.'
            ], 500);
        }
    }

    /**
     * Manual payment release for admin
     */
    public function manualReleasePayment($orderId)
    {
        return $this->releasePayment($orderId);
    }
}