import {
    XCircle,
    Printer,
    Truck,
    CheckCircle,
    User,
    Package,
    MapPin,
    CreditCard,
    Calendar,
    Hash,
    DollarSign,
    ShoppingCart,
    Phone,
    Mail,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import dayjs from "dayjs";
import { useState } from "react";

export function OrderDetails({
    selectedOrder,
    setSelectedOrder,
    setViewOrder,
    printOrder,
    updateOrderStatus,
}) {
    const [expandedSections, setExpandedSections] = useState({
        items: true,
        summary: true,
        customer: true,
        orderInfo: true,
        shipping: true,
    });

    const handleClose = () => {
        setSelectedOrder(null);
        setViewOrder(false);
    };

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    if (!selectedOrder) {
        return null;
    }

    // Calculate order totals
    const calculateOrderTotals = () => {
        const subtotal =
            selectedOrder.order_items?.reduce((sum, item) => {
                return (
                    sum + (parseFloat(item.price) || 0) * (item.quantity || 1)
                );
            }, 0) || 0;

        const shipping = parseFloat(selectedOrder.shipping_fee) || 0;
        const tax = parseFloat(selectedOrder.tax_amount) || 0;
        const total =
            parseFloat(selectedOrder.amount) || subtotal + shipping + tax;

        return { subtotal, shipping, tax, total };
    };

    const { subtotal, shipping, tax, total } = calculateOrderTotals();

    // Get status color and icon
    const getStatusInfo = (status) => {
        switch (status?.toLowerCase()) {
            case "processing":
            case "pending":
                return {
                    color: "bg-yellow-100 text-yellow-800",
                    icon: Package,
                };
            case "shipped":
                return { color: "bg-blue-100 text-blue-800", icon: Truck };
            case "delivered":
                return {
                    color: "bg-green-100 text-green-800",
                    icon: CheckCircle,
                };
            case "cancelled":
                return { color: "bg-red-100 text-red-800", icon: XCircle };
            default:
                return { color: "bg-gray-100 text-gray-800", icon: Package };
        }
    };

    const statusInfo = getStatusInfo(selectedOrder.status);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 lg:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-full lg:max-w-6xl max-h-[95vh] lg:max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 lg:p-6 z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <ShoppingCart
                                    className="text-blue-600"
                                    size={20}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg lg:text-xl font-bold text-gray-900 truncate">
                                    {selectedOrder.order_id}
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                                    >
                                        <statusInfo.icon size={12} />
                                        {selectedOrder.status}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar size={12} />
                                        {dayjs(selectedOrder.created_at).format(
                                            "DD MMM YYYY, hh:mm A"
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-center">
                            <button
                                onClick={() => printOrder(selectedOrder)}
                                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Printer size={16} />
                                <span className="hidden sm:inline">Print</span>
                            </button>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 lg:p-6">
                    {/* Mobile Accordion Layout */}
                    <div className="block xl:hidden space-y-4">
                        {/* Order Items - Mobile Accordion */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <button
                                onClick={() => toggleSection("items")}
                                className="w-full p-4 border-b border-gray-200 flex items-center justify-between text-left"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Package size={18} />
                                    Order Items (
                                    {selectedOrder.order_items?.length || 0})
                                </h3>
                                {expandedSections.items ? (
                                    <ChevronUp size={18} />
                                ) : (
                                    <ChevronDown size={18} />
                                )}
                            </button>
                            {expandedSections.items && (
                                <div className="p-4">
                                    {selectedOrder.order_items?.map(
                                        (item, index) => (
                                            <div
                                                key={index}
                                                className="border-b border-gray-200 last:border-b-0 pb-4 mb-4 last:mb-0 last:pb-0"
                                            >
                                                <div className="flex flex-col md:flex-row gap-3">
                                                    <img
                                                        src={`${
                                                            import.meta.env
                                                                .VITE_BASE_URL
                                                        }${
                                                            item.product_image
                                                                ?.image_path ||
                                                            item.product
                                                                ?.product_image?.[0]
                                                                ?.image_path
                                                        }`}
                                                        alt={
                                                            item.product
                                                                ?.product_name ||
                                                            "Product"
                                                        }
                                                        className="w-full md:w-16 md:h-16 object-cover rounded-lg border flex-shrink-0"
                                                        onError={(e) => {
                                                            e.target.src =
                                                                "../image/no-image.png";
                                                        }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 truncate">
                                                            {item.product
                                                                ?.product_name ||
                                                                "N/A"}
                                                        </p>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            ID:{" "}
                                                            {item.product_id}
                                                        </p>
                                                        {item.selected_variant && (
                                                            <div className="mt-1">
                                                                <p className="w-28 text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                                                    {Object.entries(
                                                                        JSON.parse(
                                                                            item
                                                                                .selected_variant
                                                                                .combination ||
                                                                                "{}"
                                                                        )
                                                                    )
                                                                        .map(
                                                                            ([
                                                                                key,
                                                                                value,
                                                                            ]) =>
                                                                                `${key}: ${value}`
                                                                        )
                                                                        .join(
                                                                            ", "
                                                                        )}
                                                                </p>
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                                                            <div>
                                                                <span className="text-gray-600">
                                                                    Price:
                                                                </span>
                                                                <span className="ml-1 text-green-600 font-bold">
                                                                    RM{" "}
                                                                    {parseFloat(
                                                                        item.price ||
                                                                            0
                                                                    ).toFixed(
                                                                        2
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-600">
                                                                    Qty:
                                                                </span>
                                                                <span className="ml-1 font-medium text-black">
                                                                    {item.quantity ||
                                                                        1}
                                                                </span>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <span className="text-gray-600">
                                                                    Total:
                                                                </span>
                                                                <span className="ml-1 font-semibold text-gray-900">
                                                                    RM{" "}
                                                                    {(
                                                                        parseFloat(
                                                                            item.price ||
                                                                                0
                                                                        ) *
                                                                        (item.quantity ||
                                                                            1)
                                                                    ).toFixed(
                                                                        2
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Order Summary - Mobile Accordion */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <button
                                onClick={() => toggleSection("summary")}
                                className="w-full p-4 border-b border-gray-200 flex items-center justify-between text-left"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <DollarSign size={18} />
                                    Order Summary
                                </h3>
                                {expandedSections.summary ? (
                                    <ChevronUp size={18} />
                                ) : (
                                    <ChevronDown size={18} />
                                )}
                            </button>
                            {expandedSections.summary && (
                                <div className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">
                                                Subtotal
                                            </span>
                                            <span className="font-medium text-gray-500">
                                                RM {subtotal.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">
                                                Shipping Fee
                                            </span>
                                            <span className="font-medium text-gray-500">
                                                RM 5.00
                                            </span>
                                        </div>
                                        {selectedOrder.platform_tax > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">
                                                    Tax (
                                                    {(
                                                        selectedOrder.platform_tax *
                                                        100
                                                    ).toFixed(1)}
                                                    %)
                                                </span>
                                                <span className="font-medium text-gray-500">
                                                    RM {tax.toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                            <span className="text-lg font-semibold text-gray-900">
                                                Total Amount
                                            </span>
                                            <span className="text-lg font-bold text-blue-600">
                                                RM {total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Customer Information - Mobile Accordion */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <button
                                onClick={() => toggleSection("customer")}
                                className="w-full p-4 border-b border-gray-200 flex items-center justify-between text-left"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <User size={18} />
                                    Customer Information
                                </h3>
                                {expandedSections.customer ? (
                                    <ChevronUp size={18} />
                                ) : (
                                    <ChevronDown size={18} />
                                )}
                            </button>
                            {expandedSections.customer && (
                                <div className="p-4">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Customer Name
                                            </p>
                                            <p className="text-gray-900 mt-1">
                                                {selectedOrder.user?.name ||
                                                    "N/A"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                <Mail size={14} />
                                                Email
                                            </p>
                                            <p className="text-gray-900 break-all mt-1">
                                                {selectedOrder.user?.email ||
                                                    "N/A"}
                                            </p>
                                        </div>
                                        {selectedOrder.user?.phone && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                    <Phone size={14} />
                                                    Phone
                                                </p>
                                                <p className="text-gray-900 mt-1">
                                                    {selectedOrder.user.phone}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Information - Mobile Accordion */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <button
                                onClick={() => toggleSection("orderInfo")}
                                className="w-full p-4 border-b border-gray-200 flex items-center justify-between text-left"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Hash size={18} />
                                    Order Information
                                </h3>
                                {expandedSections.orderInfo ? (
                                    <ChevronUp size={18} />
                                ) : (
                                    <ChevronDown size={18} />
                                )}
                            </button>
                            {expandedSections.orderInfo && (
                                <div className="p-4">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Order ID
                                            </p>
                                            <p className="text-gray-900 font-mono text-sm mt-1">
                                                {selectedOrder.order_id}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Payment Method
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <CreditCard
                                                    size={14}
                                                    className="text-gray-500"
                                                />
                                                <span className="capitalize text-gray-900">
                                                    {selectedOrder.payment_method?.replace(
                                                        /_/g,
                                                        " "
                                                    ) || "Credit Card"}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Payment Status
                                            </p>
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                                                    selectedOrder.payment_status ===
                                                    "paid"
                                                        ? "bg-green-100 text-green-800"
                                                        : selectedOrder.payment_status ===
                                                          "pending"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {selectedOrder.payment_status?.toUpperCase() ||
                                                    "PENDING"}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Order Date
                                            </p>
                                            <p className="text-gray-900 mt-1">
                                                {dayjs(
                                                    selectedOrder.created_at
                                                ).format(
                                                    "DD MMM YYYY, hh:mm A"
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Shipping Information - Mobile Accordion */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <button
                                onClick={() => toggleSection("shipping")}
                                className="w-full p-4 border-b border-gray-200 flex items-center justify-between text-left"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <MapPin size={18} />
                                    Shipping Information
                                </h3>
                                {expandedSections.shipping ? (
                                    <ChevronUp size={18} />
                                ) : (
                                    <ChevronDown size={18} />
                                )}
                            </button>
                            {expandedSections.shipping && (
                                <div className="p-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            Shipping Address
                                        </p>
                                        <p className="text-gray-900 text-sm leading-relaxed mt-2 bg-gray-50 p-3 rounded-lg">
                                            {selectedOrder.user.address ||
                                                "Shipping address not specified"}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desktop Grid Layout */}
                    <div className="hidden xl:grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Left Column - Order Items & Summary */}
                        <div className="xl:col-span-2 space-y-6">
                            {/* Order Items */}
                            <div className="bg-white border border-gray-200 rounded-lg">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Package size={18} />
                                        Order Items (
                                        {selectedOrder.order_items?.length || 0}
                                        )
                                    </h3>
                                </div>
                                <div className="overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Product
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Price
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Qty
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {selectedOrder.order_items?.map(
                                                (item, index) => (
                                                    <tr
                                                        key={index}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={`${
                                                                        import.meta
                                                                            .env
                                                                            .VITE_BASE_URL
                                                                    }${
                                                                        item
                                                                            .product_image
                                                                            ?.image_path ||
                                                                        item
                                                                            .product
                                                                            ?.product_image?.[0]
                                                                            ?.image_path
                                                                    }`}
                                                                    alt={
                                                                        item
                                                                            .product
                                                                            ?.product_name ||
                                                                        "Product"
                                                                    }
                                                                    className="w-12 h-12 object-cover rounded-lg border"
                                                                    onError={(
                                                                        e
                                                                    ) => {
                                                                        e.target.src =
                                                                            "../image/no-image.png";
                                                                    }}
                                                                />
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="font-medium text-gray-900 truncate">
                                                                        {item
                                                                            .product
                                                                            ?.product_name ||
                                                                            "N/A"}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500 mt-1">
                                                                        ID:{" "}
                                                                        {
                                                                            item.product_id
                                                                        }
                                                                    </p>
                                                                    {item.selected_variant && (
                                                                        <div className="mt-1">
                                                                            <p className="text-xs text-gray-600 font-semibold">
                                                                                {Object.entries(
                                                                                    JSON.parse(
                                                                                        item
                                                                                            .selected_variant
                                                                                            .combination ||
                                                                                            "{}"
                                                                                    )
                                                                                )
                                                                                    .map(
                                                                                        ([
                                                                                            key,
                                                                                            value,
                                                                                        ]) =>
                                                                                            `${key}: ${value}`
                                                                                    )
                                                                                    .join(
                                                                                        ", "
                                                                                    )}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-gray-900">
                                                            RM{" "}
                                                            {parseFloat(
                                                                item.price || 0
                                                            ).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-4 text-gray-900">
                                                            {item.quantity || 1}
                                                        </td>
                                                        <td className="px-4 py-4 font-semibold text-gray-900">
                                                            RM{" "}
                                                            {(
                                                                parseFloat(
                                                                    item.price ||
                                                                        0
                                                                ) *
                                                                (item.quantity ||
                                                                    1)
                                                            ).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-white border border-gray-200 rounded-lg">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <DollarSign size={18} />
                                        Order Summary
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">
                                                Subtotal
                                            </span>
                                            <span className="font-medium text-gray-500">
                                                RM {subtotal.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">
                                                Shipping Fee
                                            </span>
                                            <span className="font-medium text-gray-500">
                                                RM 5.00
                                            </span>
                                        </div>
                                        {selectedOrder.platform_tax > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">
                                                    Tax (
                                                    {(
                                                        selectedOrder.platform_tax *
                                                        100
                                                    ).toFixed(1)}
                                                    %)
                                                </span>
                                                <span className="font-medium text-gray-500">
                                                    RM {tax.toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                            <span className="text-lg font-semibold text-gray-900">
                                                Total Amount
                                            </span>
                                            <span className="text-lg font-bold text-blue-600">
                                                RM {total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Customer & Order Info */}
                        <div className="space-y-6">
                            {/* Customer Information */}
                            <div className="bg-white border border-gray-200 rounded-lg">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <User size={18} />
                                        Customer Information
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Customer Name
                                            </p>
                                            <p className="text-gray-900">
                                                {selectedOrder.user?.name ||
                                                    "N/A"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                <Mail size={14} />
                                                Email
                                            </p>
                                            <p className="text-gray-900 break-all">
                                                {selectedOrder.user?.email ||
                                                    "N/A"}
                                            </p>
                                        </div>
                                        {selectedOrder.user?.phone && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                    <Phone size={14} />
                                                    Phone
                                                </p>
                                                <p className="text-gray-900">
                                                    {selectedOrder.user.phone}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Order Information */}
                            <div className="bg-white border border-gray-200 rounded-lg">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Hash size={18} />
                                        Order Information
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Order ID
                                            </p>
                                            <p className="text-gray-900 font-mono">
                                                {selectedOrder.order_id}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Payment Method
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <CreditCard
                                                    size={14}
                                                    className="text-gray-500"
                                                />
                                                <span className="capitalize text-gray-900">
                                                    {selectedOrder.payment_method?.replace(
                                                        /_/g,
                                                        " "
                                                    ) || "Credit Card"}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Payment Status
                                            </p>
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                                                    selectedOrder.payment_status ===
                                                    "paid"
                                                        ? "bg-green-100 text-green-800"
                                                        : selectedOrder.payment_status ===
                                                          "pending"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {selectedOrder.payment_status?.toUpperCase() ||
                                                    "PENDING"}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Order Date
                                            </p>
                                            <p className="text-gray-900">
                                                {dayjs(
                                                    selectedOrder.created_at
                                                ).format(
                                                    "DD MMM YYYY, hh:mm A"
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Information */}
                            <div className="bg-white border border-gray-200 rounded-lg">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <MapPin size={18} />
                                        Shipping Information
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Shipping Address
                                            </p>
                                            <p className="text-gray-900 text-sm leading-relaxed">
                                                {selectedOrder.user.address ||
                                                    "Shipping address not specified"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200">
                        <div className="flex flex-wrap gap-2 order-2 sm:order-1">
                            {selectedOrder.status === "Processing" && (
                                <>
                                    <button
                                        onClick={() => {
                                            updateOrderStatus(
                                                selectedOrder.id,
                                                "Shipped"
                                            );
                                            handleClose();
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex-1 sm:flex-none justify-center"
                                    >
                                        <Truck size={16} />
                                        <span className="hidden sm:inline">
                                            Mark as Shipped
                                        </span>
                                        <span className="sm:hidden">
                                            Shipped
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateOrderStatus(
                                                selectedOrder.id,
                                                "Cancelled"
                                            );
                                            handleClose();
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex-1 sm:flex-none justify-center"
                                    >
                                        <XCircle size={16} />
                                        <span className="hidden sm:inline">
                                            Cancel Order
                                        </span>
                                        <span className="sm:hidden">
                                            Cancel
                                        </span>
                                    </button>
                                </>
                            )}

                            {selectedOrder.status === "Shipped" && (
                                <button
                                    onClick={() => {
                                        updateOrderStatus(
                                            selectedOrder.id,
                                            "Delivered"
                                        );
                                        handleClose();
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex-1 sm:flex-none justify-center"
                                >
                                    <CheckCircle size={16} />
                                    <span className="hidden sm:inline">
                                        Mark as Delivered
                                    </span>
                                    <span className="sm:hidden">Delivered</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
