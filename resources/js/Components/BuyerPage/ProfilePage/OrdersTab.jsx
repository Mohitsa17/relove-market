import {
    Search,
    ChevronLeft,
    ChevronRight,
    Clock,
    XCircle,
    ShoppingBag,
    FileText,
    Calendar,
    ThumbsUp,
} from "lucide-react";

import { useState } from "react";

import { EmptyState } from "./EmptyState";

import dayjs from "dayjs";

import { SuccessConfirmationModal } from "./SuccessConfirmationModal";
import { TimelineModal } from "./TimelineModal";

export function OrdersTab({
    orderHistory,
    currentPage,
    itemsPerPage,
    paginate,
    viewReceipt,
    loading,
    confirmOrderDelivery,
    confirmingOrderId,
    recentOrderId,
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("all");
    const [sortBy, setSortBy] = useState("date");
    const [sortOrder, setSortOrder] = useState("desc");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [confirmedOrder, setConfirmedOrder] = useState(null);
    const [activeFilter, setActiveFilter] = useState("all");
    const [timelineModal, setTimelineModal] = useState({
        isOpen: false,
        order: null,
    });

    // Use orderHistory directly without transformation
    const orders = orderHistory || [];

    // Quick status filters
    const statusFilters = [
        { key: "all", label: "All Orders", count: orders.length },
        {
            key: "pending",
            label: "Pending",
            count: orders.filter((o) => o.order_status === "Pending").length,
        },
        {
            key: "processing",
            label: "Processing",
            count: orders.filter((o) => o.order_status === "Processing").length,
        },
        {
            key: "shipped",
            label: "Shipped",
            count: orders.filter((o) => o.order_status === "Shipped").length,
        },
        {
            key: "delivered",
            label: "Delivered",
            count: orders.filter((o) => o.order_status === "Delivered").length,
        },
        {
            key: "completed",
            label: "Completed",
            count: orders.filter((o) => o.order_status === "Completed").length,
        },
    ];

    // Filter and sort orders
    const filteredOrders = orders
        .filter((order) => {
            const matchesSearch =
                order.order_id
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                order.order_items?.some((item) =>
                    item.product?.product_name
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase())
                ) ||
                order.tracking_number
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesDate =
                dateFilter === "all" ||
                (dateFilter === "last30" &&
                    new Date(order.created_at) >
                        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
                (dateFilter === "last90" &&
                    new Date(order.created_at) >
                        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));

            const matchesStatus =
                activeFilter === "all" ||
                order.order_status.toLowerCase() === activeFilter;

            return matchesSearch && matchesDate && matchesStatus;
        })
        .sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case "date":
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
                    break;
                case "total":
                    aValue = parseFloat(a.amount) || 0;
                    bValue = parseFloat(b.amount) || 0;
                    break;
                case "status":
                    aValue = a.order_status;
                    bValue = b.order_status;
                    break;
                default:
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
            }

            if (sortOrder === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    const currentFilteredOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalFilteredPages = Math.ceil(filteredOrders.length / itemsPerPage);

    // Helper function to get order total
    const getOrderTotal = (order) => {
        return parseFloat(order.amount) || 0;
    };

    // Helper function to get total items count
    const getTotalItemsCount = (order) => {
        if (order.order_items && order.order_items.length > 0) {
            return order.order_items.reduce(
                (total, item) => total + (item.quantity || 1),
                0
            );
        }
        return order.quantity || 1;
    };

    // Helper function to format product name
    const getProductName = (order) => {
        if (order.order_items && order.order_items.length > 0) {
            const firstItem = order.order_items[0];
            return firstItem.product?.product_name || "Product";
        }
        return order.product?.product_name || "Product";
    };

    // Helper function to get product price
    const getProductPrice = (order) => {
        if (order.order_items && order.order_items.length > 0) {
            const firstItem = order.order_items[0];
            return (
                parseFloat(firstItem.price) ||
                parseFloat(firstItem.product?.product_price) ||
                0
            );
        }
        return parseFloat(order.product?.product_price) || 0;
    };

    // Helper function to get product quantity
    const getProductQuantity = (order) => {
        if (order.order_items && order.order_items.length > 0) {
            const firstItem = order.order_items[0];
            return firstItem.quantity || 1;
        }
        return order.quantity || 1;
    };

    // Helper function to get product image
    const getProductImage = (order) => {
        if (order.order_items && order.order_items.length > 0) {
            const firstItem = order.order_items[0];
            return (
                firstItem.product?.product_image?.[0]?.image_path ||
                firstItem.product_image?.[0]?.image_path
            );
        }
        return (
            order.order_items?.[0].product?.product_image?.[0]?.image_path ||
            "/api/placeholder/80/80"
        );
    };

    // Enhanced order confirmation handler with modal
    const handleOrderConfirmation = async (order) => {
        if (confirmOrderDelivery) {
            const success = await confirmOrderDelivery(order.order_id);
            if (success) {
                setConfirmedOrder(order);
                setShowSuccessModal(true);
            }
        }
    };

    // NEW: Open timeline modal
    const openTimelineModal = (order) => {
        setTimelineModal({ isOpen: true, order });
    };

    // Compact status display for table view
    const CompactStatusDisplay = ({ order }) => {
        const isCancelled = ["Cancelled", "Refunded"].includes(
            order.order_status
        );

        if (isCancelled) {
            return (
                <div className="flex items-center gap-2 text-red-600">
                    <XCircle size={16} />
                    <span className="text-sm font-medium">Cancelled</span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <div
                        className={`
                        w-2 h-2 rounded-full
                        ${
                            order.order_status === "Completed"
                                ? "bg-green-500"
                                : order.order_status === "Delivered"
                                ? "bg-orange-500"
                                : order.order_status === "Shipped"
                                ? "bg-blue-500"
                                : order.order_status === "Processing"
                                ? "bg-purple-500"
                                : "bg-yellow-500"
                        }
                    `}
                    />
                    <span className="text-sm font-medium text-gray-700 capitalize">
                        {order.order_status}
                    </span>
                </div>
                <button
                    onClick={() => openTimelineModal(order)}
                    className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium flex items-center gap-1"
                    title="View order timeline"
                >
                    <Clock size={14} />
                    <span>Track</span>
                </button>
            </div>
        );
    };

    // Enhanced receipt header with meaningful information
    const getReceiptHeaderInfo = (order) => {
        return {
            orderId: order.order_id,
            orderDate: dayjs(order.created_at).format("DD MMM YYYY, hh:mm A"),
            customerInfo: {
                name: order.shipping_address?.recipient_name || "Customer",
                phone: order.shipping_address?.phone_number || "N/A",
                email: order.email || "N/A",
                address: order.shipping_address
                    ? `${order.shipping_address.address_line1}, ${order.shipping_address.city}, ${order.shipping_address.state}, ${order.shipping_address.postal_code}`
                    : "Address not available",
            },
            paymentMethod: order.payment_method || "Online Payment",
            totalAmount: getOrderTotal(order),
            itemsCount: getTotalItemsCount(order),
        };
    };

    // Enhanced receipt view with meaningful headers
    const handleViewReceipt = (order) => {
        const receiptInfo = getReceiptHeaderInfo(order);

        const enhancedReceipt = {
            ...order,
            receipt_header: {
                type: "ORDER_RECEIPT",
                title: "Order Invoice",
                order_info: {
                    id: receiptInfo.orderId,
                    date: receiptInfo.orderDate,
                    status: order.order_status,
                    payment_method: receiptInfo.paymentMethod,
                },
                customer_info: receiptInfo.customerInfo,
                summary: {
                    total_items: receiptInfo.itemsCount,
                    subtotal: receiptInfo.totalAmount,
                    shipping_fee: order.shipping_fee || 0,
                    total_amount: receiptInfo.totalAmount,
                },
            },
        };

        viewReceipt(enhancedReceipt);
    };

    // Render action buttons
    const renderActionButtons = (order) => {
        return (
            <div className="flex flex-col gap-2">
                <button
                    onClick={() => handleViewReceipt(order)}
                    className="flex items-center justify-center gap-2 bg-white text-blue-600 border border-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                    title="View Invoice"
                >
                    <FileText size={14} />
                    <span className="hidden sm:inline">Invoice</span>
                </button>

                {order.order_status === "Delivered" && (
                    <button
                        onClick={() => handleOrderConfirmation(order)}
                        disabled={confirmingOrderId === order.order_id}
                        className="flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
                        title="Confirm Order Completion"
                    >
                        {confirmingOrderId === order.order_id ? (
                            <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span className="hidden sm:inline">
                                    Confirming...
                                </span>
                            </>
                        ) : (
                            <>
                                <ThumbsUp size={14} />
                                <span className="hidden sm:inline">
                                    Confirm
                                </span>
                            </>
                        )}
                    </button>
                )}

                {order.order_status === "Completed" && (
                    <span className="inline-flex items-center justify-center gap-1 bg-emerald-100 text-emerald-800 px-3 py-2 rounded-lg text-sm font-medium border border-emerald-200">
                        <ThumbsUp size={14} />
                        <span className="hidden sm:inline">Confirmed</span>
                    </span>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <SuccessConfirmationModal
                confirmedOrder={confirmedOrder}
                setConfirmedOrder={setConfirmedOrder}
                setShowSuccessModal={setShowSuccessModal}
                showSuccessModal={showSuccessModal}
            />

            <TimelineModal
                getOrderTotal={getOrderTotal}
                getProductImage={getProductImage}
                getProductName={getProductName}
                getTotalItemsCount={getTotalItemsCount}
                timelineModal={timelineModal}
                setTimelineModal={setTimelineModal}
            />

            {/* Enhanced Header */}
            <div className="border-b border-gray-100 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Order History
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Manage and track your orders
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="text-center">
                            <div className="font-semibold text-gray-900">
                                {orders.length}
                            </div>
                            <div>Total Orders</div>
                        </div>
                        <div className="w-px h-8 bg-gray-300"></div>
                        <div className="text-center">
                            <div className="font-semibold text-gray-900">
                                RM{" "}
                                {orders
                                    .reduce(
                                        (sum, order) =>
                                            sum + getOrderTotal(order),
                                        0
                                    )
                                    .toFixed(2)}
                            </div>
                            <div>Total Spent</div>
                        </div>
                    </div>
                </div>

                {/* Quick Status Filters */}
                <div className="flex overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                    {statusFilters.map((filter) => (
                        <button
                            key={filter.key}
                            onClick={() => setActiveFilter(filter.key)}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg mx-1 transition-all ${
                                activeFilter === filter.key
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <span>{filter.label}</span>
                                <span
                                    className={`px-1.5 py-0.5 rounded-full text-xs ${
                                        activeFilter === filter.key
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-300 text-gray-700"
                                    }`}
                                >
                                    {filter.count}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Search and Date Filter */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                    <div className="lg:col-span-2 relative">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Search orders, products, tracking..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                        />
                    </div>

                    <div className="relative">
                        <Calendar
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 appearance-none"
                        >
                            <option value="all">All Time</option>
                            <option value="last30">Last 30 Days</option>
                            <option value="last90">Last 90 Days</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {orders.length === 0 ? (
                    <EmptyState
                        icon={ShoppingBag}
                        title="No orders yet"
                        description="Your order history will appear here once you make your first purchase"
                        actionText="Start Shopping"
                        actionLink="/shopping"
                    />
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-4">
                            {currentFilteredOrders.map((order) => (
                                <div
                                    key={order.order_id}
                                    className={`bg-white rounded-xl border border-gray-200 p-6 mb-4 transition-all duration-300 ${
                                        recentOrderId &&
                                        order.order_id === recentOrderId
                                            ? "bg-green-50 border-green-200 shadow-md"
                                            : "hover:shadow-md"
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {dayjs(order.created_at).format(
                                                    "DD MMM YYYY"
                                                )}
                                            </p>
                                        </div>
                                        <CompactStatusDisplay order={order} />
                                    </div>

                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src={
                                                import.meta.env.VITE_BASE_URL +
                                                getProductImage(order)
                                            }
                                            alt={getProductName(order)}
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 text-sm line-clamp-1">
                                                {getProductName(order)}
                                            </p>
                                            <p className="text-gray-600 text-xs">
                                                Qty: {getProductQuantity(order)}{" "}
                                                • RM{" "}
                                                {getProductPrice(order).toFixed(
                                                    2
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                        <div>
                                            <span className="font-semibold text-gray-900 text-sm">
                                                Total
                                            </span>
                                            <p className="font-bold text-gray-900">
                                                RM{" "}
                                                {getOrderTotal(order).toFixed(
                                                    2
                                                )}
                                            </p>
                                        </div>
                                        {renderActionButtons(order)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden lg:block">
                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Order Details
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Total
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentFilteredOrders.map((order) => (
                                            <tr
                                                key={order.order_id}
                                                className={`bg-white rounded-xl border border-gray-200 p-6 mb-4 transition-all duration-300 ${
                                                    order.order_id ===
                                                    recentOrderId
                                                        ? "bg-green-50 border-green-200 shadow-md"
                                                        : "hover:shadow-md"
                                                }`}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={
                                                                import.meta.env
                                                                    .VITE_BASE_URL +
                                                                getProductImage(
                                                                    order
                                                                )
                                                            }
                                                            alt={getProductName(
                                                                order
                                                            )}
                                                            className="w-12 h-12 rounded-lg object-cover"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-900 text-sm line-clamp-1">
                                                                {getProductName(
                                                                    order
                                                                )}
                                                            </p>
                                                            <p className="text-gray-600 text-xs mt-1">
                                                                {dayjs(
                                                                    order.created_at
                                                                ).format(
                                                                    "DD MMM YYYY, hh:mm A"
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <CompactStatusDisplay
                                                        order={order}
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-900">
                                                            RM{" "}
                                                            {getOrderTotal(
                                                                order
                                                            ).toFixed(2)}
                                                        </p>
                                                        <p className="text-gray-600 text-xs mt-1">
                                                            {getTotalItemsCount(
                                                                order
                                                            )}{" "}
                                                            items
                                                        </p>
                                                        <p className="text-green-600 text-xs font-medium capitalize">
                                                            {order.payment_status ||
                                                                "paid"}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {renderActionButtons(order)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalFilteredPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                                <div className="text-sm text-gray-600">
                                    Showing{" "}
                                    {Math.min(
                                        (currentPage - 1) * itemsPerPage + 1,
                                        filteredOrders.length
                                    )}{" "}
                                    to{" "}
                                    {Math.min(
                                        currentPage * itemsPerPage,
                                        filteredOrders.length
                                    )}{" "}
                                    of {filteredOrders.length} orders
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            paginate &&
                                            paginate(
                                                Math.max(1, currentPage - 1)
                                            )
                                        }
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                                    >
                                        <ChevronLeft size={16} />
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from(
                                            {
                                                length: Math.min(
                                                    5,
                                                    totalFilteredPages
                                                ),
                                            },
                                            (_, i) => {
                                                let pageNum;
                                                if (totalFilteredPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (
                                                    currentPage >=
                                                    totalFilteredPages - 2
                                                ) {
                                                    pageNum =
                                                        totalFilteredPages -
                                                        4 +
                                                        i;
                                                } else {
                                                    pageNum =
                                                        currentPage - 2 + i;
                                                }

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() =>
                                                            paginate &&
                                                            paginate(pageNum)
                                                        }
                                                        className={`w-10 h-10 rounded-lg border transition-all font-medium text-sm ${
                                                            currentPage ===
                                                            pageNum
                                                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                                                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>

                                    <button
                                        onClick={() =>
                                            paginate &&
                                            paginate(
                                                Math.min(
                                                    totalFilteredPages,
                                                    currentPage + 1
                                                )
                                            )
                                        }
                                        disabled={
                                            currentPage === totalFilteredPages
                                        }
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                                    >
                                        Next
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
