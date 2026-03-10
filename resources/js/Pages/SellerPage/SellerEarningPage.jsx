import React, { useState, useEffect } from "react";
import {
    DollarSign,
    Calendar,
    Clock,
    TrendingUp,
    Download,
    RefreshCw,
    Package,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    FileText,
    X,
} from "lucide-react";
import { SellerSidebar } from "@/Components/SellerPage/SellerSidebar";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import axios from "axios";
import dayjs from "dayjs";
import { usePage } from "@inertiajs/react";

export default function EarningsPage() {
    const [filter, setFilter] = useState("daily");
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});

    const [showReportModal, setShowReportModal] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    // Report configuration state
    const [reportConfig, setReportConfig] = useState({
        period: "monthly",
        startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
        endDate: dayjs().format("YYYY-MM-DD"),
        format: "pdf",
        includeChart: true,
        includeTransactions: true,
    });

    const [earningsData, setEarningsData] = useState({
        total: 0,
        pending: 0,
        thisMonth: 0,
        lastMonth: 0,
        today: 0,
    });

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: "Earnings (RM)",
                data: [],
                fill: true,
                backgroundColor: "rgba(34,197,94,0.2)",
                borderColor: "rgba(34,197,94,1)",
                tension: 0.3,
            },
        ],
    });

    const [transactions, setTransactions] = useState([]);

    const { auth } = usePage().props;

    // Fetch earnings data
    const fetchEarningsData = async (page = 1, chartFilter = filter) => {
        try {
            setIsLoading(true);
            const response = await axios.get(route("earnings"), {
                params: {
                    page: page,
                    filter: chartFilter,
                },
                headers: {
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
            });

            const data = response.data;

            setEarningsData({
                total: data.total_earnings || 0,
                pending: data.pending_payouts || 0,
                thisMonth: data.this_month || 0,
                lastMonth: data.last_month || 0,
                today: data.today || 0,
            });

            // Update chart data
            if (data.chart_data) {
                setChartData({
                    labels: data.chart_data.labels || [],
                    datasets: [
                        {
                            label: "Earnings (RM)",
                            data: data.chart_data.data || [],
                            fill: true,
                            backgroundColor: "rgba(34,197,94,0.2)",
                            borderColor: "rgba(34,197,94,1)",
                            tension: 0.3,
                        },
                    ],
                });
            }

            // Update transactions and pagination
            if (data.recent_transactions) {
                setTransactions(data.recent_transactions);
            }

            if (data.pagination) {
                setPagination(data.pagination);
            }

            setCurrentPage(page);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Error fetching earnings data:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchEarningsData(1, filter);
    }, []);

    // Fetch data when filter changes
    useEffect(() => {
        fetchEarningsData(1, filter);
    }, [filter]);

    // Real-time updates for new completed orders
    useEffect(() => {
        if (!auth?.user?.seller_id || !window.Echo) return;

        const channel = window.Echo.private(
            `seller.earnings.${auth.user.seller_id}`
        );

        // Listen for new completed orders
        channel.listen(".order.completed", (e) => {
            console.log("💰 New completed order received:", e);

            // Refresh earnings data
            fetchEarningsData(currentPage, filter);

            // Show notification
            showEarningNotification(
                `💰 New earning: RM ${parseFloat(
                    e.order.total_amount || 0
                ).toFixed(2)} from order ${e.order.order_id}`
            );
        });

        // Listen for order status updates that affect earnings
        channel.listen(".order.status.updated", (e) => {
            if (e.order.status === "Delivered") {
                console.log("🔄 Order delivered, updating earnings:", e);
                fetchEarningsData(currentPage, filter);
            }
        });

        return () => {
            channel.stopListening(".order.completed");
            channel.stopListening(".order.status.updated");
            window.Echo.leaveChannel(`seller.earnings.${auth.user.seller_id}`);
        };
    }, [auth?.user?.seller_id, currentPage, filter]);

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            fetchEarningsData(currentPage, filter);
        }, 300000); // 5 minutes

        return () => clearInterval(interval);
    }, [currentPage, filter]);

    const showEarningNotification = (message) => {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("New Earning Received", {
                body: message,
                icon: "/icon.png",
            });
        }
        console.log("Earning Notification:", message);
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchEarningsData(currentPage, filter);
    };

    // Enhanced Report Generation Function
    const generateIncomeReport = async () => {
        try {
            setIsGeneratingReport(true);

            const response = await axios.post(
                route("generate-report"),
                reportConfig,
                {
                    headers: {
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            .getAttribute("content"),
                    },
                    responseType: "blob",
                }
            );

            // Create blob from response
            const blob = new Blob([response.data], {
                type: response.headers["content-type"],
            });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;

            // Set filename based on format and period
            const periodLabel =
                reportConfig.period === "custom"
                    ? `${dayjs(reportConfig.startDate).format(
                          "YYYY-MM-DD"
                      )}-to-${dayjs(reportConfig.endDate).format("YYYY-MM-DD")}`
                    : reportConfig.period;

            a.download = `income-report-${periodLabel}-${dayjs().format(
                "YYYY-MM-DD"
            )}.${reportConfig.format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            setShowReportModal(false);
        } catch (error) {
            console.error("Error generating report:", error);
            alert("Failed to generate report. Please try again.");
        } finally {
            setIsGeneratingReport(false);
        }
    };

    // Handle period change to auto-set dates
    const handlePeriodChange = (period) => {
        const newConfig = { ...reportConfig, period };

        switch (period) {
            case "weekly":
                newConfig.startDate = dayjs()
                    .startOf("week")
                    .format("YYYY-MM-DD");
                newConfig.endDate = dayjs().format("YYYY-MM-DD");
                break;
            case "monthly":
                newConfig.startDate = dayjs()
                    .startOf("month")
                    .format("YYYY-MM-DD");
                newConfig.endDate = dayjs().format("YYYY-MM-DD");
                break;
            case "quarterly":
                newConfig.startDate = dayjs()
                    .startOf("quarter")
                    .format("YYYY-MM-DD");
                newConfig.endDate = dayjs().format("YYYY-MM-DD");
                break;
            case "yearly":
                newConfig.startDate = dayjs()
                    .startOf("year")
                    .format("YYYY-MM-DD");
                newConfig.endDate = dayjs().format("YYYY-MM-DD");
                break;
            case "custom":
                // Keep existing dates for custom
                break;
        }

        setReportConfig(newConfig);
    };

    // Pagination functions
    const nextPage = () => {
        if (currentPage < pagination.last_page) {
            fetchEarningsData(currentPage + 1, filter);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            fetchEarningsData(currentPage - 1, filter);
        }
    };

    const goToPage = (page) => {
        fetchEarningsData(page, filter);
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        const current = pagination.current_page || currentPage;
        const last = pagination.last_page || 1;

        if (last <= 1) return [1];
        if (last <= maxVisiblePages) {
            for (let i = 1; i <= last; i++) {
                pages.push(i);
            }
        } else {
            const startPage = Math.max(1, current - 2);
            const endPage = Math.min(last, current + 2);

            if (startPage > 1) pages.push(1);
            if (startPage > 2) pages.push("...");

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            if (endPage < last - 1) pages.push("...");
            if (endPage < last) pages.push(last);
        }

        return pages;
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: `Earnings Overview - ${
                    filter.charAt(0).toUpperCase() + filter.slice(1)
                }`,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return "RM " + value;
                    },
                },
            },
        },
    };

    // Report Modal Component
    const ReportModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-bold text-gray-900">
                        Generate Income Report
                    </h3>
                    <button
                        onClick={() => setShowReportModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Report Period */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Report Period
                        </label>
                        <select
                            value={reportConfig.period}
                            onChange={(e) => handlePeriodChange(e.target.value)}
                            className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="weekly">Last 7 Days</option>
                            <option value="monthly">This Month</option>
                            <option value="yearly">This Year</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    {/* Custom Date Range */}
                    {reportConfig.period === "custom" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={reportConfig.startDate}
                                    onChange={(e) =>
                                        setReportConfig({
                                            ...reportConfig,
                                            startDate: e.target.value,
                                        })
                                    }
                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={reportConfig.endDate}
                                    onChange={(e) =>
                                        setReportConfig({
                                            ...reportConfig,
                                            endDate: e.target.value,
                                        })
                                    }
                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* Report Format */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Format
                        </label>
                        <select
                            value={reportConfig.format}
                            onChange={(e) =>
                                setReportConfig({
                                    ...reportConfig,
                                    format: e.target.value,
                                })
                            }
                            className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="pdf">PDF Document</option>
                        </select>
                    </div>

                    {/* Additional Options */}
                    <div className="space-y-3">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={reportConfig.includeChart}
                                onChange={(e) =>
                                    setReportConfig({
                                        ...reportConfig,
                                        includeChart: e.target.checked,
                                    })
                                }
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                Include Earnings Chart
                            </span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={reportConfig.includeTransactions}
                                onChange={(e) =>
                                    setReportConfig({
                                        ...reportConfig,
                                        includeTransactions: e.target.checked,
                                    })
                                }
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                Include Transaction Details
                            </span>
                        </label>
                    </div>
                </div>

                <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-lg">
                    <button
                        onClick={() => setShowReportModal(false)}
                        className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={generateIncomeReport}
                        disabled={isGeneratingReport}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {isGeneratingReport ? (
                            <RefreshCw size={16} className="animate-spin" />
                        ) : (
                            <FileText size={16} />
                        )}
                        {isGeneratingReport
                            ? "Generating..."
                            : "Generate Report"}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <SellerSidebar />

            <main className="flex-1 p-3 sm:p-4 lg:p-6 lg:ml-0 min-w-0">
                {/* Page Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 mt-20 md:mt-0 sm:mb-6">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                            Earnings Dashboard
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                            Track your earnings in real-time
                            {lastUpdated && (
                                <span className="ml-1 sm:ml-2">
                                    • Last updated:{" "}
                                    {dayjs(lastUpdated).format("h:mm A")}
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 mt-3 lg:mt-0">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing || isLoading}
                            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            <RefreshCw
                                size={16}
                                className={isRefreshing ? "animate-spin" : ""}
                            />
                            <span className="hidden xs:inline">
                                {isRefreshing ? "Refreshing..." : "Refresh"}
                            </span>
                        </button>
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                        >
                            <FileText size={16} />
                            <span className="hidden sm:inline">
                                Generate Report
                            </span>
                        </button>
                    </div>
                </div>

                {/* Earnings Summary - Enhanced Responsive Grid */}
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
                    {[
                        {
                            key: "total",
                            label: "Total Earnings",
                            color: "green",
                            icon: DollarSign,
                        },
                        {
                            key: "pending",
                            label: "Pending Payouts",
                            color: "yellow",
                            icon: Clock,
                        },
                        {
                            key: "thisMonth",
                            label: "This Month",
                            color: "blue",
                            icon: Calendar,
                        },
                        {
                            key: "lastMonth",
                            label: "Last Month",
                            color: "purple",
                            icon: TrendingUp,
                        },
                        {
                            key: "today",
                            label: "Today",
                            color: "green",
                            icon: Package,
                        },
                    ].map((stat) => {
                        const IconComponent = stat.icon;
                        return (
                            <div
                                key={stat.key}
                                className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`p-2 bg-${stat.color}-100 rounded-full flex-shrink-0`}
                                    >
                                        <IconComponent
                                            className={`text-${stat.color}-600`}
                                            size={18}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs sm:text-sm text-gray-500 mb-1 truncate">
                                            {stat.label}
                                        </div>
                                        <div
                                            className={`text-base sm:text-lg font-bold ${
                                                stat.key === "total"
                                                    ? "text-green-500"
                                                    : stat.key === "thisMonth"
                                                    ? "text-blue-400"
                                                    : stat.key === "today"
                                                    ? "text-orange-400"
                                                    : "text-gray-900"
                                            }`}
                                        >
                                            RM{" "}
                                            {earningsData[stat.key] || "0.00"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Earnings Chart */}
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border mb-4 sm:mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2 lg:mb-0">
                            Earnings Overview
                        </h2>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-3 py-2 w-52 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="daily">Daily (Last 7 Days)</option>
                            <option value="monthly">
                                Monthly (Last 6 Months)
                            </option>
                            <option value="yearly">
                                Yearly (Last 5 Years)
                            </option>
                        </select>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48 sm:h-64">
                            <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-green-600" />
                        </div>
                    ) : (
                        <div className="h-48 sm:h-64 lg:h-80">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    )}
                </div>

                {/* Recent Transactions */}
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-0">
                            Recent Transactions
                        </h2>
                        <span className="text-xs sm:text-sm text-gray-500">
                            {pagination.total || 0} transactions total
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <RefreshCw className="h-6 w-6 animate-spin text-green-600" />
                        </div>
                    ) : transactions.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <div className="min-w-[600px] sm:min-w-0">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-700 text-xs">
                                            <tr>
                                                <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">
                                                    Date
                                                </th>
                                                <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">
                                                    Order Ref
                                                </th>
                                                <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap hidden sm:table-cell">
                                                    Product
                                                </th>
                                                <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">
                                                    Amount
                                                </th>
                                                <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {transactions.map((tx) => (
                                                <tr
                                                    key={tx.order_id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-3 sm:px-4 py-3 text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                                                        {dayjs(tx.date).format(
                                                            "DD MMM YYYY"
                                                        )}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-3 font-mono text-xs text-gray-900 whitespace-nowrap">
                                                        {tx.ref}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-3 text-gray-700 text-xs sm:text-sm hidden sm:table-cell">
                                                        <span className="truncate max-w-[150px] inline-block">
                                                            {tx.product_name}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-3 font-medium text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                                                        RM{" "}
                                                        {parseFloat(
                                                            tx.amount
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-3">
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                                tx.order_status ===
                                                                "Completed"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-yellow-100 text-yellow-700"
                                                            }`}
                                                        >
                                                            {(tx.order_status ===
                                                                "Delivered" ||
                                                                tx.payment_status ===
                                                                    "Paid") && (
                                                                <CheckCircle
                                                                    size={12}
                                                                />
                                                            )}
                                                            {tx.payment_status ||
                                                                tx.order_status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination */}
                            {pagination.last_page > 1 && (
                                <div className="px-3 sm:px-4 py-4 bg-gray-50 border-t border-gray-200 mt-4">
                                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                                        <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                                            Showing{" "}
                                            <span className="font-medium">
                                                {pagination.from || 1}
                                            </span>{" "}
                                            to{" "}
                                            <span className="font-medium">
                                                {pagination.to ||
                                                    transactions.length}
                                            </span>{" "}
                                            of{" "}
                                            <span className="font-medium">
                                                {pagination.total || 0}
                                            </span>{" "}
                                            results
                                        </div>

                                        <div className="flex items-center space-x-1 flex-wrap justify-center">
                                            <button
                                                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
                                                onClick={prevPage}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft size={14} />
                                                Previous
                                            </button>

                                            {getPageNumbers().map(
                                                (page, index) => (
                                                    <button
                                                        key={index}
                                                        className={`px-2 sm:px-3 py-1.5 rounded-md border transition-colors text-xs sm:text-sm ${
                                                            page === currentPage
                                                                ? "bg-green-600 text-white border-green-600"
                                                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                                        } ${
                                                            page === "..."
                                                                ? "cursor-default"
                                                                : ""
                                                        }`}
                                                        onClick={() =>
                                                            goToPage(page)
                                                        }
                                                        disabled={
                                                            page === "..."
                                                        }
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            )}

                                            <button
                                                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
                                                onClick={nextPage}
                                                disabled={
                                                    currentPage >=
                                                    pagination.last_page
                                                }
                                            >
                                                Next
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Package
                                size={40}
                                className="mx-auto mb-4 text-gray-300"
                            />
                            <p className="text-sm sm:text-base">
                                No transactions found
                            </p>
                            <p className="text-xs sm:text-sm mt-1">
                                Your earnings will appear here when you complete
                                orders
                            </p>
                        </div>
                    )}
                </div>

                {/* Report Modal */}
                {showReportModal && <ReportModal />}
            </main>
        </div>
    );
}
