<?php

namespace App\Http\Controllers\SellerPage;

use App\Http\Controllers\Controller;

use App\Models\Order;

use App\Models\SellerEarning;
use Exception;

use Illuminate\Http\Request;

use Barryvdh\DomPDF\Facade\Pdf;

class SellerManageEarningController extends Controller
{
    protected $user_id;

    protected $seller_id;

    public function __construct()
    {
        $this->user_id = session('user_id');
        $this->seller_id = session('seller_id');
    }

    public function getEarnings(Request $request)
    {
        try {
            $sellerId = $this->seller_id;
            $filter = $request->input('filter', 'monthly');
            $page = $request->input('page', 1);
            $perPage = 5;

            // Total earnings from completed/delivered orders
            $totalEarnings = SellerEarning::where('seller_id', $sellerId)
                ->where("status", "Released")
                ->sum('payout_amount');

            // Pending payouts (orders that are delivered but not paid out yet)
            $pendingPayouts = SellerEarning::where('seller_id', $sellerId)
                ->where('status', 'Pending')
                ->sum('payout_amount');

            // This month earnings
            $thisMonth = SellerEarning::where('seller_id', $sellerId)
                ->where("status", "Released")
                ->whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->sum('payout_amount');

            // Last month earnings
            $lastMonth = SellerEarning::where('seller_id', $sellerId)
                ->where("status", "Released")
                ->whereYear('created_at', now()->subMonth()->year)
                ->whereMonth('created_at', now()->subMonth()->month)
                ->sum('payout_amount');

            // Today's earnings
            $today = SellerEarning::where('seller_id', $sellerId)
                ->whereDate('created_at', today())
                ->sum('payout_amount');

            // Chart data based on filter
            $chartData = [];
            $chartLabels = [];

            switch ($filter) {
                case 'daily':
                    // Last 7 days
                    for ($i = 6; $i >= 0; $i--) {
                        $date = now()->subDays($i);
                        $dailyEarnings = SellerEarning::where('seller_id', $sellerId)
                            ->where("status", "Released")
                            ->whereDate('created_at', $date->format('Y-m-d'))
                            ->sum('payout_amount');

                        $chartData[] = $dailyEarnings;
                        $chartLabels[] = $date->format('D, M d');
                    }
                    break;

                case 'monthly':
                    // Last 6 months
                    for ($i = 5; $i >= 0; $i--) {
                        $date = now()->startOfMonth()->subMonths($i);
                        $monthlyEarnings = SellerEarning::where('seller_id', $sellerId)
                            ->where("status", "Released")
                            ->whereYear('created_at', $date->year)
                            ->whereMonth('created_at', $date->month)
                            ->sum('payout_amount');

                        $chartData[] = $monthlyEarnings;
                        $chartLabels[] = $date->format('M');
                    }
                    break;

                case 'yearly':
                    // Last 5 years
                    for ($i = 4; $i >= 0; $i--) {
                        $year = now()->subYears($i)->year;
                        $yearlyEarnings = SellerEarning::where('seller_id', $sellerId)
                            ->where("status", "Released")
                            ->whereYear('created_at', $year)
                            ->sum('payout_amount');

                        $chartData[] = $yearlyEarnings;
                        $chartLabels[] = $year;
                    }
                    break;
            }

            // Recent transactions with pagination
            $transactionsQuery = Order::with(["orderItems.product"])
                ->where('seller_id', $sellerId)
                ->whereIn('order_status', ['Delivered', 'Completed'])
                ->orderBy('created_at', 'desc');

            $paginatedTransactions = $transactionsQuery->paginate($perPage, ['*'], 'page', $page);

            $recentTransactions = $paginatedTransactions->map(function ($order) {
                $productName = $order->orderItems->first()->product->product_name ?? 'N/A';

                return [
                    'id' => $order->id,
                    'order_id' => $order->order_id,
                    'date' => $order->created_at,
                    'ref' => $order->order_id,
                    'product_name' => $productName,
                    'amount' => $order->amount,
                    'order_status' => $order->order_status,
                    'payment_status' => $order->payment_status,
                ];
            });

            return response()->json([
                'total_earnings' => $totalEarnings,
                'pending_payouts' => $pendingPayouts,
                'this_month' => $thisMonth,
                'last_month' => $lastMonth,
                'today' => $today,
                'chart_data' => [
                    'labels' => $chartLabels,
                    'data' => $chartData,
                ],
                'recent_transactions' => $recentTransactions,
                'pagination' => [
                    'current_page' => $paginatedTransactions->currentPage(),
                    'last_page' => $paginatedTransactions->lastPage(),
                    'per_page' => $paginatedTransactions->perPage(),
                    'total' => $paginatedTransactions->total(),
                    'from' => $paginatedTransactions->firstItem(),
                    'to' => $paginatedTransactions->lastItem(),
                ]
            ]);

        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error fetching earnings data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function generateIncomeReport(Request $request)
    {
        try {
            $sellerId = $this->seller_id;
            $period = $request->input('period', 'monthly');
            $startDate = $request->input('startDate');
            $endDate = $request->input('endDate');
            $format = $request->input('format', 'pdf');
            $includeChart = $request->input('includeChart', true);
            $includeTransactions = $request->input('includeTransactions', true);

            // Set date range based on period
            switch ($period) {
                case 'weekly':
                    $startDate = now()->startOfWeek()->format('Y-m-d');
                    $endDate = now()->format('Y-m-d');
                    break;
                case 'monthly':
                    $startDate = now()->startOfMonth()->format('Y-m-d');
                    $endDate = now()->format('Y-m-d');
                    break;
                case 'quarterly':
                    $startDate = now()->startOfQuarter()->format('Y-m-d');
                    $endDate = now()->format('Y-m-d');
                    break;
                case 'yearly':
                    $startDate = now()->startOfYear()->format('Y-m-d');
                    $endDate = now()->format('Y-m-d');
                    break;
                case 'custom':
                    // Use provided dates
                    break;
            }

            // Fetch earnings data for the period
            $query = Order::with(['user', 'orderItems.product', 'sellerEarning'])
                ->where('seller_id', $sellerId)
                ->whereIn('order_status', ['Delivered', 'Completed'])
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);

            $transactions = $query->get();

            // Sum earnings from related sellerEarning
            $totalEarnings = $transactions->map(function ($order) {
                return optional($order->sellerEarning->first())->payout_amount ?? 0;
            })->sum();

            $transactionCount = $transactions->count();

            // Prepare report data
            $reportData = [
                'period' => $period,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'generated_at' => now()->toDateTimeString(),
                'seller_info' => [
                    'name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                ],
                'summary' => [
                    'total_earnings' => $totalEarnings,
                    'transaction_count' => $transactionCount,
                    'average_order_value' => $transactionCount > 0 ? $totalEarnings / $transactionCount : 0,
                ],
                'transactions' => $includeTransactions ? $transactions->map(function ($order) {
                    return [
                        'order_id' => $order->order_id,
                        'date' => $order->created_at->format('Y-m-d H:i:s'),
                        'customer_name' => $order->user->name ?? 'N/A',
                        'product_name' => $order->orderItems->first()->product->product_name ?? 'N/A',
                        'amount' => $order->amount,
                        'status' => $order->order_status,
                    ];
                }) : [],
            ];

            // Generate report based on format
            switch ($format) {
                case 'pdf':
                    return $this->generatePdfReport($reportData);
                default:
                    return response()->json(['error' => 'Unsupported format'], 400);
            }

        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error generating report: ' . $e->getMessage()
            ], 500);
        }
    }

    private function generatePdfReport($data)
    {
        $html = view('reports.income-pdf', compact('data'))->render();

        $pdf = Pdf::loadHTML($html);
        return $pdf->download('income-report.pdf');
    }
}
