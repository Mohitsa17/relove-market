import { useState, useEffect } from "react";
import { Sidebar } from "@/Components/AdminPage/Sidebar";
import { Link, usePage } from "@inertiajs/react";
import {
    FaDollarSign,
    FaShoppingCart,
    FaUsers,
    FaUserCheck,
    FaBox,
    FaChartBar,
    FaCalendarAlt,
    FaArrowUp,
    FaArrowDown,
    FaExclamationTriangle,
} from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function AdminDashboard() {
    const { auth } = usePage().props;
    const [timeFrame, setTimeFrame] = useState("monthly");
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);

    // Fetch actual data from backend
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `/api/admin/dashboard/stats?timeframe=${timeFrame}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setDashboardData(data);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Failed to load dashboard data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [timeFrame]);

    // Chart configuration
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: "#1F2937",
                titleColor: "#F9FAFB",
                bodyColor: "#F9FAFB",
                borderColor: "#374151",
                borderWidth: 1,
                callbacks: {
                    label: function (context) {
                        return `RM ${context.parsed.y.toLocaleString()}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: "#6B7280",
                },
            },
            y: {
                grid: {
                    color: "#F3F4F6",
                },
                ticks: {
                    color: "#6B7280",
                    callback: function (value) {
                        return "RM " + value.toLocaleString();
                    },
                },
                beginAtZero: true,
            },
        },
    };

    const getChartData = () => {
        const data = dashboardData?.revenueData?.[timeFrame] || [];
        const labels = getChartLabels();

        return {
            labels: labels,
            datasets: [
                {
                    data: data,
                    backgroundColor: "#4F46E5",
                    borderRadius: 6,
                    borderSkipped: false,
                },
            ],
        };
    };

    const getChartLabels = () => {
        switch (timeFrame) {
            case "daily":
                return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            case "weekly":
                return [
                    "Week 1",
                    "Week 2",
                    "Week 3",
                    "Week 4",
                    "Week 5",
                    "Week 6",
                    "Week 7",
                ];
            case "monthly":
                return [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
            default:
                return [];
        }
    };

    // Stats Cards Component
    const StatCard = ({ title, value, change, trend, icon, color, link }) => {
        if (loading) {
            return (
                <div className="bg-white p-6 rounded-xl border border-gray-200 animate-pulse">
                    <div className="flex items-center">
                        <div className="rounded-full bg-gray-200 p-3 mr-4 w-12 h-12"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <Link href={link || "#"} className="block group">
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center">
                        <div className={`rounded-full ${color} p-3 mr-4`}>
                            {icon}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">
                                {title}
                            </p>
                            <div className="flex items-baseline justify-between">
                                <p className="text-2xl font-bold text-gray-800">
                                    {typeof value === "number"
                                        ? value.toLocaleString()
                                        : value}
                                </p>
                                {change && (
                                    <span
                                        className={`flex items-center text-sm font-medium ${
                                            trend === "up"
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {trend === "up" ? (
                                            <FaArrowUp className="mr-1" />
                                        ) : (
                                            <FaArrowDown className="mr-1" />
                                        )}
                                        {Math.abs(change)}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        );
    };

    // Error display component
    if (error && !dashboardData) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar pendingCount={0} />
                <main className="flex-1 p-4 lg:p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <FaExclamationTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Unable to load dashboard
                            </h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Loading Skeleton
    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar pendingCount={0} />
                <main className="flex-1 p-4 lg:p-6">
                    <div className="animate-pulse">
                        {/* Header Skeleton */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                            <div>
                                <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-64"></div>
                            </div>
                            <div className="h-10 bg-gray-200 rounded w-32 mt-4 md:mt-0"></div>
                        </div>

                        {/* Stats Grid Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="bg-white p-6 rounded-xl border border-gray-200"
                                >
                                    <div className="flex items-center">
                                        <div className="rounded-full bg-gray-200 p-3 mr-4 w-12 h-12"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chart Skeleton */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
                            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
                            <div className="h-64 bg-gray-200 rounded"></div>
                        </div>

                        {/* Activities Skeleton */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200">
                                <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="flex items-center"
                                        >
                                            <div className="h-10 w-10 bg-gray-200 rounded-full mr-3"></div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-24"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar pendingCount={dashboardData.overview.pendingSellers} />

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-6">
                {/* Error Banner */}
                {error && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
                        <FaExclamationTriangle className="text-yellow-500 mr-3 flex-shrink-0" />
                        <div>
                            <p className="text-yellow-800 text-sm">{error}</p>
                            <p className="text-yellow-700 text-xs mt-1">
                                Showing sample data. Real data will load when
                                connection is restored.
                            </p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-20 md:mt-0">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Dashboard Overview
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Welcome back, {auth?.user?.name || "Admin"}! Here's
                            your business summary.
                        </p>
                    </div>

                    <div className="flex items-center space-x-3 mt-4 md:mt-0">
                        {/* Time Frame Filter */}
                        <div className="relative">
                            <select
                                value={timeFrame}
                                onChange={(e) => setTimeFrame(e.target.value)}
                                className="text-black appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm min-w-[140px]"
                            >
                                <option value="daily">Last 7 Days</option>
                                <option value="weekly">Last 4 Weeks</option>
                                <option value="monthly">This Year</option>
                            </select>
                            <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        title="Total Revenue"
                        value={`RM ${dashboardData.overview.totalRevenue.toLocaleString()}`}
                        trend="up"
                        icon={
                            <FaDollarSign className="w-6 h-6 text-green-600" />
                        }
                        color="bg-green-50"
                        link={route("list-transaction")}
                    />

                    <StatCard
                        title="Total Orders"
                        value={dashboardData.overview.totalOrders}
                        trend="up"
                        icon={
                            <FaShoppingCart className="w-6 h-6 text-blue-600" />
                        }
                        color="bg-blue-50"
                        link={route("list-transaction")}
                    />

                    <StatCard
                        title="Total Customers"
                        value={dashboardData.overview.totalCustomers}
                        trend="up"
                        icon={<FaUsers className="w-6 h-6 text-purple-600" />}
                        color="bg-purple-50"
                        link={route("user-management")}
                    />

                    <StatCard
                        title="Pending Sellers"
                        value={dashboardData.overview.pendingSellers}
                        trend={
                            dashboardData.changes?.sellers >= 0 ? "up" : "down"
                        }
                        icon={
                            <FaUserCheck className="w-6 h-6 text-orange-600" />
                        }
                        color="bg-orange-50"
                        link={route("pending-seller-list")}
                    />
                </div>

                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Revenue Analytics
                            </h2>
                            <p className="text-gray-600 text-sm mt-1">
                                {timeFrame === "daily" && "Last 7 days revenue"}
                                {timeFrame === "weekly" &&
                                    "Last 4 weeks revenue"}
                                {timeFrame === "monthly" &&
                                    "Year-to-date revenue"}
                            </p>
                        </div>
                    </div>

                    <div className="h-64">
                        <Bar data={getChartData()} options={chartOptions} />
                    </div>
                </div>

                {/* Recent Activities & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activities */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Recent Activities
                            </h2>
                            <Link
                                href={route("list-transaction")}
                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {dashboardData.recentActivities?.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <div className="flex items-start space-x-3 flex-1">
                                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mt-1">
                                            <FaShoppingCart className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-800 leading-tight">
                                                <span className="font-medium">
                                                    {activity.user}
                                                </span>{" "}
                                                {activity.action}{" "}
                                                <span className="font-medium">
                                                    {activity.target}
                                                </span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900 whitespace-nowrap ml-4">
                                        {activity.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Link
                                href={route("pending-seller-list")}
                                className="p-4 bg-indigo-50 rounded-lg text-center hover:bg-indigo-100 transition-colors group border border-indigo-100"
                            >
                                <FaUserCheck className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                                <span className="text-sm font-medium text-gray-800 block">
                                    Seller Requests
                                </span>
                                <span className="text-xs text-gray-600 mt-1">
                                    {dashboardData.overview.pendingSellers}{" "}
                                    pending
                                </span>
                            </Link>

                            <Link
                                href={route("list-transaction")}
                                className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors group border border-green-100"
                            >
                                <FaShoppingCart className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                <span className="text-sm font-medium text-gray-800 block">
                                    Transactions
                                </span>
                                <span className="text-xs text-gray-600 mt-1">
                                    {dashboardData.overview.totalOrders} orders
                                </span>
                            </Link>

                            <Link
                                href={route("user-management")}
                                className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors group border border-purple-100"
                            >
                                <FaUsers className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                <span className="text-sm font-medium text-gray-800 block">
                                    Users
                                </span>
                                <span className="text-xs text-gray-600 mt-1">
                                    {dashboardData.overview.totalCustomers}{" "}
                                    total
                                </span>
                            </Link>

                            <Link
                                href={route("product-moderation")}
                                className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors group border border-blue-100"
                            >
                                <FaBox className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                <span className="text-sm font-medium text-gray-800 block">
                                    Products
                                </span>
                                <span className="text-xs text-gray-600 mt-1">
                                    Manage catalog
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
