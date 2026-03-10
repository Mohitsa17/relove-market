<?php

namespace App\Http\Controllers\AdminPage;

use App\Http\Controllers\Controller;

use App\Models\Order;
use App\Models\SellerEarning;
use App\Models\SellerRegistration;
use App\Models\User;

use Illuminate\Http\Request;

use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    public function getStats(Request $request)
    {
        try {
            $timeframe = $request->get('timeframe', 'monthly');

            // Total Revenue (from completed orders)
            $totalRevenue = SellerEarning::whereHas('order', function ($q) {
                $q->whereIn('order_status', ['Completed', 'Delivered']);
            })
                ->sum('commission_deducted');


            // Total Orders
            $totalOrders = Order::count();

            // Total Customers (users with role_id for buyers - adjust based on your role system)
            $totalCustomers = User::count();

            // Pending Sellers
            $pendingSellers = SellerRegistration::where("status", "Pending")->count();

            // Average Order Value
            $averageOrderValue = Order::where('order_status', 'Completed')
                ->avg('amount') ?? 0;

            // Revenue data for chart based on timeframe
            $revenueData = $this->getRevenueData($timeframe);

            // Recent activities
            $recentActivities = $this->getRecentActivities();

            // Calculate changes (you might want to compare with previous period)
            $changes = $this->calculateChanges($timeframe);

            return response()->json([
                'overview' => [
                    'totalRevenue' => (float) $totalRevenue,
                    'totalOrders' => (int) $totalOrders,
                    'totalCustomers' => (int) $totalCustomers,
                    'pendingSellers' => (int) $pendingSellers,
                    'averageOrderValue' => (float) $averageOrderValue,
                    'conversionRate' => $this->calculateConversionRate(),
                ],
                'revenueData' => $revenueData,
                'changes' => $changes,
                'recentActivities' => $recentActivities,
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching dashboard stats: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch dashboard data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function getRevenueData($timeframe)
    {
        $now = Carbon::now();

        switch ($timeframe) {
            case 'daily':
                // Last 7 days
                $data = [];
                for ($i = 6; $i >= 0; $i--) {
                    $date = $now->copy()->subDays($i);
                    $revenue = SellerEarning::whereHas('order', function ($q) {
                        $q->whereIn('order_status', ['Completed', 'Delivered']);
                    })
                        ->whereDate('created_at', $date)
                        ->sum('commission_deducted');
                    $data[] = (float) $revenue;
                }
                return ['daily' => $data];

            case 'weekly':
                // Last 4 weeks
                $data = [];
                for ($i = 3; $i >= 0; $i--) {
                    $startDate = $now->copy()->subWeeks($i + 1)->startOfWeek();
                    $endDate = $now->copy()->subWeeks($i)->startOfWeek();
                    $revenue = SellerEarning::whereHas('order', function ($q) {
                        $q->whereIn('order_status', ['Completed', 'Delivered']);
                    })
                        ->whereBetween('created_at', [$startDate, $endDate])
                        ->sum('commission_deducted');
                    $data[] = (float) $revenue;
                }
                return ['weekly' => $data];

            case 'monthly':
            default:
                // Last 12 months
                $data = [];
                for ($i = 11; $i >= 0; $i--) {
                    $date = $now->copy()->subMonths($i);

                    $revenue = SellerEarning::whereHas('order', function ($q) {
                        $q->whereIn('order_status', ['Completed', 'Delivered']);
                    })
                        ->whereYear('created_at', $date->year)
                        ->whereMonth('created_at', $date->month)
                        ->sum('commission_deducted');
                    $data[] = (float) $revenue;
                }
                return ['monthly' => $data];
        }
    }

    private function getRecentActivities()
    {
        // Get recent orders and seller registrations
        $recentOrders = Order::with([
            'user',
            'seller'
        ])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->order_id,
                    'user' => $order->user->name ?? 'Unknown User',
                    'action' => 'placed an order',
                    'target' => "on seller {$order->seller->seller_name}",
                    'time' => $order->created_at->diffForHumans(),
                    'amount' => 'RM ' . number_format($order->amount, 2)
                ];
            });

        $recentSellers = User::whereHas('role', function ($q) {
            $q->where('role_name', 'seller');
        })
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'user' => $user->name,
                    'action' => 'registered as seller',
                    'target' => $user->business_name ?? 'New Seller',
                    'time' => $user->created_at->diffForHumans(),
                    'amount' => 'Pending'
                ];
            });

        return $recentOrders->merge($recentSellers)
            ->sortByDesc('id')
            ->values()
            ->toArray();
    }

    private function calculateChanges($timeframe)
    {
        // Simplified change calculation - you might want to implement more sophisticated logic
        return [
            'revenue' => 12.4, // Example positive change
            'orders' => 8.2,
            'customers' => 5.7,
            'sellers' => -3.2, // Example negative change
        ];
    }

    private function calculateConversionRate()
    {
        // Implement your conversion rate logic here
        // This is a simplified example
        $totalVisitors = 10000; // You would get this from analytics
        $totalPurchases = Order::count();

        return $totalVisitors > 0 ? round(($totalPurchases / $totalVisitors) * 100, 1) : 0;
    }
}