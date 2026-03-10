import React, { useState } from "react";
import { Search, MessageSquare, Phone, Mail } from "lucide-react";
import { SellerSidebar } from "@/Components/SellerPage/SellerSidebar";

export default function SellerHelpSupportPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const faqs = [
        {
            question: "How do I add a new product?",
            answer: "Go to the 'Products' page, click on 'Add Product', fill in the details, and click 'Save'.",
        },
        {
            question: "How can I track my orders?",
            answer: "Go to the 'Orders' page to view order status, tracking numbers, and customer details.",
        },
        {
            question: "What should I do if I have payment issues?",
            answer: "Contact our payment support team through email or live chat for assistance.",
        },
    ];

    const filteredFaqs = faqs.filter((faq) =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <SellerSidebar shopName={"Gemilang Berjaya"} />

            {/* Main content */}
            <main className="flex-1 p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Help & Support
                    </h1>
                    <p className="text-gray-500">
                        Find answers to your questions or get in touch with our
                        team.
                    </p>
                </div>

                {/* Search FAQ */}
                <div className="relative max-w-lg mb-8">
                    <input
                        type="text"
                        placeholder="Search help topics..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <Search
                        className="absolute left-3 top-2.5 text-gray-400"
                        size={20}
                    />
                </div>

                {/* FAQ Section */}
                <div className="mb-12">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white rounded-lg shadow p-4"
                                >
                                    <h3 className="font-medium text-gray-900">
                                        {faq.question}
                                    </h3>
                                    <p className="text-gray-600 mt-1">
                                        {faq.answer}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No results found.</p>
                        )}
                    </div>
                </div>

                {/* Contact Support Section */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Contact Info */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Contact Us
                        </h3>
                        <ul className="space-y-3 text-black">
                            <li className="flex items-center gap-3">
                                <Phone className="text-indigo-500" size={20} />
                                <span>+60 123-456-789</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="text-indigo-500" size={20} />
                                <span>support@relovemarket.com</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <MessageSquare
                                    className="text-indigo-500"
                                    size={20}
                                />
                                <span>Live Chat Available</span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Send us a message
                        </h3>
                        <form className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    className="w-full text-black border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    placeholder="Your Email"
                                    className="w-full text-black border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <textarea
                                    placeholder="Your Message"
                                    rows="4"
                                    className="w-full text-black border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
