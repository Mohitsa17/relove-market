<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Income Report</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            margin: 20px;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .section {
            margin-bottom: 25px;
        }

        .section-title {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
            color: #333;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 12px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }

        .summary {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
        }

        .total {
            font-weight: bold;
            font-size: 16px;
            color: #2d5016;
            margin-top: 20px;
        }

        .page-break {
            page-break-after: always;
        }
    </style>
</head>

<body>
    <div class='header'>
        <h1>Income Report</h1>
        <p>Generated on: {{ date('F j, Y g:i A') }}</p>
        <p>Period: {{ $data['start_date'] }} to {{ $data['end_date'] }}</p>
    </div>

    <div class='section'>
        <div class='section-title'>Seller Information</div>
        <p><strong>Name:</strong> {{ $data['seller_info']['name'] }}</p>
        <p><strong>Email:</strong> {{ $data['seller_info']['email'] }}</p>
    </div>

    <div class='section'>
        <div class='section-title'>Earnings Summary</div>
        <div class='summary'>
            <p><strong>Total Earnings:</strong> RM {{ number_format($data['summary']['total_earnings'], 2) }}</p>
            <p><strong>Number of Transactions:</strong> {{ $data['summary']['transaction_count'] }}</p>
            <p><strong>Average Order Value:</strong> RM {{ number_format($data['summary']['average_order_value'], 2) }}
            </p>
        </div>
    </div>

    @if (!empty($data['transactions']))
        <div class='section'>
            <div class='section-title'>Transaction Details</div>
            <table>
                <thead>
                    <tr>
                        <th>Date & Time</th>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Product</th>
                        <th>Amount (RM)</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($data['transactions'] as $transaction)
                        <tr>
                            <td>{{ $transaction['date'] }}</td>
                            <td>{{ $transaction['order_id'] }}</td>
                            <td>{{ $transaction['customer_name'] }}</td>
                            <td>{{ $transaction['product_name'] }}</td>
                            <td>{{ number_format($transaction['amount'], 2) }}</td>
                            <td>{{ $transaction['status'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endif

    <div class='section'>
        <div class='total'>Total Earnings: RM {{ number_format($data['summary']['total_earnings'], 2) }}</div>
    </div>
</body>

</html>
