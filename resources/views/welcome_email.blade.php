<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Welcome to Relove Market</title>
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
            background-color: #f8fafc;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        /* Header */
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
        }

        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .logo-subtitle {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
        }

        /* Main content */
        .email-content {
            padding: 40px 30px;
        }

        .welcome-title {
            font-size: 28px;
            color: #2d3748;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 600;
        }

        .greeting {
            font-size: 18px;
            color: #4a5568;
            margin-bottom: 25px;
            text-align: center;
        }

        .highlight {
            color: #667eea;
            font-weight: 600;
        }

        /* Features grid */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }

        .feature-card {
            text-align: center;
            padding: 20px;
            background: #f7fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }

        .feature-icon {
            font-size: 24px;
            margin-bottom: 10px;
        }

        .feature-title {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 8px;
        }

        .feature-description {
            font-size: 14px;
            color: #718096;
        }

        /* CTA Section */
        .cta-section {
            text-align: center;
            margin: 40px 0;
            padding: 30px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 12px;
            color: white;
        }

        .cta-title {
            font-size: 24px;
            margin-bottom: 15px;
            font-weight: 600;
        }

        .cta-description {
            margin-bottom: 25px;
            opacity: 0.9;
        }

        .cta-button {
            display: inline-block;
            background: white;
            color: #f5576c;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        /* Stats section */
        .stats-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin: 30px 0;
        }

        .stat-item {
            text-align: center;
            padding: 15px;
        }

        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 12px;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Footer */
        .email-footer {
            background: #2d3748;
            color: #cbd5e0;
            padding: 30px;
            text-align: center;
        }

        .social-links {
            margin-bottom: 20px;
        }

        .social-link {
            display: inline-block;
            margin: 0 10px;
            color: #cbd5e0;
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .social-link:hover {
            color: white;
        }

        .footer-links {
            margin-bottom: 20px;
        }

        .footer-link {
            color: #cbd5e0;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }

        .footer-link:hover {
            color: white;
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

            .welcome-title {
                font-size: 24px;
            }

            .features-grid {
                grid-template-columns: 1fr;
            }

            .cta-section {
                padding: 20px;
            }

            .stat-number {
                font-size: 20px;
            }
        }
    </style>
</head>

<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <div class="logo">🔄 Relove Market</div>
            <div class="logo-subtitle">Where Quality Finds New Life</div>
        </div>

        <!-- Main Content -->
        <div class="email-content">
            <h1 class="welcome-title">Welcome to Relove Market!</h1>

            <p class="greeting">
                Hi <span class="highlight">{{ $data['name'] }}</span>,<br>
                We're thrilled to have you join our community of conscious shoppers and sellers.
            </p>

            <!-- Features Grid -->
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">🛍️</div>
                    <h3 class="feature-title">Shop Sustainable</h3>
                    <p class="feature-description">Discover quality pre-loved items at amazing prices while reducing
                        waste.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">💰</div>
                    <h3 class="feature-title">Earn Money</h3>
                    <p class="feature-description">Turn your unused items into cash by selling to our community.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">🌱</div>
                    <h3 class="feature-title">Eco-Friendly</h3>
                    <p class="feature-description">Join our mission to promote sustainable shopping and reduce
                        environmental impact.</p>
                </div>
            </div>

            <!-- Stats Section -->
            <div class="stats-section">
                <div class="stat-item">
                    <div class="stat-number">10K+</div>
                    <div class="stat-label">Active Users</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">50K+</div>
                    <div class="stat-label">Items Listed</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">95%</div>
                    <div class="stat-label">Satisfaction Rate</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">24/7</div>
                    <div class="stat-label">Support</div>
                </div>
            </div>

            <!-- CTA Section -->
            <div class="cta-section">
                <h2 class="cta-title">Ready to Get Started?</h2>
                <p class="cta-description">
                    Explore thousands of quality pre-loved items or start selling your own today!
                </p>
                <a href="{{ $data['dashboard_url'] ?? '#' }}" class="cta-button">
                    Explore Marketplace
                </a>
            </div>

            <!-- Getting Started Tips -->
            <div
                style="margin: 30px 0; padding: 20px; background: #f0fff4; border-radius: 8px; border-left: 4px solid #48bb78;">
                <h3 style="color: #2d3748; margin-bottom: 15px;">💡 Quick Start Guide</h3>
                <ul style="color: #4a5568; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Complete your profile to build trust with the community</li>
                    <li style="margin-bottom: 8px;">Browse categories to discover items you'll love</li>
                    <li style="margin-bottom: 8px;">Use our secure messaging system to communicate with sellers</li>
                    <li>Read our buyer and seller guidelines for the best experience</li>
                </ul>
            </div>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <div class="social-links">
                <a href="#" class="social-link">Facebook</a>
                <a href="#" class="social-link">Instagram</a>
                <a href="#" class="social-link">Twitter</a>
                <a href="#" class="social-link">LinkedIn</a>
            </div>

            <div class="footer-links">
                <a href="#" class="footer-link">Help Center</a>
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
                <a href="#" class="footer-link">Contact Us</a>
            </div>

            <div class="copyright">
                &copy; 2024 Relove Market. All rights reserved.<br>
                123 Green Street, Eco City, EC 12345
            </div>
        </div>
    </div>
</body>

</html>
