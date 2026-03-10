import { useState, useEffect } from "react";

import {
    ChevronLeft,
    ChevronRight,
    Package,
    Truck,
    CheckCircle,
    DollarSign,
    Clock,
    Eye,
    RefreshCw,
} from "lucide-react";

import { Sidebar } from "@/Components/AdminPage/Sidebar";
import { StatsOverview } from "@/Components/AdminPage/Transactions/StatsOverview";
import { FilterSection } from "@/Components/AdminPage/Transactions/FilterSection";
import { TransactionRow } from "@/Components/AdminPage/Transactions/TransactionRow";

import dayjs from "dayjs";

import axios from "axios";

import Swal from "sweetalert2";

import { OrderTrackingModal } from "@/Components/AdminPage/Transactions/OrderTrackingModal";

export default function Transactions({ list_transactions }) {
    const [transactions, setTransactions] = useState(
        list_transactions.data || []
    );
    const [pagination, setPagination] = useState({
        current_page: list_transactions.current_page || 1,
        last_page: list_transactions.last_page || 1,
        per_page: list_transactions.per_page || 5,
        total: list_transactions.total || 0,
        from: list_transactions.from || 0,
        to: list_transactions.to || 0,
    });
    const [filter, setFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showOrderTrackingModal, setShowOrderTrackingModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [paginationLoading, setPaginationLoading] = useState(false);
    const [metricsLoading, setMetricsLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const [metrics, setMetrics] = useState({
        totalRevenue: 0,
        completedTransactions: 0,
        pendingRelease: 0,
        releasedPayments: 0,
        totalAmountPending: 0,
    });

    // SweetAlert notification function
    const showNotification = (title, message, type = "info") => {
        const toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            },
        });

        toast.fire({
            icon: type,
            title: title,
            text: message,
        });
    };

    // SweetAlert confirmation dialog
    const showConfirmation = (title, text, confirmButtonText = "Confirm") => {
        return Swal.fire({
            title: title,
            text: text,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: confirmButtonText,
            cancelButtonText: "Cancel",
            customClass: {
                popup: "rounded-2xl",
                confirmButton: "px-6 py-3 rounded-lg font-medium",
                cancelButton:
                    "px-6 py-3 rounded-lg font-medium border border-gray-300 text-white hover:bg-red-500",
            },
        });
    };

    // SweetAlert success message
    const showSuccess = (title, message) => {
        Swal.fire({
            title: title,
            text: message,
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#10b981",
            customClass: {
                popup: "rounded-2xl",
                confirmButton: "px-6 py-3 rounded-lg font-medium",
            },
        });
    };

    // SweetAlert error message
    const showError = (title, message) => {
        Swal.fire({
            title: title,
            text: message,
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#ef4444",
            customClass: {
                popup: "rounded-2xl",
                confirmButton: "px-6 py-3 rounded-lg font-medium",
            },
        });
    };

    // SweetAlert loading state
    const showLoading = (title, message = "") => {
        Swal.fire({
            title: title,
            text: message,
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });
    };

    // Fetch metrics data
    const fetchMetrics = async (filters = {}) => {
        setMetricsLoading(true);
        try {
            const params = new URLSearchParams({
                ...filters,
                metrics_only: "true",
            });

            const response = await axios.get(
                `/api/transactions/metrics?${params}`
            );

            if (response.data.success) {
                setMetrics(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching metrics:", error);
        } finally {
            setMetricsLoading(false);
        }
    };

    // Fetch paginated data with filters
    const fetchTransactions = async (page = 1, filters = {}) => {
        setPaginationLoading(true);
        try {
            const params = new URLSearchParams({
                page: page,
                per_page: pagination.per_page,
                ...filters,
            });

            const response = await axios.get(`/api/transactions?${params}`);

            if (response.data.success) {
                const data = response.data.data;
                setTransactions(data.data || []);
                setPagination({
                    current_page: data.current_page,
                    last_page: data.last_page,
                    per_page: data.per_page,
                    total: data.total,
                    from: data.from,
                    to: data.to,
                });
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
            showNotification(
                "❌ Error",
                "Failed to load transactions",
                "error"
            );
        } finally {
            setPaginationLoading(false);
        }
    };

    // Build filters object
    const buildFilters = () => {
        const filters = {};
        if (filter) filters.search = filter;
        if (statusFilter !== "All") filters.status = statusFilter;
        if (paymentMethodFilter !== "All")
            filters.payment_method = paymentMethodFilter;
        if (dateRange.start) filters.start_date = dateRange.start;
        if (dateRange.end) filters.end_date = dateRange.end;
        return filters;
    };

    // Load both metrics and transactions with filters
    const loadDataWithFilters = async (page = 1) => {
        const filters = buildFilters();

        // Fetch both metrics and transactions in parallel
        await Promise.all([
            fetchMetrics(filters),
            fetchTransactions(page, filters),
        ]);
    };

    // Handle page change
    const handlePageChange = async (page) => {
        if (
            page < 1 ||
            page > pagination.last_page ||
            page === pagination.current_page
        ) {
            return;
        }
        await loadDataWithFilters(page);
    };

    // Clear all filters
    const clearAllFilters = () => {
        setFilter("");
        setStatusFilter("All");
        setPaymentMethodFilter("All");
        setDateRange({ start: "", end: "" });
    };

    // Check if any filter is active
    const hasActiveFilters = () => {
        return (
            filter ||
            statusFilter !== "All" ||
            paymentMethodFilter !== "All" ||
            dateRange.start ||
            dateRange.end
        );
    };

    // Generate page numbers for pagination
    const generatePageNumbers = () => {
        const pages = [];
        const current = pagination.current_page;
        const last = pagination.last_page;
        const delta = 2;

        for (let i = 1; i <= last; i++) {
            if (
                i === 1 ||
                i === last ||
                (i >= current - delta && i <= current + delta)
            ) {
                pages.push(i);
            } else if (i === current - delta - 1 || i === current + delta + 1) {
                pages.push("...");
            }
        }

        return pages.filter((page, index, array) => {
            return !(page === "..." && array[index - 1] === "...");
        });
    };

    const autoReleasePayment = async (orderId) => {
        setActionLoading(orderId);
        try {
            const response = await axios.post(
                `/api/transactions/${orderId}/release-payment`
            );

            if (response.data.success) {
                await loadDataWithFilters(pagination.current_page);
                showSuccess(
                    "💰 Payment Released",
                    `Payment successfully released to seller for order ${orderId}`
                );
                return true;
            } else {
                Swal.close();
                showError(
                    "❌ Release Failed",
                    response.data.message || "Failed to release payment"
                );
                return false;
            }
        } catch (error) {
            console.error("Error releasing payment:", error);
            Swal.close();
            showError("❌ Error", "Error releasing payment. Please try again.");
            return false;
        } finally {
            setActionLoading(null);
        }
    };

    const manualReleasePayment = async (orderId) => {
        const transaction = transactions.find((t) => t.order_id === orderId);
        if (!transaction) return;

        const sellerEarning = transaction.seller_earning[0];
        const payoutAmount = sellerEarning?.payout_amount || transaction.amount;

        const result = await showConfirmation(
            "Release Payment",
            `Are you sure you want to release RM ${parseFloat(
                payoutAmount
            ).toFixed(2)} to ${transaction.seller?.seller_name}?`,
            "Release Payment"
        );

        if (result.isConfirmed) {
            await autoReleasePayment(orderId);
        }
    };

    const showOrderTracking = async (transaction) => {
        try {
            showLoading("Loading", "Fetching order tracking information...");

            const response = await fetch(
                `/api/transactions/${transaction.order.order_id}/tracking`
            );
            const result = response.data;

            Swal.close();

            if (result.success) {
                setSelectedTransaction({
                    ...transaction,
                    tracking_info: result.data,
                });
            } else {
                setSelectedTransaction(transaction);
            }
            setShowOrderTrackingModal(true);
        } catch (error) {
            console.error("Error fetching tracking info:", error);
            Swal.close();
            setSelectedTransaction(transaction);
            setShowOrderTrackingModal(true);
        }
    };

    const orderStatusSteps = [
        { status: "Pending", icon: Clock, description: "Order placed" },
        {
            status: "Processing",
            icon: Package,
            description: "Seller processing order",
        },
        {
            status: "Shipped",
            icon: Truck,
            description: "Order shipped to buyer",
        },
        {
            status: "Delivered",
            icon: CheckCircle,
            description: "Order delivered to buyer",
        },
        {
            status: "Completed",
            icon: CheckCircle,
            description: "Buyer received order - Waiting for confirmation",
        },
        {
            status: "Released",
            icon: DollarSign,
            description: "Payment released to seller",
        },
    ];

    // Handle filter changes with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadDataWithFilters(1);
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [filter, statusFilter, paymentMethodFilter, dateRange]);

    // Check mobile view on mount and resize
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <main
                className={`flex-1 p-4 min-w-0 w-full ${
                    isMobile ? "pt-20" : "p-4 lg:p-6"
                }`}
            >
                <StatsOverview
                    metrics={metrics}
                    metricsLoading={metricsLoading}
                    isMobile={isMobile}
                />

                {/* Quick Actions - Simplified for mobile */}
                {!isMobile && (
                    <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-blue-200">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    Payment Release Center
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {metrics.pendingRelease > 0
                                        ? `${
                                              metrics.pendingRelease
                                          } orders ready for release (RM ${metrics.totalAmountPending.toFixed(
                                              2
                                          )})`
                                        : "No payments pending release"}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    onClick={() => {
                                        setStatusFilter("paid");
                                        setFilter("");
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                    <Eye size={16} />
                                    View Pending
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Filter Section */}
                <FilterSection
                    clearAllFilters={clearAllFilters}
                    dateRange={dateRange}
                    filter={filter}
                    hasActiveFilters={hasActiveFilters}
                    paymentMethodFilter={paymentMethodFilter}
                    setDateRange={setDateRange}
                    setFilter={setFilter}
                    setPaymentMethodFilter={setPaymentMethodFilter}
                    setShowFilters={setShowFilters}
                    setStatusFilter={setStatusFilter}
                    showFilters={showFilters}
                    statusFilter={statusFilter}
                />

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Header */}
                    <div className="p-4 lg:p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
                                    {isMobile
                                        ? "Transactions"
                                        : "Transaction Management"}
                                </h2>
                                <p className="text-gray-600 text-sm lg:text-base">
                                    {isMobile
                                        ? "Manage payments"
                                        : "Manage payments and track order status"}
                                </p>
                            </div>
                            <div className="text-sm text-gray-600">
                                Showing {pagination.from} to {pagination.to} of{" "}
                                {pagination.total} transactions
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {paginationLoading && (
                        <div className="flex justify-center items-center py-8">
                            <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
                            <span className="ml-2 text-gray-600">
                                Loading...
                            </span>
                        </div>
                    )}

                    {!paginationLoading && transactions.length === 0 && (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No transactions found
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {hasActiveFilters()
                                    ? "Try adjusting your filters"
                                    : "No transactions available"}
                            </p>
                            {hasActiveFilters() && (
                                <button
                                    onClick={clearAllFilters}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}

                    {!paginationLoading && transactions.length > 0 && (
                        <>
                            {/* Mobile View */}
                            {isMobile ? (
                                <div className="p-4">
                                    {transactions.map((transaction) => (
                                        <TransactionRow
                                            key={transaction.order_id}
                                            transaction={transaction}
                                            showOrderTracking={
                                                showOrderTracking
                                            }
                                            manualReleasePayment={
                                                manualReleasePayment
                                            }
                                            actionLoading={actionLoading}
                                        />
                                    ))}
                                </div>
                            ) : (
                                /* Desktop Table View */
                                <div className="w-full overflow-x-auto">
                                    <table className="w-full min-w-[1000px] divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Order Info
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Payout Amount
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Order Status
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Payment Status
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {transactions.map((transaction) => (
                                                <tr
                                                    key={transaction.order_id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-4 py-4">
                                                        <div className="font-mono text-sm font-medium text-gray-900">
                                                            {
                                                                transaction.order_id
                                                            }
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {
                                                                transaction.user
                                                                    ?.name
                                                            }{" "}
                                                            →{" "}
                                                            {
                                                                transaction
                                                                    .seller
                                                                    ?.seller_name
                                                            }
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {dayjs(
                                                                transaction.created_at
                                                            ).format(
                                                                "DD MMM YYYY, HH:mm"
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            RM{" "}
                                                            {transaction
                                                                .seller_earning[0]
                                                                ?.payout_amount ||
                                                                0}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                transaction.order_status ===
                                                                "Completed"
                                                                    ? "bg-green-100 text-green-800 border border-green-200"
                                                                    : "bg-yellow-200 text-yellow-900 border border-yellow-300"
                                                            }`}
                                                        >
                                                            {
                                                                transaction.order_status
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={`text-sm font-bold ${
                                                                transaction
                                                                    ?.seller_earning?.[0]
                                                                    ?.status ===
                                                                "Released"
                                                                    ? "text-green-800"
                                                                    : transaction
                                                                          ?.seller_earning?.[0]
                                                                          ?.status ===
                                                                      "Pending"
                                                                    ? "text-yellow-500"
                                                                    : "text-gray-500"
                                                            }`}
                                                        >
                                                            {transaction
                                                                ?.seller_earning?.[0]
                                                                ?.status ||
                                                                "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    showOrderTracking(
                                                                        transaction
                                                                    )
                                                                }
                                                                className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                                                                title="Track Order"
                                                            >
                                                                <Eye
                                                                    size={16}
                                                                />
                                                            </button>
                                                            {transaction.order_status ===
                                                                "Completed" &&
                                                                transaction
                                                                    ?.seller_earning[0]
                                                                    ?.status ===
                                                                    "Pending" && (
                                                                    <button
                                                                        onClick={() =>
                                                                            manualReleasePayment(
                                                                                transaction.order_id
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            actionLoading ===
                                                                            transaction.order_id
                                                                        }
                                                                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-xs"
                                                                    >
                                                                        {actionLoading ===
                                                                        transaction.order_id ? (
                                                                            <RefreshCw
                                                                                size={
                                                                                    12
                                                                                }
                                                                                className="animate-spin"
                                                                            />
                                                                        ) : (
                                                                            <DollarSign
                                                                                size={
                                                                                    12
                                                                                }
                                                                            />
                                                                        )}
                                                                        Release
                                                                    </button>
                                                                )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {pagination.last_page > 1 && (
                                <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                        <div className="text-sm text-gray-700">
                                            Showing {pagination.from} to{" "}
                                            {pagination.to} of{" "}
                                            {pagination.total}
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() =>
                                                    handlePageChange(
                                                        pagination.current_page -
                                                            1
                                                    )
                                                }
                                                disabled={
                                                    pagination.current_page ===
                                                    1
                                                }
                                                className={`p-2 rounded-md ${
                                                    pagination.current_page ===
                                                    1
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>

                                            {generatePageNumbers().map(
                                                (page, index) =>
                                                    page === "..." ? (
                                                        <span
                                                            key={`ellipsis-${index}`}
                                                            className="px-2 text-gray-500"
                                                        >
                                                            ...
                                                        </span>
                                                    ) : (
                                                        <button
                                                            key={page}
                                                            onClick={() =>
                                                                handlePageChange(
                                                                    page
                                                                )
                                                            }
                                                            className={`px-3 py-1.5 rounded-md text-sm ${
                                                                page ===
                                                                pagination.current_page
                                                                    ? "bg-indigo-600 text-white"
                                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    )
                                            )}

                                            <button
                                                onClick={() =>
                                                    handlePageChange(
                                                        pagination.current_page +
                                                            1
                                                    )
                                                }
                                                disabled={
                                                    pagination.current_page ===
                                                    pagination.last_page
                                                }
                                                className={`p-2 rounded-md ${
                                                    pagination.current_page ===
                                                    pagination.last_page
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Order Tracking Modal */}
                {showOrderTrackingModal && selectedTransaction && (
                    <OrderTrackingModal
                        manualReleasePayment={manualReleasePayment}
                        selectedTransaction={selectedTransaction}
                        setShowOrderTrackingModal={setShowOrderTrackingModal}
                        orderStatusSteps={orderStatusSteps}
                    />
                )}
            </main>
        </div>
    );
}
