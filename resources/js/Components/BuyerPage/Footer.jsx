import React, { useState } from "react";
import {
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaLinkedinIn,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaDownload,
    FaQuestionCircle,
    FaShieldAlt,
    FaFileContract,
    FaShippingFast,
    FaUndo,
    FaShoppingBag,
    FaPlusCircle,
    FaInfoCircle,
    FaChartLine,
    FaBox,
} from "react-icons/fa";
import { FiSend } from "react-icons/fi";

import { Link } from "@inertiajs/react";

import { TermsConditions } from "./HomePage/TermsConditions";
import { HelpCenterModal } from "./HomePage/HelpCenterModal";
import { SafetyGuidelinesModal } from "./HomePage/SafetyGuidelinesModal";
import { ShippingInformationModal } from "./HomePage/ShippingInformationModal";
import { ReturnsRefundsModal } from "./HomePage/ReturnsRefundModal";

export function Footer() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [isTermsConditionOpen, setIsTermsConditionOpen] = useState(false);
    const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
    const [isSafetyGuidelinesOpen, setIsSafetyGuidelinesOpen] = useState(false);
    const [isShippingInfoOpen, setIsShippingInfoOpen] = useState(false);
    const [isReturnsRefundsOpen, setIsReturnsRefundsOpen] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            // Here you would typically send the email to your backend
            console.log("Subscribed with email:", email);
            setSubscribed(true);
            setEmail("");
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    return (
        <footer className="bg-gray-900 text-white">
            {/* Modal for displaying terms and condition */}
            <TermsConditions
                isOpen={isTermsConditionOpen}
                onClose={() => setIsTermsConditionOpen(false)}
                onAccept={() => console.log("Terms accepted")}
            />

            <HelpCenterModal
                isOpen={isHelpCenterOpen}
                onClose={() => setIsHelpCenterOpen(false)}
            />

            <SafetyGuidelinesModal
                isOpen={isSafetyGuidelinesOpen}
                onClose={() => setIsSafetyGuidelinesOpen(false)}
            />

            <ShippingInformationModal
                isOpen={isShippingInfoOpen}
                onClose={() => setIsShippingInfoOpen(false)}
            />

            <ReturnsRefundsModal
                isOpen={isReturnsRefundsOpen}
                onClose={() => setIsReturnsRefundsOpen(false)}
            />

            {/* Main Footer Content */}
            <div className="container mx-auto px-8 py-12 md:py-16 md:px-28">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand & Description */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold mb-4 flex items-center">
                            <span className="text-green-500 mr-2">♻️</span>
                            Relove Market
                        </h2>
                        <p className="text-gray-400 mb-6 max-w-md">
                            A sustainable marketplace where quality preloved
                            items find new homes. Our SaaS platform connects
                            sellers and buyers in an eco-friendly community.
                        </p>

                        {/* Social Media */}
                        <div className="flex space-x-4 mb-6">
                            <a
                                href="#"
                                className="bg-gray-800 hover:bg-green-600 p-3 rounded-full transition-colors duration-300 transform hover:scale-110"
                                aria-label="Facebook"
                            >
                                <FaFacebookF size={16} />
                            </a>
                            <a
                                href="#"
                                className="bg-gray-800 hover:bg-green-600 p-3 rounded-full transition-colors duration-300 transform hover:scale-110"
                                aria-label="Twitter"
                            >
                                <FaTwitter size={16} />
                            </a>
                            <a
                                href="#"
                                className="bg-gray-800 hover:bg-green-600 p-3 rounded-full transition-colors duration-300 transform hover:scale-110"
                                aria-label="Instagram"
                            >
                                <FaInstagram size={16} />
                            </a>
                            <a
                                href="#"
                                className="bg-gray-800 hover:bg-green-600 p-3 rounded-full transition-colors duration-300 transform hover:scale-110"
                                aria-label="LinkedIn"
                            >
                                <FaLinkedinIn size={16} />
                            </a>
                        </div>

                        {/* App Download Badges */}
                        <div>
                            <p className="font-medium mb-3">Download Our App</p>
                            <div className="flex flex-wrap gap-3">
                                <button className="bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-lg flex items-center transition-colors border border-gray-700 hover:border-green-500">
                                    <FaDownload className="mr-2" />
                                    <div className="text-left">
                                        <div className="text-xs text-gray-400">
                                            Download on
                                        </div>
                                        <div className="text-sm font-medium">
                                            App Store
                                        </div>
                                    </div>
                                </button>
                                <button className="bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-lg flex items-center transition-colors border border-gray-700 hover:border-green-500">
                                    <FaDownload className="mr-2" />
                                    <div className="text-left">
                                        <div className="text-xs text-gray-400">
                                            Get it on
                                        </div>
                                        <div className="text-sm font-medium">
                                            Google Play
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-5 pb-2 border-b border-gray-700">
                            Marketplace
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href={route("shopping")}
                                    className="text-gray-400 hover:text-green-400 transition-colors flex items-center group"
                                >
                                    <FaShoppingBag
                                        size={16}
                                        className="text-green-500"
                                    />
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    Shopping
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={route("seller-manage-product")}
                                    className="text-gray-400 hover:text-green-400 transition-colors flex items-center group"
                                >
                                    <FaPlusCircle
                                        size={16}
                                        className="text-green-500"
                                    />
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    Sell an Item
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={route("about-us")}
                                    className="text-gray-400 hover:text-green-400 transition-colors flex items-center group"
                                >
                                    <FaInfoCircle
                                        size={16}
                                        className="text-green-500"
                                    />
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={route("seller-benefit")}
                                    className="text-gray-400 hover:text-green-400 transition-colors flex items-center group"
                                >
                                    <FaChartLine
                                        size={16}
                                        className="text-green-500"
                                    />
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    Seller Benefit
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={route("profile")}
                                    className="text-gray-400 hover:text-green-400 transition-colors flex items-center group"
                                >
                                    <FaBox
                                        size={16}
                                        className="text-green-500"
                                    />
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    Order Management
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support & Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-5 pb-2 border-b border-gray-700">
                            Support & Info
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <button
                                    onClick={() => setIsHelpCenterOpen(true)}
                                    className="text-gray-400 hover:text-green-400 transition-colors flex items-center group w-full text-left"
                                >
                                    <FaQuestionCircle className="mr-3 text-green-500" />
                                    Help Center
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() =>
                                        setIsSafetyGuidelinesOpen(true)
                                    }
                                    className="text-gray-400 hover:text-green-400 transition-colors flex items-center group w-full text-left"
                                >
                                    <FaShieldAlt className="mr-3 text-green-500" />
                                    Safety Guidelines
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setIsShippingInfoOpen(true)}
                                    className="text-gray-400 hover:text-green-400 transition-colors flex items-center group w-full text-left"
                                >
                                    <FaShippingFast className="mr-3 text-green-500" />
                                    Shipping Information
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() =>
                                        setIsReturnsRefundsOpen(true)
                                    }
                                    className="text-gray-400 hover:text-green-400 transition-colors flex items-center group w-full text-left"
                                >
                                    <FaUndo className="mr-3 text-green-500" />
                                    Returns & Refunds
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() =>
                                        setIsTermsConditionOpen(true)
                                    }
                                    className="text-gray-400 hover:text-green-400 transition-colors flex items-center group w-full text-left"
                                >
                                    <FaFileContract className="mr-3 text-green-500" />
                                    Terms of Service
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Contact & Newsletter */}
                    <div>
                        <h3 className="text-lg font-semibold mb-5 pb-2 border-b border-gray-700">
                            Stay Updated
                        </h3>

                        {/* Newsletter Subscription */}
                        <div className="mb-6">
                            <p className="text-gray-400 mb-3 text-sm">
                                Get exclusive deals and sustainability tips
                            </p>
                            <form
                                onSubmit={handleSubscribe}
                                className="flex flex-col space-y-3"
                            >
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email address"
                                    className="bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-700"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    <FiSend />
                                    Subscribe
                                </button>
                            </form>
                            {subscribed && (
                                <p className="text-green-400 text-sm mt-2 text-center">
                                    🎉 Welcome to our eco-community!
                                </p>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <FaMapMarkerAlt className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                                <span className="text-gray-400 text-sm">
                                    Jalan Suka Menanti, Alor Setar, Kedah,
                                    Malaysia
                                </span>
                            </div>
                            <div className="flex items-center">
                                <FaEnvelope className="text-green-500 mr-3 flex-shrink-0" />
                                <a
                                    href="mailto:relovemarket006@gmail.com"
                                    className="text-gray-400 hover:text-green-400 text-sm"
                                >
                                    relovemarket006@gmail.com
                                </a>
                            </div>
                            <div className="flex items-center">
                                <FaPhone className="text-green-500 mr-3 flex-shrink-0" />
                                <a
                                    href="tel:+60126547653"
                                    className="text-gray-400 hover:text-green-400 text-sm"
                                >
                                    +60 12 654 7653
                                </a>
                            </div>
                        </div>

                        {/* Business Hours - New Addition */}
                        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                            <p className="text-green-400 text-sm font-medium mb-1">
                                Support Hours
                            </p>
                            <p className="text-gray-400 text-xs">
                                Mon-Fri: 9AM-6PM
                            </p>
                            <p className="text-gray-400 text-xs">
                                Sat-Sun: 10AM-4PM
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-800">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-center items-center">
                        <p className="text-gray-500 text-sm text-center mb-3 md:mb-0">
                            © {new Date().getFullYear()} Relove Market. All
                            rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
