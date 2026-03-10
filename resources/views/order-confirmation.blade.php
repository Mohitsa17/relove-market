<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }

        .content {
            padding: 30px;
        }

        .order-info {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .order-info h2 {
            color: #2d3748;
            margin-top: 0;
            font-size: 18px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 15px;
        }

        .info-item {
            margin-bottom: 8px;
        }

        .info-label {
            font-weight: bold;
            color: #4a5568;
            font-size: 14px;
        }

        .info-value {
            color: #2d3748;
            font-size: 14px;
        }

        .order-items {
            margin: 25px 0;
        }

        .order-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #e2e8f0;
        }

        .order-item:last-child {
            border-bottom: none;
        }

        .item-details {
            flex: 1;
        }

        .item-name {
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 5px;
        }

        .item-variant {
            color: #718096;
            font-size: 14px;
            margin-bottom: 5px;
        }

        .item-quantity {
            color: #718096;
            font-size: 14px;
        }

        .item-price {
            font-weight: bold;
            color: #2d3748;
            text-align: right;
        }

        .total-section {
            background: #f7fafc;
            border-radius: 6px;
            padding: 20px;
            margin-top: 20px;
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }

        .total-row.final {
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            font-weight: bold;
            font-size: 16px;
            color: #2d3748;
        }

        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #718096;
            font-size: 14px;
        }

        .thank-you {
            text-align: center;
            margin: 25px 0;
            color: #4a5568;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-paid {
            background: #c6f6d5;
            color: #276749;
        }

        .status-pending {
            background: #fefcbf;
            color: #744210;
        }
    </style>
</head>

<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for your purchase!</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="thank-you">
                <h2>Hello, {{ $data['buyer_name'] }}!</h2>
                <p>Your order has been successfully placed and is being processed.</p>
            </div>

            <!-- Order Information -->
            <div class="order-info">
                <h2>Order Details</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Order ID</div>
                        <div class="info-value">{{ $data['order_id'] }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Order Date</div>
                        <div class="info-value">{{ $data['order_date'] }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Payment Method</div>
                        <div class="info-value">{{ $data['payment_method'] }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Payment Status</div>
                        <div class="info-value">
                            <span
                                class="status-badge {{ $data['payment_status'] == 'paid' ? 'status-paid' : 'status-pending' }}">
                                {{ ucfirst($data['payment_status']) }}
                            </span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Seller</div>
                        <div class="info-value">{{ $data['seller_name'] }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Store</div>
                        <div class="info-value">{{ $data['store_name'] }}</div>
                    </div>
                </div>
            </div>

            <!-- Order Items -->
            <div class="order-items">
                <h3 style="color: #2d3748; margin-bottom: 15px;">Order Items</h3>
                @foreach ($data['order_items'] as $item)
                    <div class="order-item">
                        <div class="item-details">
                            <div class="item-name">{{ $item['product_name'] }}</div>
                            @if ($item['variant'])
                                <div class="item-variant">{{ $item['variant'] }}</div>
                            @endif
                            <div class="item-quantity">Qty: {{ $item['quantity'] }}</div>
                        </div>
                        <div class="item-price">
                            RM {{ $item['total_price'] }}
                        </div>
                    </div>
                @endforeach
            </div>

            <!-- Total Section -->
            <div class="total-section">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>RM {{ $data['subtotal'] }}</span>
                </div>
                <div class="total-row">
                    <span>Shipping Fee:</span>
                    <span>RM 5.00</span>
                </div>
                <div class="total-row final">
                    <span>Total Amount:</span>
                    <span>RM {{ $data['total'] }}</span>
                </div>
            </div>

            <!-- Next Steps -->
            <div style="margin-top: 25px; padding: 15px; background: #edf2f7; border-radius: 6px;">
                <h4 style="margin-top: 0; color: #2d3748;">What's Next?</h4>
                <ul style="color: #4a5568; padding-left: 20px;">
                    <li>You will receive updates about your order status</li>
                    <li>The seller will prepare your items for shipping</li>
                    <li>You can track your order from your account dashboard</li>
                </ul>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>If you have any questions, please contact our support team.</p>
            <p>Thank you for shopping with us!</p>
        </div>
    </div>
</body>

</html>
