<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Account Reactivated</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }

        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }

        .success-box {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Account Reactivated</h1>
        </div>

        <div class="content">
            <h2>Dear {{ $userName }},</h2>

            <div class="success-box">
                <h3 style="color: #155724; margin: 0;">✅ Your Account Has Been Reactivated</h3>
            </div>

            <p>We're pleased to inform you that your Relove Market account has been successfully reactivated and is now
                fully accessible.</p>

            <h3>What's Restored:</h3>
            <ul>
                <li>Full access to your account dashboard</li>
                <li>Ability to browse and purchase items</li>
                <li>Your seller listings (if applicable)</li>
                <li>Messaging with other users</li>
            </ul>

            <h3>Important Information:</h3>
            <p>Please ensure you review and comply with our <a href="{{ url('/terms') }}">Terms of Service</a> and <a
                    href="{{ url('/community-guidelines') }}">Community Guidelines</a> to avoid any future restrictions.
            </p>

            <p>If you have any questions or need assistance, please don't hesitate to contact our support team:</p>

            <p>
                <strong>Email:</strong> {{ $supportEmail }}
            </p>

            <p>Welcome back to the Relove Market community!</p>

            <div class="footer">
                <p>This email was sent on {{ $currentDate }}</p>
                <p>&copy; {{ date('Y') }} {{ $platformName }}. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>

</html>
