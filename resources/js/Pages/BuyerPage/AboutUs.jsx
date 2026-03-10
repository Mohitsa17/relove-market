import { useState } from "react";
import {
    FaRecycle,
    FaLeaf,
    FaShieldAlt,
    FaUsers,
    FaChevronDown,
    FaChevronUp,
    FaQuoteLeft,
    FaArrowRight,
} from "react-icons/fa";

import { Link, usePage } from "@inertiajs/react";

import { Footer } from "@/Components/BuyerPage/Footer";
import { Navbar } from "@/Components/BuyerPage/Navbar";

export default function AboutUs() {
    const [activeFAQ, setActiveFAQ] = useState(null);

    const { auth } = usePage().props;

    const toggleFAQ = (index) => {
        setActiveFAQ(activeFAQ === index ? null : index);
    };

    const faqItems = [
        {
            question: "How do I create an account?",
            answer: "Click the 'Sign Up' button in the top right corner and follow the simple registration process. You can sign up with your email or social media accounts for convenience.",
        },
        {
            question: "I forgot my password. What should I do?",
            answer: "Click on 'Forgot Password' on the login page and follow the instructions sent to your email. You'll be able to reset your password securely and quickly.",
        },
        {
            question: "How do I list an item for sale?",
            answer: "Once logged in, click 'Sell Item' in the navigation. Upload photos, add a description, set your price, and categorize your item. Our AI will help suggest the best category and price range!",
        },
        {
            question: "What items can I sell on Relove?",
            answer: "You can sell any preloved items in good condition, including clothing, electronics, home goods, books, and more. We prohibit certain items for safety reasons - see our guidelines for details.",
        },
        {
            question: "How does Relove ensure transaction safety?",
            answer: "We use secure payment processing, buyer protection programs, and verify all users. Our rating system helps build trust within our community, and our support team is always available to help resolve issues.",
        },
    ];

    const teamMembers = [
        {
            name: "Michael Torres",
            role: "Product Manager",
            image: "/image/collaborator1.jpg",
            bio: "Passionate about sustainable fashion and reducing waste.",
        },
        {
            name: "Sarah Chen",
            role: "Head of Technology",
            image: "/image/collaborator2.jpg",
            bio: "Believes technology can drive positive environmental change.",
        },
        {
            name: "Priya Patel",
            role: "Community Manager",
            image: "/image/collaborator3.jpg",
            bio: "Loves connecting people through shared sustainable values.",
        },
        {
            name: "David Kim",
            role: "Product Designer",
            image: "/image/collaborator4.jpg",
            bio: "Creates experiences that make sustainable choices easy and enjoyable.",
        },
    ];

    const stats = [
        { value: "50,000+", label: "Active Users" },
        { value: "200,000+", label: "Items Listed" },
        { value: "85%", label: "Satisfaction Rate" },
        { value: "120+", label: "Tons of Waste Reduced" },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative py-20 bg-gradient-to-br from-green-50 to-blue-50">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmNWY3ZjkiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center md:mt-5">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                            About{" "}
                            <span className="text-green-600">
                                Relove Market
                            </span>
                        </h1>
                        <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Our mission is to give preloved items a new home and
                            reduce waste while building a community of mindful
                            consumers who believe in sustainable shopping.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 mt-10">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="min-w-full bg-white rounded-xl p-6 shadow-sm text-center md:min-w-[180px]"
                                >
                                    <div className="text-3xl font-bold text-green-600 mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-gray-600 text-sm">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-16 lg:py-24 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="lg:w-1/2">
                            <div className="relative">
                                <img
                                    src="../image/story_of_us.jpg"
                                    alt="Relove Market team"
                                    className="rounded-2xl shadow-xl w-full"
                                />
                                <div className="absolute -bottom-6 -right-6 bg-green-600 text-white p-6 rounded-2xl shadow-lg hidden md:block">
                                    <div className="text-3xl font-bold">
                                        2025
                                    </div>
                                    <div className="text-sm">
                                        Founded with passion
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                The Journey of Relove Market
                            </h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Relove Market was born from a simple idea: that
                                one person's unused items could become another's
                                treasure. We started in 2025 with a small
                                community of enthusiasts passionate about
                                sustainability and reducing waste.
                            </p>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                What began as a local exchange program quickly
                                grew into a comprehensive platform where people
                                can buy, sell, and trade preloved items with
                                confidence and ease. Today, we're proud to have
                                helped thousands of items find new homes,
                                reducing landfill waste and creating a more
                                sustainable future for all.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    <img
                                        src="/image/ceo.jpg"
                                        alt="Founder signature"
                                        className="w-12 h-5 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        Danny Cheng
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Founder & CEO
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 bg-gray-50 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Our Values
                        </h2>
                        <p className="text-gray-600 text-lg">
                            These core principles guide everything we do at
                            Relove Market and shape our community.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: <FaUsers className="text-3xl" />,
                                title: "Community",
                                description:
                                    "Building connections through shared values and sustainable practices.",
                                color: "text-pink-500",
                            },
                            {
                                icon: <FaRecycle className="text-3xl" />,
                                title: "Sustainability",
                                description:
                                    "Extending product lifecycles and reducing environmental impact.",
                                color: "text-blue-500",
                            },
                            {
                                icon: <FaLeaf className="text-3xl" />,
                                title: "Mindful Consumption",
                                description:
                                    "Encouraging thoughtful purchasing decisions and less waste.",
                                color: "text-green-500",
                            },
                            {
                                icon: <FaShieldAlt className="text-3xl" />,
                                title: "Trust & Safety",
                                description:
                                    "Creating a secure platform for users to exchange with confidence.",
                                color: "text-indigo-500",
                            },
                        ].map((value, index) => (
                            <div
                                key={index}
                                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center"
                            >
                                <div
                                    className={`flex justify-center items-center w-16 h-16 rounded-2xl ${value.color} bg-opacity-10 mx-auto mb-6`}
                                >
                                    {value.icon}
                                </div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-3">
                                    {value.title}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Meet Our Team
                        </h2>
                        <p className="text-gray-600 text-lg">
                            The passionate individuals working to make
                            sustainable shopping accessible to everyone.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="text-center group">
                                <div className="relative mb-6 overflow-hidden rounded-2xl">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full max-h-72 md:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                                        <p className="text-white text-sm px-4">
                                            {member.bio}
                                        </p>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-gray-900 text-lg">
                                    {member.name}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {member.role}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonial Section */}
            <section className="py-16 bg-green-50 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            What Our Community Says
                        </h2>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="md:w-1/3 text-center">
                                <img
                                    src="/image/shania_yan.png"
                                    alt="Happy user"
                                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                                />
                                <div className="text-2xl font-bold text-green-600 mb-1">
                                    4.8/5
                                </div>
                                <div className="flex justify-center items-center mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg
                                            key={star}
                                            className="w-5 h-5 text-yellow-400 fill-current"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-gray-600 text-sm">
                                    Based on 2,458 reviews
                                </p>
                            </div>
                            <div className="md:w-2/3">
                                <FaQuoteLeft className="text-green-200 text-3xl mb-4" />
                                <p className="text-gray-700 text-lg italic mb-6">
                                    "Relove Market has completely changed how I
                                    shop. I've found amazing unique pieces while
                                    knowing I'm reducing waste. The community is
                                    wonderful and the process is so easy!"
                                </p>
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        Jessica Lim
                                    </div>
                                    <div className="text-gray-500 text-sm">
                                        Active member since 2025
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 px-4 bg-gray-50">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-gray-600">
                            Find answers to common questions about using Relove
                            Market.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqItems.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-sm overflow-hidden"
                            >
                                <button
                                    className="flex justify-between items-center w-full p-6 text-left font-semibold text-gray-900"
                                    onClick={() => toggleFAQ(index)}
                                >
                                    <span>{faq.question}</span>
                                    {activeFAQ === index ? (
                                        <FaChevronUp className="text-gray-500" />
                                    ) : (
                                        <FaChevronDown className="text-gray-500" />
                                    )}
                                </button>
                                {activeFAQ === index && (
                                    <div className="px-6 pb-6 pt-2 text-gray-600">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Still have questions?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Our support team is here to help you
                        </p>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-medium transition-colors inline-flex items-center">
                            Contact Us <FaArrowRight className="ml-2" />
                        </button>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Join Our Sustainable Community
                    </h2>
                    <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
                        Be part of the movement changing how we shop and
                        reducing waste one preloved item at a time.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {auth.user ? (
                            auth.user.role_name === "Seller" ? (
                                <Link href={route("seller-dashboard")}>
                                    <button className="w-full bg-white text-green-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-md">
                                        Go to Seller Dashboard
                                    </button>
                                </Link>
                            ) : auth.user.role_name === "Buyer" ? (
                                <Link href={route("homepage")}>
                                    <button className="w-full bg-white text-green-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-md">
                                        Go to Homepage
                                    </button>
                                </Link>
                            ) : null
                        ) : (
                            <Link href={route("register")}>
                                <button className="w-full bg-white text-green-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-md">
                                    Create Account
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
