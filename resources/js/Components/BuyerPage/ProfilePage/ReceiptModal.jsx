import {
    X,
    Printer,
    Truck,
    CreditCard,
    Shield,
    Package,
    CheckCircle,
} from "lucide-react";
import { useRef } from "react";

export function ReceiptModal({
    order,
    isOpen,
    onClose,
    confirmOrderDelivery,
    confirmingOrderId,
}) {
    const receiptRef = useRef(null);

    if (!isOpen) return null;

    // Calculate additional fees
    const subtotal =
        order.order_items?.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        ) || 0;
    const shippingFee = order.shipping_fee || 5.0;
    const totalAmount = order.amount;

    // Format currency
    const formatCurrency = (amount) => `RM ${parseFloat(amount).toFixed(2)}`;

    // NEW: Function to parse and display combination data
    const getCombinationDisplay = (item) => {
        console.log(item);

        if (!item.selected_variant.combination) return null;

        try {
            // Parse the combination JSON string
            const combinationData = JSON.parse(
                item.selected_variant.combination
            );
            const parts = [];

            // Handle different combination structures
            if (typeof combinationData === "object") {
                // For object format like {"Colors":"red","Size":"U16"}
                Object.entries(combinationData).forEach(([key, value]) => {
                    if (value && value !== "null" && value !== "") {
                        parts.push(`${key}: ${value}`);
                    }
                });
            } else if (typeof combinationData === "string") {
                // For string format, split by delimiter if needed
                parts.push(combinationData);
            }

            return parts.length > 0 ? parts.join(" • ") : null;
        } catch (error) {
            console.error("Error parsing combination:", error);
            // Fallback: display the raw combination string
            return item.combination && typeof item.combination === "string"
                ? item.combination
                      .replace(/[{}"]/g, "")
                      .replace(/:/g, ": ")
                      .replace(/,/g, " • ")
                : null;
        }
    };

    // NEW: Function to get combination details for detailed display
    const getCombinationDetails = (item) => {
        if (!item.combination) return null;

        try {
            const combinationData = JSON.parse(item.combination);
            const details = [];

            if (typeof combinationData === "object") {
                Object.entries(combinationData).forEach(([key, value]) => {
                    if (value && value !== "null" && value !== "") {
                        details.push({
                            label: key,
                            value: value,
                        });
                    }
                });
            }

            return details.length > 0 ? details : null;
        } catch (error) {
            return null;
        }
    };

    // Handle delivery confirmation
    const handleConfirmDelivery = () => {
        if (confirmOrderDelivery) {
            confirmOrderDelivery(order.order_id);
        }
    };

    // Print function
    const handlePrint = () => {
        const printWindow = window.open("", "_blank", "width=800,height=600");
        const receiptContent = receiptRef.current.innerHTML;

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt - ${order.order_id}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.4;
                        color: #000;
                        background: white;
                        padding: 20px;
                    }
                    .print-receipt {
                        max-width: 800px;
                        margin: 0 auto;
                        background: white;
                    }
                    .print-header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #000;
                    }
                    .print-header h1 {
                        font-size: 28px;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .print-header .subtitle {
                        font-size: 14px;
                        color: #666;
                    }
                    .print-section {
                        margin-bottom: 25px;
                    }
                    .print-section h2 {
                        font-size: 18px;
                        font-weight: bold;
                        margin-bottom: 15px;
                        border-bottom: 1px solid #ddd;
                        padding-bottom: 5px;
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        margin-bottom: 20px;
                    }
                    .info-item {
                        margin-bottom: 8px;
                    }
                    .info-label {
                        font-weight: 600;
                        color: #333;
                    }
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    .items-table th {
                        background-color: #f8f9fa;
                        border: 1px solid #ddd;
                        padding: 12px 8px;
                        text-align: left;
                        font-weight: bold;
                        font-size: 14px;
                    }
                    .items-table td {
                        border: 1px solid #ddd;
                        padding: 10px 8px;
                        font-size: 14px;
                    }
                    .items-table .text-right {
                        text-align: right;
                    }
                    .items-table .text-center {
                        text-align: center;
                    }
                    .combination-info {
                        font-size: 12px;
                        color: #666;
                        margin-top: 4px;
                    }
                    .combination-badge {
                        display: inline-block;
                        background: #f3f4f6;
                        border: 1px solid #e5e7eb;
                        border-radius: 4px;
                        padding: 2px 6px;
                        margin: 2px 4px 2px 0;
                        font-size: 11px;
                    }
                    .summary-table {
                        width: 100%;
                        max-width: 300px;
                        margin-left: auto;
                        border-collapse: collapse;
                    }
                    .summary-table td {
                        padding: 8px 12px;
                        border-bottom: 1px solid #ddd;
                    }
                    .summary-table .total-row {
                        font-weight: bold;
                        font-size: 16px;
                        border-top: 2px solid #000;
                    }
                    .status-badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: bold;
                    }
                    .paid {
                        background-color: #d1fae5;
                        color: #065f46;
                    }
                    .pending {
                        background-color: #fef3c7;
                        color: #92400e;
                    }
                    .print-footer {
                        text-align: center;
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        font-size: 12px;
                        color: #666;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                        .print-receipt {
                            margin: 0;
                            padding: 20px;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-receipt">
                    <div class="print-header">
                        <h1>Relove Market</h1>
                        <p class="subtitle">Sustainable Shopping Marketplace</p>
                        <p><strong>Order Receipt</strong> - ${
                            order.order_id
                        }</p>
                        <p>${new Date(order.created_at).toLocaleDateString(
                            "en-MY",
                            {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            }
                        )}</p>
                    </div>

                    <div class="print-section">
                        <div class="info-grid">
                            <div>
                                <h2>Order Information</h2>
                                <div class="info-item">
                                    <span class="info-label">Payment Method:</span> ${
                                        order.payment_method || "Credit Card"
                                    }
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Order Status:</span> 
                                    <span class="status-badge ${
                                        order.order_status === "completed"
                                            ? "paid"
                                            : "pending"
                                    }">
                                        ${order.order_status.toUpperCase()}
                                    </span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Payment Status:</span> 
                                    <span class="status-badge ${
                                        order.payment_status === "paid"
                                            ? "paid"
                                            : "pending"
                                    }">
                                        ${
                                            order.payment_status?.toUpperCase() ||
                                            "PENDING"
                                        }
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h2>Customer Information</h2>
                                <div class="info-item">
                                    <span class="info-label">Name:</span> ${
                                        order.user?.name || "N/A"
                                    }
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Email:</span> ${
                                        order.user?.email || "N/A"
                                    }
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Address:</span> ${
                                        order.user?.address ||
                                        "No address provided"
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="print-section">
                        <h2>Order Items</h2>
                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th class="text-center">Qty</th>
                                    <th class="text-right">Unit Price</th>
                                    <th class="text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.order_items
                                    ?.map((item) => {
                                        const combinationDisplay =
                                            getCombinationDisplay(item);
                                        return `
                                    <tr>
                                        <td>
                                            <strong>${
                                                item.product?.product_name
                                            }</strong>
                                            ${
                                                combinationDisplay
                                                    ? `
                                            <div class="combination-info">
                                                ${combinationDisplay
                                                    .split(" • ")
                                                    .map(
                                                        (part) =>
                                                            `<span class="combination-badge">${part}</span>`
                                                    )
                                                    .join("")}
                                            </div>
                                            `
                                                    : ""
                                            }
                                            <br>
                                            <small>Seller: ${
                                                item.product?.seller
                                                    ?.seller_store
                                                    ?.store_name || "N/A"
                                            }</small>
                                        </td>
                                        <td class="text-center">${
                                            item.quantity
                                        }</td>
                                        <td class="text-right">${formatCurrency(
                                            item.price
                                        )}</td>
                                        <td class="text-right"><strong>${formatCurrency(
                                            item.price * item.quantity
                                        )}</strong></td>
                                    </tr>
                                `;
                                    })
                                    .join("")}
                            </tbody>
                        </table>
                    </div>

                    <div class="print-section">
                        <h2>Payment Summary</h2>
                        <table class="summary-table">
                            <tr>
                                <td>Subtotal:</td>
                                <td class="text-right">${formatCurrency(
                                    subtotal
                                )}</td>
                            </tr>
                            <tr>
                                <td>Shipping Fee:</td>
                                <td class="text-right">${formatCurrency(
                                    shippingFee
                                )}</td>
                            </tr>
                            <tr class="total-row">
                                <td>Total Amount:</td>
                                <td class="text-right">${formatCurrency(
                                    totalAmount
                                )}</td>
                            </tr>
                        </table>
                    </div>

                    <div class="print-footer">
                        <p><strong>Thank you for shopping with Relove Market!</strong></p>
                        <p>support@relovemarket.com | www.relovemarket.com | +1 (555) 123-4567</p>
                        <p style="margin-top: 10px; font-style: italic;">
                            This is a computer-generated receipt. No signature is required.
                        </p>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => {
                            window.close();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    // Render commission information
    const renderCommissionInfo = () => {
        if (order.order_status === "Completed" && order.commission_amount) {
            return (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between text-sm">
                        <span className="text-blue-800">
                            Platform Commission (8%):
                        </span>
                        <span className="font-semibold text-blue-900">
                            RM {parseFloat(order.commission_amount).toFixed(2)}
                        </span>
                    </div>
                    {order.seller_amount && (
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-blue-800">
                                Amount to Seller:
                            </span>
                            <span className="font-semibold text-blue-900">
                                RM {parseFloat(order.seller_amount).toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4 border-b border-blue-500 border-opacity-30 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {/* Left Section - Order Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold truncate">
                            Order Receipt
                        </h3>
                        <p className="text-blue-100 text-xs sm:text-sm truncate mt-0.5">
                            {order.order_id}
                        </p>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:space-x-2">
                        {/* Print Button */}
                        <button
                            onClick={handlePrint}
                            className="flex-1 sm:flex-none flex items-center justify-center bg-white text-blue-600 px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm sm:text-base min-w-0"
                        >
                            <Printer
                                size={16}
                                className="sm:size-[18px] mr-1.5 sm:mr-2 flex-shrink-0"
                            />
                            <span className="truncate">Print</span>
                        </button>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 p-1.5 sm:p-2 text-white hover:bg-white hover:bg-opacity-20 transition-colors rounded-full"
                        >
                            <X size={20} className="sm:size-6" />
                        </button>
                    </div>
                </div>

                <div
                    className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]"
                    ref={receiptRef}
                >
                    {/* Receipt Content */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        {/* Receipt Header */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
                            <div className="flex flex-col md:flex-row justify-between items-center">
                                <div className="text-center md:text-left mb-4 md:mb-0">
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                                        <Package
                                            className="text-blue-600"
                                            size={28}
                                        />
                                        Relove Market
                                    </h2>
                                    <p className="text-gray-600">
                                        Sustainable Shopping Marketplace
                                    </p>
                                </div>
                                <div className="text-center md:text-right">
                                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                                        {order.payment_status === "paid"
                                            ? "PAID"
                                            : order.payment_status}
                                    </div>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {new Date(
                                            order.created_at
                                        ).toLocaleDateString("en-MY", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order and Shipping Information */}
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 border-b border-gray-200">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <CreditCard size={18} />
                                    Order Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Payment Method:
                                        </span>
                                        <span className="font-medium capitalize text-black">
                                            {order.payment_method ||
                                                "Credit Card"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Order Status:
                                        </span>
                                        <span
                                            className={`font-medium capitalize px-2 py-1 rounded-full text-xs ${
                                                order.order_status ===
                                                "completed"
                                                    ? "bg-green-100 text-green-800"
                                                    : order.order_status ===
                                                      "processing"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : order.order_status ===
                                                      "shipped"
                                                    ? "bg-purple-100 text-purple-800"
                                                    : order.order_status ===
                                                      "delivered"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {order.order_status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Truck size={18} />
                                    Shipping Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Customer:
                                        </span>
                                        <span className="font-medium text-right text-black">
                                            {order.user?.name || "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Email:
                                        </span>
                                        <span className="font-medium text-black">
                                            {order.user?.email || "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Shipping Address:
                                        </span>
                                        <span className="font-medium text-right text-black max-w-[200px]">
                                            {order.user?.address ||
                                                "No address provided"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items Section */}
                        <div className="p-6 border-b border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Package size={18} />
                                Order Items ({order.order_items?.length || 0})
                            </h4>

                            {/* Mobile View - Card Layout */}
                            <div className="md:hidden space-y-4">
                                {order.order_items?.map((item, index) => {
                                    const combinationDisplay =
                                        getCombinationDisplay(item);
                                    const combinationDetails =
                                        getCombinationDetails(item);

                                    return (
                                        <div
                                            key={index}
                                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                                        >
                                            <div className="flex items-start space-x-3 mb-3">
                                                {item.product
                                                    ?.product_image?.[0]
                                                    ?.image_path && (
                                                    <img
                                                        src={`${
                                                            import.meta.env
                                                                .VITE_BASE_URL
                                                        }${
                                                            item.product
                                                                .product_image[0]
                                                                .image_path
                                                        }`}
                                                        alt={
                                                            item.product
                                                                .product_name
                                                        }
                                                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                                                        {
                                                            item.product
                                                                ?.product_name
                                                        }
                                                    </h5>

                                                    {/* Combination Display */}
                                                    {combinationDisplay && (
                                                        <div className="mb-2">
                                                            <div className="flex flex-wrap gap-1">
                                                                {combinationDisplay
                                                                    .split(
                                                                        " • "
                                                                    )
                                                                    .map(
                                                                        (
                                                                            part,
                                                                            idx
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded border border-blue-200"
                                                                            >
                                                                                {
                                                                                    part
                                                                                }
                                                                            </span>
                                                                        )
                                                                    )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <p className="text-xs text-gray-500 mb-2">
                                                        Seller:{" "}
                                                        {item.product?.seller
                                                            ?.seller_store
                                                            ?.store_name ||
                                                            "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-600">
                                                        Quantity:
                                                    </span>
                                                    <div className="font-medium text-black bg-white px-2 py-1 rounded border inline-block">
                                                        {item.quantity}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">
                                                        Unit Price:
                                                    </span>
                                                    <div className="font-medium text-black">
                                                        {formatCurrency(
                                                            item.price
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-span-2 border-t pt-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">
                                                            Total:
                                                        </span>
                                                        <span className="font-semibold text-blue-600">
                                                            {formatCurrency(
                                                                item.price *
                                                                    item.quantity
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Desktop View - Scrollable Table */}
                            <div className="hidden md:block">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse min-w-[600px]">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">
                                                    Product
                                                </th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b">
                                                    Qty
                                                </th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 border-b">
                                                    Unit Price
                                                </th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 border-b">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.order_items?.map(
                                                (item, index) => {
                                                    const combinationDisplay =
                                                        getCombinationDisplay(
                                                            item
                                                        );

                                                    return (
                                                        <tr
                                                            key={index}
                                                            className="hover:bg-gray-50 transition-colors"
                                                        >
                                                            <td className="px-4 py-3 border-b">
                                                                <div className="flex items-center space-x-3">
                                                                    {item
                                                                        .product
                                                                        ?.product_image?.[0]
                                                                        ?.image_path && (
                                                                        <img
                                                                            src={`${
                                                                                import.meta
                                                                                    .env
                                                                                    .VITE_BASE_URL
                                                                            }${
                                                                                item
                                                                                    .product
                                                                                    .product_image[0]
                                                                                    .image_path
                                                                            }`}
                                                                            alt={
                                                                                item
                                                                                    .product
                                                                                    .product_name
                                                                            }
                                                                            className="w-10 h-10 object-cover rounded"
                                                                        />
                                                                    )}
                                                                    <div className="min-w-0">
                                                                        <div className="font-medium text-gray-900 truncate max-w-[200px]">
                                                                            {
                                                                                item
                                                                                    .product
                                                                                    ?.product_name
                                                                            }
                                                                        </div>

                                                                        {/* Combination Display */}
                                                                        {combinationDisplay && (
                                                                            <div className="mt-1">
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    {combinationDisplay
                                                                                        .split(
                                                                                            " • "
                                                                                        )
                                                                                        .map(
                                                                                            (
                                                                                                part,
                                                                                                idx
                                                                                            ) => (
                                                                                                <span
                                                                                                    key={
                                                                                                        idx
                                                                                                    }
                                                                                                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded border border-blue-200"
                                                                                                >
                                                                                                    {
                                                                                                        part
                                                                                                    }
                                                                                                </span>
                                                                                            )
                                                                                        )}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        <div className="text-sm text-gray-500 truncate max-w-[200px]">
                                                                            Seller:{" "}
                                                                            {item
                                                                                .product
                                                                                ?.seller
                                                                                ?.seller_store
                                                                                ?.store_name ||
                                                                                "N/A"}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-center border-b">
                                                                <span className="bg-gray-100 px-3 py-1 rounded text-sm font-medium text-black">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right border-b text-gray-900">
                                                                {formatCurrency(
                                                                    item.price
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-right border-b font-semibold text-gray-900">
                                                                {formatCurrency(
                                                                    item.price *
                                                                        item.quantity
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="p-6">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield size={18} />
                                Payment Summary
                            </h4>
                            <div className="max-w-md ml-auto space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        Subtotal:
                                    </span>
                                    <span className="text-gray-900">
                                        {formatCurrency(subtotal)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 flex items-center gap-1">
                                        <Truck size={14} />
                                        Shipping Fee:
                                    </span>
                                    <span className="text-gray-900">
                                        {formatCurrency(shippingFee)}
                                    </span>
                                </div>

                                <div className="border-t border-gray-200 pt-3 mt-3">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span className="text-gray-900">
                                            Total Amount:
                                        </span>
                                        <span className="text-blue-600">
                                            {formatCurrency(totalAmount)}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Status */}
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-4">
                                    <span className="text-sm text-gray-600">
                                        Payment Status:
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            order.payment_status === "paid"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {order.payment_status?.toUpperCase() ||
                                            "PENDING"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Commission Information */}
                        {renderCommissionInfo()}

                        {/* Footer */}
                        <div className="bg-gray-50 p-6 border-t border-gray-200">
                            <div className="text-center text-gray-600 text-sm">
                                <p className="mb-2">
                                    Thank you for shopping with Relove Market!
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs">
                                    <span>📧 support@relovemarket.com</span>
                                    <span>🌐 www.relovemarket.com</span>
                                    <span>📱 +60 126547653</span>
                                </div>
                                <p className="mt-3 text-xs text-gray-500">
                                    This is an computer-generated receipt. No
                                    signature is required.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
