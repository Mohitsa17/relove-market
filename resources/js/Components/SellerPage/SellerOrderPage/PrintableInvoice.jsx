// components/PrintableInvoice.jsx
import React from "react";
import dayjs from "dayjs";

const PrintableInvoice = React.forwardRef(({ order }, ref) => {
    const calculateOrderTotals = () => {
        const subtotal =
            order.order_items?.reduce(
                (sum, item) =>
                    sum + (parseFloat(item.price) || 0) * (item.quantity || 1),
                0
            ) || 0;
        const shipping = parseFloat(order.shipping_fee) || 0;
        const total = parseFloat(order.amount) || subtotal + shipping;
        return { subtotal, shipping, total };
    };

    const { subtotal, shipping, total } = calculateOrderTotals();

    return (
        <div ref={ref} className="p-8 bg-white">
            <style>
                {`
                @media print {
                    body { margin: 0; padding: 0; }
                    .no-print { display: none !important; }
                    @page { margin: 0.5cm; size: A4 portrait; }
                }
                .invoice-container { max-width: 1000px; margin: 0 auto; font-family: Arial, sans-serif; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                .order-id { background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 10px; }
                .section { border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }
                .section-header { background: #f8fafc; padding: 15px 20px; border-bottom: 1px solid #e5e7eb; font-weight: 600; }
                .section-body { padding: 20px; }
                .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
                .info-item { margin-bottom: 12px; }
                .info-label { font-weight: 600; color: #6b7280; font-size: 14px; margin-bottom: 4px; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e5e7eb; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .totals { background: #f8fafc; border-radius: 8px; padding: 20px; margin-top: 20px; }
                .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
                .total-final { font-size: 18px; font-weight: 700; border-top: 2px solid #e5e7eb; padding-top: 12px; }
                .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
                .status-pending { background: #fef3c7; color: #92400e; }
                .status-processing { background: #dbeafe; color: #1e40af; }
                .status-shipped { background: #e0e7ff; color: #3730a3; }
                .status-delivered { background: #d1fae5; color: #065f46; }
                .status-completed { background: #d1fae5; color: #065f46; }
                .status-cancelled { background: #fee2e2; color: #991b1b; }
                .payment-badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; color: white; }
                .payment-paid { background: #10b981; }
                .payment-pending { background: #f59e0b; }
                .payment-failed { background: #ef4444; }
                .product-info { display: flex; align-items: flex-start; gap: 12px; }
                .product-image { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb; }
                .product-details { flex: 1; }
                .product-name { font-weight: 600; margin-bottom: 4px; }
                .product-id { font-size: 12px; color: #6b7280; }
                .variant-info { font-size: 12px; color: #6b7280; font-style: italic; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; }
                `}
            </style>

            <div className="invoice-container">
                {/* Header */}
                <div className="header">
                    <h1>INVOICE</h1>
                    <h2>Thank you for your business</h2>
                </div>

                <div className="content">
                    {/* Order & Customer Information */}
                    <div className="info-grid">
                        {/* Order Information */}
                        <div className="section">
                            <div className="section-header">
                                Order Information
                            </div>
                            <div className="section-body">
                                <div className="info-item">
                                    <div className="info-label">Order ID</div>
                                    <div className="info-value">
                                        {order.order_id}
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-label">Order Date</div>
                                    <div className="info-value">
                                        {dayjs(order.created_at).format(
                                            "DD MMM YYYY, hh:mm A"
                                        )}
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-label">
                                        Order Status
                                    </div>
                                    <div className="info-value">
                                        <span
                                            className={`status-badge status-${order.order_status?.toLowerCase()}`}
                                        >
                                            {order.order_status}
                                        </span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-label">
                                        Payment Method
                                    </div>
                                    <div
                                        className="info-value"
                                        style={{ textTransform: "capitalize" }}
                                    >
                                        {order.payment_method?.replace(
                                            /_/g,
                                            " "
                                        ) || "Credit Card"}
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-label">
                                        Payment Status
                                    </div>
                                    <div className="info-value">
                                        <span
                                            className={`payment-badge ${
                                                order.payment_status ===
                                                "pending"
                                                    ? "payment-pending"
                                                    : order.payment_status ===
                                                      "failed"
                                                    ? "payment-failed"
                                                    : "payment-paid"
                                            }`}
                                        >
                                            {order.payment_status?.toUpperCase() ||
                                                "PAID"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="section">
                            <div className="section-header">
                                Customer Information
                            </div>
                            <div className="section-body">
                                <div className="info-item">
                                    <div className="info-label">
                                        Customer Name
                                    </div>
                                    <div className="info-value">
                                        {order.user?.name || "N/A"}
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-label">Email</div>
                                    <div className="info-value">
                                        {order.user?.email || "N/A"}
                                    </div>
                                </div>
                                {order.user?.phone && (
                                    <div className="info-item">
                                        <div className="info-label">Phone</div>
                                        <div className="info-value">
                                            {order.user.phone}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Shipping Information */}
                    {(order.shipping_address || order.tracking_number) && (
                        <div className="section">
                            <div className="section-header">
                                Shipping Information
                            </div>
                            <div className="section-body">
                                {order.shipping_address && (
                                    <div className="info-item">
                                        <div className="info-label">
                                            Shipping Address
                                        </div>
                                        <div className="info-value">
                                            {order.shipping_address}
                                        </div>
                                    </div>
                                )}
                                {order.tracking_number && (
                                    <div className="info-item">
                                        <div className="info-label">
                                            Tracking Number
                                        </div>
                                        <div className="info-value">
                                            {order.tracking_number}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="section">
                        <div className="section-header">Order Items</div>
                        <div className="section-body">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th className="text-right">
                                            Unit Price
                                        </th>
                                        <th className="text-center">Qty</th>
                                        <th className="text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.order_items?.map((item, index) => {
                                        const itemTotal =
                                            (parseFloat(item.price) || 0) *
                                            (item.quantity || 1);
                                        const variantText =
                                            item.selected_variant
                                                ? Object.entries(
                                                      JSON.parse(
                                                          item.selected_variant
                                                              .combination ||
                                                              "{}"
                                                      )
                                                  )
                                                      .map(
                                                          ([key, value]) =>
                                                              `${key}: ${value}`
                                                      )
                                                      .join(", ")
                                                : "";

                                        const imageUrl = `${
                                            import.meta.env.VITE_BASE_URL || ""
                                        }${
                                            item.product_image?.image_path ||
                                            item.product?.product_image?.[0]
                                                ?.image_path ||
                                            "/default-image.jpg"
                                        }`;

                                        return (
                                            <tr key={index}>
                                                <td>
                                                    <div className="product-info">
                                                        <img
                                                            src={imageUrl}
                                                            alt={
                                                                item.product
                                                                    ?.product_name ||
                                                                "Product"
                                                            }
                                                            className="product-image"
                                                            onError={(e) => {
                                                                e.target.src =
                                                                    "../image/no-image.png";
                                                            }}
                                                        />
                                                        <div className="product-details">
                                                            <div className="product-name">
                                                                {item.product
                                                                    ?.product_name ||
                                                                    "N/A"}
                                                            </div>
                                                            <div className="product-id">
                                                                ID:{" "}
                                                                {
                                                                    item.product_id
                                                                }
                                                            </div>
                                                            {variantText && (
                                                                <div className="variant-info">
                                                                    {
                                                                        variantText
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-right">
                                                    RM{" "}
                                                    {parseFloat(
                                                        item.price || 0
                                                    ).toFixed(2)}
                                                </td>
                                                <td className="text-center">
                                                    {item.quantity || 1}
                                                </td>
                                                <td className="text-right">
                                                    RM {itemTotal.toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="section">
                        <div className="section-header">Order Summary</div>
                        <div className="section-body">
                            <div className="totals">
                                <div className="total-row">
                                    <span>Subtotal:</span>
                                    <span>RM {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="total-row">
                                    <span>Shipping Fee:</span>
                                    <span>RM 5.00</span>
                                </div>
                                <div className="total-row total-final">
                                    <span>Total Amount:</span>
                                    <span>RM {total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="footer">
                        <div className="company-info">
                            <div style={{ fontWeight: 600, marginBottom: 5 }}>
                                Relove Market
                            </div>
                            <div>relovemarket006@gmail.com | +60126547653</div>
                        </div>
                        <div
                            className="thank-you"
                            style={{
                                fontSize: 16,
                                fontWeight: 600,
                                margin: "20px 0",
                                color: "#374151",
                            }}
                        >
                            Thank you for your purchase!
                        </div>
                        <div>
                            If you have any questions about this invoice, please
                            contact our customer service.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

PrintableInvoice.displayName = "PrintableInvoice";
export default PrintableInvoice;
