import {
    FaStore,
    FaUsers,
    FaChartLine,
    FaShieldAlt,
    FaCreditCard,
    FaTools,
    FaRocket,
    FaLeaf,
    FaMobileAlt,
    FaHeadset,
    FaAward,
    FaMoneyBillWave,
} from "react-icons/fa";

import { Link } from "@inertiajs/react";

import { Footer } from "@/Components/BuyerPage/Footer";
import { Navbar } from "@/Components/BuyerPage/Navbar";

export default function SellerBenefits() {
    const benefits = [
        {
            icon: <FaStore className="text-3xl" />,
            title: "Easy Store Setup",
            description:
                "Get your store up and running in minutes with our intuitive setup process. No technical skills required.",
            stats: "5-minute setup process",
        },
        {
            icon: <FaUsers className="text-3xl" />,
            title: "Large Customer Base",
            description:
                "Access thousands of eco-conscious buyers actively looking for preloved items on our platform.",
            stats: "50,000+ active buyers",
        },
        {
            icon: <FaChartLine className="text-3xl" />,
            title: "Growth Tools",
            description:
                "Use our analytics and marketing tools to understand your customers and grow your sales.",
            stats: "30% average monthly growth",
        },
        {
            icon: <FaShieldAlt className="text-3xl" />,
            title: "Secure Transactions",
            description:
                "Enjoy peace of mind with our secure payment system and buyer protection policies.",
            stats: "100% payment protection",
        },
        {
            icon: <FaCreditCard className="text-3xl" />,
            title: "Low Fees",
            description:
                "Keep more of your earnings with our competitive commission rates and no hidden fees.",
            stats: "Only 5% commission",
        },
        {
            icon: <FaTools className="text-3xl" />,
            title: "Powerful Management Tools",
            description:
                "Manage inventory, orders, and customer messages all from one convenient dashboard.",
            stats: "All-in-one dashboard",
        },
    ];

    const successStories = [
        {
            name: "Sarah Chen",
            business: "Vintage Threads",
            story: "I started selling vintage clothing part-time and now it's my full-time business. Relove Market helped me reach customers who truly appreciate sustainable fashion.",
            growth: "320% revenue growth in 6 months",
            image: "/image/user1.jpg",
        },
        {
            name: "Michael Tan",
            business: "Tech Renew",
            story: "As a tech enthusiast, I found a way to give old gadgets new life. The platform's tools made it easy to manage my inventory and connect with buyers.",
            growth: "200+ items sold in first year",
            image: "/image/user2.jpg",
        },
        {
            name: "Priya Kaur",
            business: "Home Preloved",
            story: "My passion for sustainable living turned into a thriving business. The educational resources and community support have been invaluable.",
            growth: "450+ happy customers",
            image: "/image/user3.jpg",
        },
    ];

    const steps = [
        {
            step: "1",
            title: "Sign Up",
            description:
                "Create your seller account in minutes with basic information",
        },
        {
            step: "2",
            title: "Set Up Your Store",
            description: "Customize your storefront and add your products",
        },
        {
            step: "3",
            title: "Start Selling",
            description: "List your items and connect with buyers",
        },
        {
            step: "4",
            title: "Grow Your Business",
            description: "Use our tools to analyze performance and expand",
        },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-green-50 to-blue-50 py-16 md:py-24 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 mt-6 md:mt-0">
                        Grow Your Business with{" "}
                        <span className="text-green-600">Relove Market</span>
                    </h1>
                    <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-10">
                        Join our community of successful sellers and turn your
                        preloved items into profits while promoting sustainable
                        shopping.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={route("seller-registration")}>
                            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-semibold transition-colors shadow-lg hover:shadow-xl">
                                Start Selling Now
                            </button>
                        </Link>
                        <a href="#intro">
                            <button className="border-2 border-green-600 text-green-700 px-8 py-4 rounded-full font-semibold hover:bg-green-600 hover:text-white transition-colors">
                                Learn How It Works
                            </button>
                        </a>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section id="intro" className="py-12 bg-white">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                                10,000+
                            </div>
                            <div className="text-gray-600">Active Sellers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                                85%
                            </div>
                            <div className="text-gray-600">
                                Seller Satisfaction
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                                RM 5M+
                            </div>
                            <div className="text-gray-600">
                                In Seller Earnings
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                                24-48h
                            </div>
                            <div className="text-gray-600">
                                Average Payout Time
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Why Sell With Us?
                        </h2>
                        <p className="text-gray-600">
                            We provide everything you need to start, run, and
                            grow your sustainable business
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                            >
                                <div className="text-green-600 mb-4">
                                    {benefit.icon}
                                </div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {benefit.description}
                                </p>
                                <div className="text-sm text-green-700 font-medium">
                                    {benefit.stats}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Getting Started is Easy
                        </h2>
                        <p className="text-gray-600">
                            Follow these simple steps to launch your sustainable
                            store
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connection line */}
                        <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-gray-200"></div>

                        <div className="grid md:grid-cols-4 gap-8">
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    className="relative text-center"
                                >
                                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <span className="text-3xl font-bold text-green-700">
                                            {step.step}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <Link href={route("seller-registration")}>
                            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold transition-colors">
                                Begin Your Seller Journey
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Success Stories */}
            <section className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Success Stories
                        </h2>
                        <p className="text-gray-600">
                            Hear from sellers who have built successful
                            businesses on our platform
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {successStories.map((story, index) => (
                            <div
                                key={index}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden mr-4">
                                        <img
                                            src={story.image}
                                            alt={story.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {story.name}
                                        </h3>
                                        <p className="text-green-600 text-sm">
                                            {story.business}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-4 italic">
                                    "{story.story}"
                                </p>
                                <div className="text-sm text-green-700 font-medium">
                                    {story.growth}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Deep Dive */}
            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Powerful Seller Features
                        </h2>
                        <p className="text-gray-600">
                            Everything you need to manage and grow your
                            sustainable business
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="flex">
                            <div className="mr-6">
                                <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                    <FaMobileAlt className="text-xl" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                    Mobile Management
                                </h3>
                                <p className="text-gray-600">
                                    Manage your store on the go with our mobile
                                    app. List items, respond to messages, and
                                    track sales from anywhere.
                                </p>
                            </div>
                        </div>

                        <div className="flex">
                            <div className="mr-6">
                                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                    <FaHeadset className="text-xl" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                    Dedicated Support
                                </h3>
                                <p className="text-gray-600">
                                    Get help when you need it with our seller
                                    support team. We're here to help you succeed
                                    with personalized guidance.
                                </p>
                            </div>
                        </div>

                        <div className="flex">
                            <div className="mr-6">
                                <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                                    <FaRocket className="text-xl" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                    Marketing Tools
                                </h3>
                                <p className="text-gray-600">
                                    Promote your items with our marketing tools.
                                    Run promotions, featured listings, and
                                    social media integrations.
                                </p>
                            </div>
                        </div>

                        <div className="flex">
                            <div className="mr-6">
                                <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                                    <FaAward className="text-xl" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                    Seller Badges
                                </h3>
                                <p className="text-gray-600">
                                    Earn trust badges as you grow your business.
                                    Top-rated sellers get featured placement and
                                    buyer confidence.
                                </p>
                            </div>
                        </div>

                        <div className="flex">
                            <div className="mr-6">
                                <div className="w-14 h-14 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600">
                                    <FaLeaf className="text-xl" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                    Sustainability Impact
                                </h3>
                                <p className="text-gray-600">
                                    Track your environmental impact. See how
                                    many items you've saved from landfills and
                                    your carbon footprint reduction.
                                </p>
                            </div>
                        </div>

                        <div className="flex">
                            <div className="mr-6">
                                <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                                    <FaMoneyBillWave className="text-xl" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                    Flexible Payouts
                                </h3>
                                <p className="text-gray-600">
                                    Get paid your way with multiple payout
                                    options. Choose from bank transfer,
                                    e-wallet, or other payment methods.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Start Your Selling Journey?
                    </h2>
                    <p className="text-xl mb-10 opacity-90">
                        Join thousands of sellers who are building sustainable
                        businesses and making a positive environmental impact.
                    </p>
                    <div className="flex flex-row sm:flex-row gap-4 justify-center">
                        <Link href={route("seller-registration")}>
                            <button className="bg-white text-green-700 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg">
                                Create Seller Account
                            </button>
                        </Link>
                    </div>
                    <p className="mt-8 text-sm opacity-80">
                        No setup fees • No monthly charges • Pay only when you
                        sell
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
}
