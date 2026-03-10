<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Account Blocked</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

        .alert-box {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }

        .reason-box {
            background: #f8f9fa;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin: 15px 0;
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
            <h1>Account Status Update</h1>
        </div>

        <div class="content">
            <h2>Dear {{ $userName }},</h2>

            <div class="alert-box">
                <h3 style="color: #dc3545; margin: 0;">⚠️ Your Account Has Been Blocked</h3>
            </div>

            <p>We regret to inform you that your Relove Market account has been temporarily blocked.</p>

            <h3>What This Means:</h3>
            <ul>
                <li>You cannot access your account during this period</li>
                <li>Any active listings have been temporarily hidden</li>
                <li>You cannot make purchases or communicate with other users</li>
            </ul>

            <h3>Next Steps:</h3>
            <p>If you believe this action was taken in error, or if you would like to appeal this decision, please
                contact our support team:</p>

            <p>
                <strong>Email:</strong> {{ $supportEmail }}<br>
                <strong>Include:</strong> Your account email and any relevant information
            </p>

            <p>We take these measures to ensure a safe and trustworthy environment for all our users.</p>

            <div class="footer">
                <p>This email was sent on {{ $currentDate }}</p>
                <p>&copy; {{ date('Y') }} {{ $platformName }}. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>

</html>
