<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seller Application Update - Relove Market</title>
    <style>
        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #fef2f2 0%, #fed7d7 100%);
            padding: 20px;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        /* Header */
        .email-header {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
            position: relative;
        }

        .status-icon {
            font-size: 48px;
            margin-bottom: 15px;
            display: block;
        }

        .header-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .header-subtitle {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
        }

        /* Content */
        .email-content {
            padding: 40px 30px;
        }

        .greeting {
            font-size: 22px;
            color: #1f2937;
            margin-bottom: 20px;
            font-weight: 600;
        }

        .message {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 20px;
            line-height: 1.7;
        }

        .highlight {
            color: #dc2626;
            font-weight: 600;
        }

        /* Rejection Notice */
        .rejection-notice {
            background: #fef2f2;
            border: 2px solid #fecaca;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }

        .notice-title {
            color: #dc2626;
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .reason-box {
            background: white;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin-top: 15px;
        }

        .reason-text {
            color: #7f1d1d;
            font-style: italic;
            line-height: 1.6;
        }

        /* Improvement Tips */
        .improvement-section {
            background: #fffbeb;
            border: 2px solid #fed7aa;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }

        .improvement-title {
            color: #d97706;
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .tips-list {
            list-style: none;
            padding: 0;
        }

        .tip-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 12px;
            color: #92400e;
        }

        .tip-icon {
            color: #d97706;
            font-weight: bold;
            flex-shrink: 0;
            margin-top: 2px;
        }

        /* Next Steps */
        .next-steps {
            background: #f0f9ff;
            border: 2px solid #bae6fd;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }

        .steps-title {
            color: #0369a1;
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .steps-list {
            list-style: none;
            padding: 0;
        }

        .step-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 12px;
            color: #0c4a6e;
        }

        .step-number {
            background: #0369a1;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            flex-shrink: 0;
            margin-top: 2px;
        }

        /* CTA Section */
        .cta-section {
            text-align: center;
            margin: 30px 0;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            padding: 14px 35px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 15px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
            margin-bottom: 15px;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
        }

        .cta-note {
            color: #6b7280;
            font-size: 14px;
        }

        /* Support Section */
        .support-section {
            background: #f8fafc;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
        }

        .support-title {
            color: #374151;
            font-size: 16px;
            margin-bottom: 10px;
            font-weight: 600;
        }

        .support-contact {
            color: #dc2626;
            font-weight: 600;
            text-decoration: none;
        }

        .support-contact:hover {
            text-decoration: underline;
        }

        /* Footer */
        .email-footer {
            background: #1f2937;
            color: #9ca3af;
            padding: 30px;
            text-align: center;
        }

        .footer-logo {
            font-size: 20px;
            font-weight: 700;
            color: #dc2626;
            margin-bottom: 10px;
        }

        .footer-tagline {
            font-size: 14px;
            margin-bottom: 20px;
            opacity: 0.8;
        }

        .footer-links {
            margin-bottom: 20px;
        }

        .footer-link {
            color: #9ca3af;
            text-decoration: none;
            margin: 0 10px;
            font-size: 13px;
            transition: color 0.3s ease;
        }

        .footer-link:hover {
            color: #dc2626;
        }

        .copyright {
            font-size: 12px;
            opacity: 0.7;
            margin-top: 15px;
        }

        /* Responsive design */
        @media (max-width: 600px) {
            .email-content {
                padding: 30px 20px;
            }

            .email-header {
                padding: 30px 20px;
            }

            .header-title {
                font-size: 24px;
            }

            .greeting {
                font-size: 20px;
            }

            .cta-button {
                padding: 12px 25px;
                font-size: 14px;
            }
        }
    </style>
</head>

<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <span class="status-icon">⚠️</span>
            <h1 class="header-title">Application Status Update</h1>
            <p class="header-subtitle">Important information about your seller registration</p>
        </div>

        <!-- Main Content -->
        <div class="email-content">
            <h2 class="greeting">Hi {{ $sellerRegistered->name }},</h2>

            <p class="message">
                Thank you for your interest in joining the Relove Market seller community.
                After careful review, we regret to inform you that your application has been
                <span class="highlight">not approved at this time</span>.
            </p>

            <!-- Rejection Notice -->
            <div class="rejection-notice">
                <div class="notice-title">
                    <span>📋</span>
                    Review Notes
                </div>
                <p style="color: #7f1d1d; margin-bottom: 15px;">
                    Our team has provided the following feedback to help you understand our decision:
                </p>
                <div class="reason-box">
                    <p class="reason-text">{{ $reason }}</p>
                </div>
            </div>

            <!-- Improvement Tips -->
            <div class="improvement-section">
                <div class="improvement-title">
                    <span>💡</span>
                    Suggestions for Improvement
                </div>
                <ul class="tips-list">
                    <li class="tip-item">
                        <span class="tip-icon">•</span>
                        <span>Carefully review the feedback provided above</span>
                    </li>
                    <li class="tip-item">
                        <span class="tip-icon">•</span>
                        <span>Ensure all required documentation is complete and clear</span>
                    </li>
                    <li class="tip-item">
                        <span class="tip-icon">•</span>
                        <span>Review our seller guidelines and requirements</span>
                    </li>
                    <li class="tip-item">
                        <span class="tip-icon">•</span>
                        <span>Consider how you can better align with our community standards</span>
                    </li>
                </ul>
            </div>

            <!-- Next Steps -->
            <div class="next-steps">
                <div class="steps-title">
                    <span>🔄</span>
                    You Can Reapply
                </div>
                <p style="color: #0c4a6e; margin-bottom: 15px;">
                    We encourage you to address the concerns mentioned and submit a new application:
                </p>
                <ul class="steps-list">
                    <li class="step-item">
                        <div class="step-number">1</div>
                        <span>Review and address the feedback provided</span>
                    </li>
                    <li class="step-item">
                        <div class="step-number">2</div>
                        <span>Update your application materials as needed</span>
                    </li>
                    <li class="step-item">
                        <div class="step-number">3</div>
                        <span>Submit a new application through our portal</span>
                    </li>
                </ul>
            </div>

            <!-- CTA Section -->
            <div class="cta-section">
                <a href="{{ route('seller-registration') }}" class="cta-button">
                    Submit New Application
                </a>
                <p class="cta-note">
                    Your new application will be reviewed by our team within 3-5 business days
                </p>
            </div>

            <!-- Support Section -->
            <div class="support-section">
                <p class="support-title">Need Help with Your Application?</p>
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
                    Our support team is here to help you understand our requirements better.
                </p>
                <a href="mailto:seller-support@relovemarket.com" class="support-contact">
                    seller-support@relovemarket.com
                </a>
            </div>

            <!-- Closing Message -->
            <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 15px;">
                    We appreciate your interest in Relove Market and hope to see a new application from you soon.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <div class="footer-logo">🔄 Relove Market</div>
            <div class="footer-tagline">Building a Trusted Marketplace Community</div>

            <div class="footer-links">
                <a href="#" class="footer-link">Seller Guidelines</a>
                <a href="#" class="footer-link">Help Center</a>
                <a href="#" class="footer-link">Community Standards</a>
                <a href="#" class="footer-link">Contact Us</a>
            </div>

            <div class="copyright">
                &copy; 2024 Relove Market. All rights reserved.<br>
                Committed to maintaining high standards for our community.
            </div>
        </div>
    </div>
</body>

</html>
