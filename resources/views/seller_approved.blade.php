<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seller Approval - Relove Market</title>
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
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 50px 30px;
            text-align: center;
            color: white;
            position: relative;
        }

        .celebration-icon {
            font-size: 64px;
            margin-bottom: 20px;
            display: block;
        }

        .header-title {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .header-subtitle {
            font-size: 18px;
            opacity: 0.9;
            font-weight: 300;
        }

        /* Content */
        .email-content {
            padding: 50px 40px;
        }

        .greeting {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 25px;
            font-weight: 600;
        }

        .message {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 20px;
            line-height: 1.7;
        }

        .highlight {
            color: #10b981;
            font-weight: 600;
        }

        /* Success Badge */
        .success-badge {
            background: #ecfdf5;
            border: 2px solid #10b981;
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
        }

        .badge-icon {
            font-size: 32px;
            margin-bottom: 10px;
            display: block;
        }

        .badge-text {
            font-size: 18px;
            color: #065f46;
            font-weight: 600;
        }

        /* Next Steps */
        .next-steps {
            background: #f8fafc;
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
        }

        .steps-title {
            font-size: 20px;
            color: #1f2937;
            margin-bottom: 20px;
            font-weight: 600;
            text-align: center;
        }

        .steps-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }

        .step-item {
            text-align: center;
            padding: 15px;
        }

        .step-number {
            width: 36px;
            height: 36px;
            background: #10b981;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 10px;
            font-weight: 600;
        }

        .step-text {
            font-size: 14px;
            color: #4b5563;
        }

        /* CTA Section */
        .cta-section {
            text-align: center;
            margin: 40px 0;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
        }

        /* Benefits */
        .benefits-section {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
        }

        .benefits-title {
            font-size: 20px;
            color: #065f46;
            margin-bottom: 20px;
            font-weight: 600;
            text-align: center;
        }

        .benefits-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }

        .benefit-item {
            text-align: center;
            padding: 15px;
        }

        .benefit-icon {
            font-size: 24px;
            margin-bottom: 8px;
            display: block;
        }

        .benefit-text {
            font-size: 13px;
            color: #065f46;
            font-weight: 500;
        }

        /* Footer */
        .email-footer {
            background: #1f2937;
            color: #9ca3af;
            padding: 40px 30px;
            text-align: center;
        }

        .footer-logo {
            font-size: 24px;
            font-weight: 700;
            color: #10b981;
            margin-bottom: 15px;
        }

        .footer-tagline {
            font-size: 14px;
            margin-bottom: 25px;
            opacity: 0.8;
        }

        .footer-links {
            margin-bottom: 25px;
        }

        .footer-link {
            color: #9ca3af;
            text-decoration: none;
            margin: 0 12px;
            font-size: 14px;
            transition: color 0.3s ease;
        }

        .footer-link:hover {
            color: #10b981;
        }

        .support-info {
            background: #374151;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }

        .support-title {
            color: #10b981;
            font-size: 16px;
            margin-bottom: 10px;
            font-weight: 600;
        }

        .support-text {
            font-size: 14px;
            line-height: 1.5;
        }

        .copyright {
            font-size: 12px;
            opacity: 0.7;
            margin-top: 20px;
        }

        /* Responsive design */
        @media (max-width: 600px) {
            .email-content {
                padding: 30px 20px;
            }

            .email-header {
                padding: 40px 20px;
            }

            .header-title {
                font-size: 28px;
            }

            .steps-grid {
                grid-template-columns: 1fr;
            }

            .benefits-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .cta-button {
                padding: 14px 30px;
                font-size: 15px;
            }
        }
    </style>
</head>

<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <span class="celebration-icon">🎉</span>
            <h1 class="header-title">Welcome to Our Seller Community!</h1>
            <p class="header-subtitle">Your seller account has been approved</p>
        </div>

        <!-- Main Content -->
        <div class="email-content">
            <h2 class="greeting">Hi {{ $sellerRegistered->name }},</h2>

            <p class="message">
                We're excited to inform you that your seller registration has been
                <span class="highlight">successfully approved</span>!
                Welcome to the Relove Market family of trusted sellers.
            </p>

            <p class="message">
                You're now ready to start your journey with us and connect with thousands of
                conscious shoppers looking for quality pre-loved items.
            </p>

            <!-- Success Badge -->
            <div class="success-badge">
                <span class="badge-icon">✅</span>
                <div class="badge-text">Seller Account Verified & Approved</div>
            </div>

            <!-- Next Steps -->
            <div class="next-steps">
                <h3 class="steps-title">Get Started in 3 Easy Steps</h3>
                <div class="steps-grid">
                    <div class="step-item">
                        <div class="step-number">1</div>
                        <div class="step-text">Complete your seller profile</div>
                    </div>
                    <div class="step-item">
                        <div class="step-number">2</div>
                        <div class="step-text">List your first product</div>
                    </div>
                    <div class="step-item">
                        <div class="step-number">3</div>
                        <div class="step-text">Start making sales</div>
                    </div>
                </div>
            </div>

            <!-- Benefits Section -->
            <div class="benefits-section">
                <h3 class="benefits-title">Why Sell With Relove Market?</h3>
                <div class="benefits-grid">
                    <div class="benefit-item">
                        <span class="benefit-icon">👥</span>
                        <div class="benefit-text">10K+ Active Buyers</div>
                    </div>
                    <div class="benefit-item">
                        <span class="benefit-icon">🛡️</span>
                        <div class="benefit-text">Secure Payments</div>
                    </div>
                    <div class="benefit-item">
                        <span class="benefit-icon">🚚</span>
                        <div class="benefit-text">Shipping Support</div>
                    </div>
                    <div class="benefit-item">
                        <span class="benefit-icon">📈</span>
                        <div class="benefit-text">Growth Tools</div>
                    </div>
                </div>
            </div>

            <!-- CTA Section -->
            <div class="cta-section">
                <a href="{{ route('seller-dashboard') }}" class="cta-button">
                    Launch Your Seller Dashboard
                </a>
                <p style="margin-top: 15px; color: #6b7280; font-size: 14px;">
                    Start listing products and grow your business today!
                </p>
            </div>

            <!-- Final Message -->
            <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px;">
                <p style="color: #4b5563; font-size: 15px;">
                    Need help getting started? Check out our
                    <a href="#" style="color: #10b981; text-decoration: none; font-weight: 500;">Seller Guide</a>
                    or contact our support team.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <div class="footer-logo">🔄 Relove Market</div>
            <div class="footer-tagline">Where Quality Finds New Life</div>

            <div class="footer-links">
                <a href="#" class="footer-link">Seller Center</a>
                <a href="#" class="footer-link">Help & Support</a>
                <a href="#" class="footer-link">Community Guidelines</a>
                <a href="#" class="footer-link">Privacy Policy</a>
            </div>

            <div class="support-info">
                <div class="support-title">💬 Seller Support</div>
                <div class="support-text">
                    Our dedicated seller support team is here to help you succeed.
                    Contact us at <a href="mailto:sellers@relovemarket.com"
                        style="color: #10b981;">sellers@relovemarket.com</a>
                </div>
            </div>

            <div class="copyright">
                &copy; 2024 Relove Market. All rights reserved.<br>
                Building a sustainable marketplace, one sale at a time.
            </div>
        </div>
    </div>
</body>

</html>
