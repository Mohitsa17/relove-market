import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    Search,
    Eye,
    Truck,
    CheckCircle,
    XCircle,
    Printer,
    Package,
    ChevronDown,
    ChevronUp,
    BarChart3,
    RefreshCw,
    X,
    DollarSign,
    ChevronRight,
} from "lucide-react";

import axios from "axios";
import dayjs from "dayjs";
import { usePage } from "@inertiajs/react";

import PrintableInvoice from "@/Components/SellerPage/SellerOrderPage/PrintableInvoice";
import { SellerSidebar } from "@/Components/SellerPage/SellerSidebar";
import { OrderDetails } from "@/Components/SellerPage/SellerOrderPage/OrderDetails";

export default function SellerOrderPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusPopupOrder, setStatusPopupOrder] = useState(null);
    const [viewOrder, setViewOrder] = useState(false);
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [allSearchResults, setAllSearchResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [orders, setOrders] = useState([]);
    const [newOrders, setNewOrders] = useState(new Set());
    const [statusCounts, setStatusCounts] = useState({
        All: 0,
        Pending: 0,
        Processing: 0,
        Shipped: 0,
        Delivered: 0,
        Completed: 0,
        Cancelled: 0,
    });
    const [totalAmounts, setTotalAmounts] = useState({
        All: 0,
        Pending: 0,
        Processing: 0,
        Shipped: 0,
        Delivered: 0,
        Completed: 0,
        Cancelled: 0,
    });
    const printRef = useRef();
    const [orderToPrint, setOrderToPrint] = useState(null);

    const { auth } = usePage().props;

    // Real-time updates
    useEffect(() => {
        if (!auth?.user?.seller_id || !window.Echo) return;

        const channel = window.Echo.private(
            `seller.orders.${auth.user.seller_id}`
        );

        channel.listen(".new.order.created", (e) => {
            const orderId = e.order.order_id;
            setNewOrders((prev) => {
                const newSet = new Set(prev);
                newSet.add(orderId);
                return newSet;
            });

            if (currentPage === 1) {
                fetchOrders(1, searchTerm, statusFilter, sortBy, sortOrder);
            } else {
                showNotification(
                    `🆕 New order received! Check page 1 to view it.`
                );
            }
        });

        return () => {
            channel.stopListening(".new.order.created");
            window.Echo.leaveChannel(`seller.orders.${auth.user.seller_id}`);
        };
    }, [
        auth?.user?.seller_id,
        currentPage,
        searchTerm,
        statusFilter,
        sortBy,
        sortOrder,
    ]);

    // Listen for order completion (triggered by buyer)
    useEffect(() => {
        if (!auth?.user?.seller_id || !window.Echo) return;

        const channel = window.Echo.private(
            `seller.orders.${auth.user.seller_id}`
        );

        // Listen for order completion (triggered by buyer confirmation)
        channel.listen(".order.completed", (e) => {
            showNotification(
                `💰 Order ${e.order.order_id} completed! Buyer confirmed receipt. RM ${e.order.seller_amount} released to your account.`
            );

            // Refresh orders and earnings data
            fetchOrders();
        });

        return () => {
            channel.stopListening(".order.completed");
        };
    }, [auth?.user?.seller_id]);

    // Remove new order badges after 30 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setNewOrders((prev) => {
                if (prev.size === 0) return prev;
                const newSet = new Set(prev);
                newSet.clear();
                return newSet;
            });
        }, 30000);

        return () => clearInterval(timer);
    }, []);

    const handlePrint = useCallback(() => {
        if (printRef.current) {
            const printWindow = window.open("", "_blank");
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Invoice - ${
                                orderToPrint?.order_id || "Invoice"
                            }</title>
                            <style>
                                body { margin: 0; padding: 20px; }
                                @media print {
                                    @page { margin: 0; }
                                    body { margin: 0.5cm; }
                                }
                            </style>
                        </head>
                        <body>
                            ${printRef.current.outerHTML}
                        </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.focus();

                setTimeout(() => {
                    printWindow.print();
                }, 500);
            }
        }
    }, [orderToPrint]);

    const showNotification = (message) => {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Order Update", {
                body: message,
                icon: "/icon.png",
            });
        }
    };

    const fetchOrders = async (
        page = currentPage,
        search = searchTerm,
        status = statusFilter,
        sort = sortBy,
        order = sortOrder
    ) => {
        try {
            setIsLoading(true);
            const response = await axios.get(route("list-order"), {
                params: {
                    page: page,
                    search: search,
                    status: status !== "All" ? status : "",
                    sort: sort,
                    order: order,
                },
                headers: {
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
            });

            const responseData = response.data;

            if (!responseData.success) {
                throw new Error(
                    responseData.message || "Failed to fetch orders"
                );
            }

            // Handle search mode with client-side pagination
            if (responseData.is_search && responseData.last_page === 1) {
                setAllSearchResults(responseData.data || []);
                setIsSearchMode(true);
                const startIndex = (currentPage - 1) * 5;
                const endIndex = startIndex + 5;
                const paginatedResults = responseData.data.slice(
                    startIndex,
                    endIndex
                );

                setOrders(paginatedResults);
                setPagination({
                    from: startIndex + 1,
                    to: Math.min(endIndex, responseData.data.length),
                    total: responseData.data.length,
                    current_page: currentPage,
                    last_page: Math.ceil(responseData.data.length / 5),
                });

                calculateStatusStats(responseData.data || []);
            } else {
                setAllSearchResults([]);
                setIsSearchMode(false);
                setOrders(responseData.data || []);
                setPagination({
                    from: responseData.from || 1,
                    to: responseData.to || 0,
                    total: responseData.total || 0,
                    current_page: responseData.current_page || 1,
                    last_page: responseData.last_page || 1,
                });

                if (responseData.total_counts && responseData.total_amounts) {
                    setStatusCounts(responseData.total_counts);
                    setTotalAmounts(responseData.total_amounts);
                } else {
                    calculateStatusStats(responseData.data || []);
                }
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const calculateStatusStats = (ordersData) => {
        const counts = {
            All: 0,
            Pending: 0,
            Processing: 0,
            Shipped: 0,
            Delivered: 0,
            Completed: 0,
            Cancelled: 0,
        };
        const amounts = {
            All: 0,
            Pending: 0,
            Processing: 0,
            Shipped: 0,
            Delivered: 0,
            Completed: 0,
            Cancelled: 0,
        };

        ordersData.forEach((order) => {
            const status = order.order_status || "Processing";
            const amount = parseFloat(order.total_amount || order.amount || 0);

            counts.All++;
            counts[status] = (counts[status] || 0) + 1;
            amounts.All += amount;
            amounts[status] = (amounts[status] || 0) + amount;
        });

        setStatusCounts(counts);
        setTotalAmounts(amounts);
    };

    // Initial fetch and filter effects
    useEffect(() => {
        fetchOrders(1);
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
            fetchOrders(1, searchTerm, statusFilter, sortBy, sortOrder);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
        fetchOrders(1, searchTerm, statusFilter, sortBy, sortOrder);
    }, [statusFilter, sortBy, sortOrder]);

    // Pagination controls (keep existing pagination code)
    const nextPage = () => {
        if (currentPage < pagination.last_page) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);

            if (isSearchMode && allSearchResults.length > 0) {
                const startIndex = (nextPage - 1) * 5;
                const endIndex = startIndex + 5;
                const paginatedResults = allSearchResults.slice(
                    startIndex,
                    endIndex
                );
                setOrders(paginatedResults);
                setPagination((prev) => ({
                    ...prev,
                    from: startIndex + 1,
                    to: Math.min(endIndex, allSearchResults.length),
                    current_page: nextPage,
                }));
            } else {
                fetchOrders(
                    nextPage,
                    searchTerm,
                    statusFilter,
                    sortBy,
                    sortOrder
                );
            }
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            const prevPage = currentPage - 1;
            setCurrentPage(prevPage);

            if (isSearchMode && allSearchResults.length > 0) {
                const startIndex = (prevPage - 1) * 5;
                const endIndex = startIndex + 5;
                const paginatedResults = allSearchResults.slice(
                    startIndex,
                    endIndex
                );
                setOrders(paginatedResults);
                setPagination((prev) => ({
                    ...prev,
                    from: startIndex + 1,
                    to: Math.min(endIndex, allSearchResults.length),
                    current_page: prevPage,
                }));
            } else {
                fetchOrders(
                    prevPage,
                    searchTerm,
                    statusFilter,
                    sortBy,
                    sortOrder
                );
            }
        }
    };

    const goToPage = (page) => {
        if (page !== "...") {
            setCurrentPage(page);
            fetchOrders(page, searchTerm, statusFilter, sortBy, sortOrder);
        }
    };

    // Update order status
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            // Remove new order badge when status is updated
            setNewOrders((prev) => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });

            // Optimistic update for current page orders only
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.order_id === orderId
                        ? { ...order, order_status: newStatus }
                        : order
                )
            );

            // API call
            const response = await axios.put(route("update-order", orderId), {
                status: newStatus,
            });

            if (!response.data.success) {
                // Revert if failed
                fetchOrders(
                    currentPage,
                    searchTerm,
                    statusFilter,
                    sortBy,
                    sortOrder
                );
            } else {
                // Refresh the data to get updated totals from server
                fetchOrders(
                    currentPage,
                    searchTerm,
                    statusFilter,
                    sortBy,
                    sortOrder
                );

                if (newStatus === "Delivered") {
                    showNotification(
                        "✅ Order marked as delivered! Waiting for buyer to confirm receipt and complete the order."
                    );
                }
                // Remove Completed notification since seller can't trigger it
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            fetchOrders(
                currentPage,
                searchTerm,
                statusFilter,
                sortBy,
                sortOrder
            );
        }
    };

    // Status Button Component
    const StatusButton = ({ order, onEditClick }) => {
        const statusOptions = [
            {
                value: "Pending",
                label: "Pending",
                color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                icon: Clock,
                description: "Order received, awaiting processing",
            },
            {
                value: "Processing",
                label: "Processing",
                color: "bg-blue-100 text-blue-800 border-blue-200",
                icon: RefreshCw,
                description: "Preparing order for shipment",
            },
            {
                value: "Shipped",
                label: "Shipped",
                color: "bg-purple-100 text-purple-800 border-purple-200",
                icon: Truck,
                description: "Order shipped to customer",
            },
            {
                value: "Delivered",
                label: "Delivered",
                color: "bg-green-100 text-green-800 border-green-200",
                icon: CheckCircle,
                description: "Order delivered - waiting for buyer confirmation",
            },
            {
                value: "Completed",
                label: "Completed",
                color: "bg-emerald-100 text-emerald-800 border-emerald-200",
                icon: CheckCircle,
                description: "Order completed - buyer confirmed receipt",
            },
            {
                value: "Cancelled",
                label: "Cancelled",
                color: "bg-red-100 text-red-800 border-red-200",
                icon: XCircle,
                description: "Order cancelled",
            },
        ];

        const currentStatus = statusOptions.find(
            (s) => s.value === order.order_status
        );

        const getAvailableStatuses = () => {
            switch (order.order_status) {
                case "Pending":
                    return statusOptions.filter((s) =>
                        ["Processing", "Cancelled"].includes(s.value)
                    );
                case "Processing":
                    return statusOptions.filter((s) =>
                        ["Shipped", "Cancelled"].includes(s.value)
                    );
                case "Shipped":
                    return statusOptions.filter((s) =>
                        ["Delivered"].includes(s.value)
                    );
                case "Delivered":
                    // SELLER CANNOT MARK AS COMPLETED - only buyer can confirm
                    return [];
                case "Completed":
                    return [];
                case "Cancelled":
                    return [];
                default:
                    return statusOptions;
            }
        };

        const availableStatuses = getAvailableStatuses();

        return (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onEditClick();
                }}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 hover:shadow-sm ${
                    currentStatus?.color ||
                    "bg-gray-100 text-gray-800 border-gray-200"
                } min-w-[100px] justify-between group`}
            >
                <span className="truncate">{order.order_status}</span>
                {availableStatuses.length > 0 && (
                    <ChevronDown
                        size={14}
                        className="transition-transform duration-200 group-hover:rotate-180"
                    />
                )}
            </button>
        );
    };

    // Status Popup Component
    const StatusPopup = ({ order, onStatusUpdate, isOpen, onClose }) => {
        const modalRef = useRef(null);

        const statusOptions = [
            {
                value: "Pending",
                label: "Pending",
                color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                icon: Clock,
                description: "Order received, awaiting processing",
            },
            {
                value: "Processing",
                label: "Processing",
                color: "bg-blue-100 text-blue-800 border-blue-200",
                icon: RefreshCw,
                description: "Preparing order for shipment",
            },
            {
                value: "Shipped",
                label: "Shipped",
                color: "bg-purple-100 text-purple-800 border-purple-200",
                icon: Truck,
                description: "Order shipped to customer",
            },
            {
                value: "Delivered",
                label: "Delivered",
                color: "bg-green-100 text-green-800 border-green-200",
                icon: CheckCircle,
                description: "Order delivered - waiting for buyer confirmation",
            },
            {
                value: "Completed",
                label: "Completed",
                color: "bg-emerald-100 text-emerald-800 border-emerald-200",
                icon: CheckCircle,
                description: "Order completed - buyer confirmed receipt",
            },
            {
                value: "Cancelled",
                label: "Cancelled",
                color: "bg-red-100 text-red-800 border-red-200",
                icon: XCircle,
                description: "Order cancelled",
            },
        ];

        const currentStatus = statusOptions.find(
            (s) => s.value === order.order_status
        );

        const getAvailableStatuses = () => {
            switch (order.order_status) {
                case "Pending":
                    return statusOptions.filter((s) =>
                        ["Processing", "Cancelled"].includes(s.value)
                    );
                case "Processing":
                    return statusOptions.filter((s) =>
                        ["Shipped", "Cancelled"].includes(s.value)
                    );
                case "Shipped":
                    return statusOptions.filter((s) =>
                        ["Delivered"].includes(s.value)
                    );
                case "Delivered":
                    // SELLER CANNOT MARK AS COMPLETED
                    return [];
                case "Completed":
                    return [];
                case "Cancelled":
                    return [];
                default:
                    return statusOptions;
            }
        };

        const availableStatuses = getAvailableStatuses();

        // Close modal when clicking outside or pressing ESC
        useEffect(() => {
            const handleEscape = (e) => {
                if (e.key === "Escape") onClose();
            };

            const handleClickOutside = (e) => {
                if (modalRef.current && !modalRef.current.contains(e.target))
                    onClose();
            };

            if (isOpen) {
                document.addEventListener("keydown", handleEscape);
                document.addEventListener("mousedown", handleClickOutside);
                document.body.style.overflow = "hidden";
            }

            return () => {
                document.removeEventListener("keydown", handleEscape);
                document.removeEventListener("mousedown", handleClickOutside);
                document.body.style.overflow = "unset";
            };
        }, [isOpen, onClose]);

        if (!isOpen) return null;

        return (
            <>
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div
                        ref={modalRef}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Update Order Status
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {order.order_id}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                                >
                                    <XCircle
                                        size={20}
                                        className="text-gray-400"
                                    />
                                </button>
                            </div>

                            {/* Current Status */}
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`p-2 rounded-lg ${
                                                currentStatus?.color ||
                                                "bg-gray-100"
                                            }`}
                                        >
                                            {currentStatus?.icon && (
                                                <currentStatus.icon size={18} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Current Status
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {currentStatus?.description}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            currentStatus?.color ||
                                            "bg-gray-100"
                                        }`}
                                    >
                                        {currentStatus?.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Available Status Options */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-4">
                                Available Status Updates{" "}
                                {availableStatuses.length === 0 && "(None)"}
                            </h3>

                            {availableStatuses.length > 0 ? (
                                <div className="space-y-3">
                                    {availableStatuses.map((status) => {
                                        const IconComponent = status.icon;
                                        return (
                                            <button
                                                key={status.value}
                                                onClick={() => {
                                                    onStatusUpdate(
                                                        order.order_id,
                                                        status.value
                                                    );
                                                    onClose();
                                                }}
                                                className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 bg-white group"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div
                                                        className={`p-2 rounded-lg ${status.color} group-hover:scale-110 transition-transform duration-200`}
                                                    >
                                                        <IconComponent
                                                            size={18}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-gray-900">
                                                                {status.label}
                                                            </span>
                                                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                                                                Next step
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 leading-relaxed">
                                                            {status.description}
                                                        </p>
                                                    </div>
                                                    <ChevronRight
                                                        size={16}
                                                        className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200 mt-1"
                                                    />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="bg-gray-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                                        <CheckCircle
                                            size={24}
                                            className="text-gray-400"
                                        />
                                    </div>
                                    <p className="text-gray-500 text-sm">
                                        {order.order_status === "Delivered" ? (
                                            <>
                                                Order is delivered and waiting
                                                for buyer confirmation.
                                                <br />
                                                <strong>
                                                    Buyer must confirm receipt
                                                    to complete the order.
                                                </strong>
                                            </>
                                        ) : (
                                            <>
                                                No further status updates
                                                available.
                                                <br />
                                                This order is already{" "}
                                                {order.order_status.toLowerCase()}
                                                .
                                            </>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                                >
                                    Cancel
                                </button>
                                {availableStatuses.length === 0 && (
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-150"
                                    >
                                        Close
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // Simple Clock icon component
    const Clock = (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );

    const printOrderReceipt = (order) => {
        setOrderToPrint(order);
        setTimeout(() => {
            handlePrint();
        }, 100);
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        setNewOrders(new Set());
        fetchOrders();
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        const current = pagination.current_page || currentPage;
        const last = pagination.last_page || 1;

        if (last <= 1) return [1];
        if (last <= maxVisiblePages) {
            for (let i = 1; i <= last; i++) pages.push(i);
        } else {
            const startPage = Math.max(1, current - 2);
            const endPage = Math.min(last, current + 2);
            if (startPage > 1) pages.push(1);
            if (startPage > 2) pages.push("...");
            for (let i = startPage; i <= endPage; i++) pages.push(i);
            if (endPage < last - 1) pages.push("...");
            if (endPage < last) pages.push(last);
        }
        return pages;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <SellerSidebar />

            <main className="flex-1 p-3 sm:p-4 lg:p-6 lg:ml-0 min-w-0">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-3 mb-3 lg:mb-0">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                                Order Management
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                                Manage and track your customer orders
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing || isLoading}
                            className="flex-shrink-0 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            <RefreshCw
                                size={16}
                                className={isRefreshing ? "animate-spin" : ""}
                            />
                            <span className="hidden xs:inline">
                                {isRefreshing ? "Refreshing..." : "Refresh"}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Commission Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-blue-900 mb-1">
                                Commission Information
                            </h3>
                            <p className="text-xs sm:text-sm text-blue-700">
                                <strong>8% platform commission</strong> will be
                                automatically calculated when buyers confirm
                                order receipt. Mark orders as "Delivered" when
                                shipped, then wait for buyer confirmation to
                                complete the order and release funds.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mb-4 sm:mb-6">
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                        {[
                            "All",
                            "Pending",
                            "Processing",
                            "Completed",
                            "Cancelled",
                        ].map((status) => (
                            <div
                                key={status}
                                className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs sm:text-sm text-gray-500 mb-1 truncate">
                                            {status}
                                        </p>
                                        <p className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                                            {statusCounts[status] || 0}
                                        </p>
                                    </div>
                                    <div
                                        className={`p-2 rounded-full bg-gray-100 flex-shrink-0 ml-2`}
                                    >
                                        <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap lg:items-center gap-2 sm:gap-3">
                        {/* Search */}
                        <div className="flex-1 flex items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                            <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                className="ml-2 flex-1 outline-none border-none focus-within:border-none text-sm text-gray-700 bg-transparent placeholder-gray-400 min-w-0"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Status Filter */}
                        <select
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white w-full sm:w-[48%] md:w-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>

                        {/* Sort Options */}
                        <select
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white w-full sm:w-[48%] md:w-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="created_at">Sort by Date</option>
                            <option value="amount">Sort by Amount</option>
                            <option value="status">Sort by Status</option>
                        </select>

                        {/* Sort Order */}
                        <button
                            onClick={() =>
                                setSortOrder(
                                    sortOrder === "asc" ? "desc" : "asc"
                                )
                            }
                            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white w-full sm:w-auto justify-center hover:bg-gray-50 transition-colors"
                        >
                            {sortOrder === "asc" ? (
                                <ChevronUp size={14} />
                            ) : (
                                <ChevronDown size={14} />
                            )}
                            <span className="hidden xs:inline">
                                {sortOrder === "asc" ? "Asc" : "Desc"}
                            </span>
                        </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                        <p className="truncate">
                            💡 Search tips: Use order ID, customer name, email,
                            product name, or amount
                        </p>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px] sm:min-w-0">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr className="text-gray-700 text-left">
                                        <th className="px-3 sm:px-4 py-3 font-medium text-xs lg:text-sm whitespace-nowrap">
                                            Order ID
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 font-medium text-xs lg:text-sm whitespace-nowrap hidden sm:table-cell">
                                            Customer
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 font-medium text-xs lg:text-sm whitespace-nowrap hidden md:table-cell">
                                            Date
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 font-medium text-xs lg:text-sm whitespace-nowrap">
                                            Total (RM)
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 font-medium text-xs lg:text-sm whitespace-nowrap">
                                            Status
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 font-medium text-xs lg:text-sm whitespace-nowrap text-center">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {isLoading ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="text-center py-8"
                                            >
                                                <div className="flex justify-center">
                                                    <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                                                </div>
                                                <p className="text-gray-500 mt-2 text-sm">
                                                    Loading orders...
                                                </p>
                                            </td>
                                        </tr>
                                    ) : orders.length > 0 ? (
                                        orders.map((order) => (
                                            <tr
                                                key={order.order_id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-3 sm:px-4 py-3 font-medium text-gray-900 text-xs lg:text-sm">
                                                    <div className="font-mono flex items-center gap-2 min-w-0">
                                                        <span className="truncate">
                                                            {order.order_id}
                                                        </span>
                                                        {newOrders.has(
                                                            order.order_id
                                                        ) && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 animate-pulse flex-shrink-0">
                                                                NEW
                                                            </span>
                                                        )}
                                                        <div className="sm:hidden text-xs text-gray-500 truncate ml-2">
                                                            {order.user?.name}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 sm:px-4 py-3 hidden sm:table-cell">
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-gray-900 text-xs lg:text-sm truncate">
                                                            {order.user?.name}
                                                        </p>
                                                        <p className="text-gray-500 text-xs truncate">
                                                            {order.user?.email}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-3 sm:px-4 py-3 text-gray-600 text-xs lg:text-sm hidden md:table-cell whitespace-nowrap">
                                                    {dayjs(
                                                        order.created_at
                                                    ).format(
                                                        "DD MMM YYYY, h:mm A"
                                                    )}
                                                </td>
                                                <td className="px-3 sm:px-4 py-3 font-medium text-gray-900 text-xs lg:text-sm whitespace-nowrap">
                                                    {parseFloat(
                                                        order.total_amount ||
                                                            order.amount ||
                                                            0
                                                    ).toFixed(2)}
                                                </td>
                                                <td className="px-3 sm:px-4 py-3">
                                                    <StatusButton
                                                        order={order}
                                                        onEditClick={() =>
                                                            setStatusPopupOrder(
                                                                order
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td className="px-3 sm:px-4 py-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedOrder(
                                                                    order
                                                                );
                                                                setViewOrder(
                                                                    true
                                                                );
                                                            }}
                                                            className="p-1 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                printOrderReceipt(
                                                                    order
                                                                )
                                                            }
                                                            className="p-1 sm:p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors hidden sm:block"
                                                            title="Print Order"
                                                        >
                                                            <Printer
                                                                size={14}
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="text-center py-8 text-gray-500"
                                            >
                                                <Package
                                                    size={48}
                                                    className="mx-auto mb-4 text-gray-300"
                                                />
                                                <p className="text-sm sm:text-base">
                                                    No orders found
                                                </p>
                                                <p className="text-xs sm:text-sm">
                                                    Try adjusting your search or
                                                    filters
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="px-3 sm:px-4 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex flex-col md:flex-row xs:flex-row items-center justify-between space-y-3 xs:space-y-0">
                            <div className="text-xs sm:text-sm text-gray-700 text-center xs:text-left">
                                {isSearchMode ? (
                                    <>
                                        <span className="font-medium bg-yellow-100 px-2 py-1 rounded">
                                            🔍 Search Mode
                                        </span>
                                        {" - Showing "}
                                        <span className="font-medium">
                                            {orders.length}
                                        </span>
                                        {' results for "'}
                                        <span className="font-medium text-blue-600">
                                            {searchTerm}
                                        </span>
                                        {'"'}
                                    </>
                                ) : pagination.total > 0 ? (
                                    <>
                                        <span>Showing </span>
                                        <span className="font-medium">
                                            {pagination.from || 1}
                                        </span>{" "}
                                        to{" "}
                                        <span className="font-medium">
                                            {pagination.to || orders.length}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-medium">
                                            {pagination.total}
                                        </span>{" "}
                                        results
                                        <span className="hidden sm:inline">
                                            {" (Page "}
                                            <span className="text-blue-600 font-bold">
                                                {currentPage}
                                            </span>
                                            {" of "}
                                            <span className="font-medium">
                                                {pagination.last_page || 1}
                                            </span>
                                            {")"}
                                        </span>
                                    </>
                                ) : (
                                    "No results found"
                                )}
                            </div>

                            {!isSearchMode && (
                                <div className="flex items-center space-x-1 flex-wrap justify-center">
                                    <button
                                        className="px-2 sm:px-3 py-1.5 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
                                        onClick={prevPage}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    {getPageNumbers().map((page, index) => (
                                        <button
                                            key={index}
                                            className={`px-2 sm:px-3 py-1.5 rounded-md border transition-colors text-xs sm:text-sm ${
                                                page === currentPage
                                                    ? "bg-blue-600 text-white border-blue-600"
                                                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                            } ${
                                                page === "..."
                                                    ? "cursor-default"
                                                    : ""
                                            }`}
                                            onClick={() => goToPage(page)}
                                            disabled={page === "..."}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        className="px-2 sm:px-3 py-1.5 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
                                        onClick={nextPage}
                                        disabled={
                                            currentPage >=
                                            (pagination.last_page || 1)
                                        }
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {viewOrder && selectedOrder && (
                    <OrderDetails
                        selectedOrder={selectedOrder}
                        setSelectedOrder={setSelectedOrder}
                        setViewOrder={setViewOrder}
                        printOrder={printOrderReceipt}
                        updateOrderStatus={updateOrderStatus}
                    />
                )}
                {statusPopupOrder && (
                    <StatusPopup
                        order={statusPopupOrder}
                        isOpen={!!statusPopupOrder}
                        onClose={() => setStatusPopupOrder(null)}
                        onStatusUpdate={updateOrderStatus}
                    />
                )}

                {/* Hidden printable component */}
                <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
                    {orderToPrint && (
                        <PrintableInvoice ref={printRef} order={orderToPrint} />
                    )}
                </div>
            </main>
        </div>
    );
}
