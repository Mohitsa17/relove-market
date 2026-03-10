<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Account Deleted</title>
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
            background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
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

        .info-box {
            background: #e2e3e5;
            border: 1px solid #d6d8db;
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
            <h1>Account Deletion Confirmation</h1>
        </div>

        <div class="content">
            <h2>Dear {{ $userName }},</h2>

            <div class="info-box">
                <h3 style="color: #6c757d; margin: 0;">📝 Account Deletion Complete</h3>
            </div>

            <p>This email confirms that your Relove Market account has been permanently deleted as requested.</p>

            <h3>What This Means:</h3>
            <ul>
                <li>All your personal data has been removed from our systems</li>
                <li>Your account can no longer be accessed</li>
                <li>Any active listings have been removed</li>
                <li>Your purchase history has been anonymized</li>
            </ul>

            <h3>Data Retention:</h3>
            <p>Please note that we may retain certain information as required by law or for legitimate business
                purposes, such as transaction records for financial reporting.</p>

            <p>If you have any questions about this process or believe this action was taken in error, please contact
                us:</p>

            <p>
                <strong>Email:</strong> {{ $supportEmail }}
            </p>

            <p>We thank you for being part of the Relove Market community and wish you all the best in your future
                endeavors.</p>

            <div class="footer">
                <p>This email was sent on {{ $currentDate }}</p>
                <p>&copy; {{ date('Y') }} {{ $platformName }}. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>

</html>
