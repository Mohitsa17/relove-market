import { Footer } from "@/Components/BuyerPage/Footer";
import { SellerRegisterForm } from "@/Components/BuyerPage/SellerRegistration/SellerRegisterForm";
import { SellerProgressBar } from "@/Components/BuyerPage/SellerRegistration/SellerProgressBar";

import { useState } from "react";

import { Link } from "@inertiajs/react";

import {
    FaCheckCircle,
    FaStore,
    FaUser,
    FaBuilding,
    FaCreditCard,
    FaClipboardCheck,
    FaArrowLeft,
    FaShieldAlt,
    FaLock,
} from "react-icons/fa";

// Helper function for step titles
function getStepTitle(step) {
    const titles = {
        1: "Account Information",
        2: "Store Details",
        3: "Review & Submit",
    };
    return titles[step] || "Seller Registration";
}

// Helper function for step descriptions
function getStepDescription(step) {
    const descriptions = {
        1: "Create your seller account with basic information",
        2: "Tell us about your store and what you'll be selling",
        3: "Review all information before final submission",
    };
    return descriptions[step] || "Complete your seller registration";
}

export default function SellerRegistration({ list_business }) {
    const [step, setStep] = useState(1);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header with progress */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <Link
                        href={route("homepage")}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Relove Market
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Become a Seller
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Join our community of sustainable sellers
                            </p>
                        </div>
                        <div className="hidden md:flex items-center space-x-2 bg-green-50 text-green-800 px-4 py-2 rounded-full">
                            <FaShieldAlt className="text-green-600" />
                            <span className="text-sm font-medium">
                                Secure & Verified
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white shadow-sm">
                <SellerProgressBar currentStep={step} />
            </div>

            {/* Main Content */}
            <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left Column: Registration Form */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    {step === 1 && (
                                        <FaUser className="mr-3 text-blue-600" />
                                    )}
                                    {step === 2 && (
                                        <FaStore className="mr-3 text-blue-600" />
                                    )}
                                    {step === 3 && (
                                        <FaBuilding className="mr-3 text-blue-600" />
                                    )}
                                    {step === 4 && (
                                        <FaCreditCard className="mr-3 text-blue-600" />
                                    )}
                                    {step === 5 && (
                                        <FaClipboardCheck className="mr-3 text-blue-600" />
                                    )}
                                    {getStepTitle(step)}
                                </h2>
                                <p className="text-gray-600 text-sm mt-1">
                                    {getStepDescription(step)}
                                </p>
                            </div>
                            <div className="p-6">
                                <SellerRegisterForm
                                    step={step}
                                    setStep={setStep}
                                    list_business={list_business}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Instructions & Benefits */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Benefits Card */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <FaStore className="mr-2" />
                                Seller Benefits
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <FaCheckCircle className="text-green-300 mt-1 mr-3 flex-shrink-0" />
                                    <span>
                                        Reach thousands of eco-conscious buyers
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <FaCheckCircle className="text-green-300 mt-1 mr-3 flex-shrink-0" />
                                    <span>Secure payment processing</span>
                                </li>
                                <li className="flex items-start">
                                    <FaCheckCircle className="text-green-300 mt-1 mr-3 flex-shrink-0" />
                                    <span>Low commission rates</span>
                                </li>
                                <li className="flex items-start">
                                    <FaCheckCircle className="text-green-300 mt-1 mr-3 flex-shrink-0" />
                                    <span>Marketing support</span>
                                </li>
                                <li className="flex items-start">
                                    <FaCheckCircle className="text-green-300 mt-1 mr-3 flex-shrink-0" />
                                    <span>24/7 customer support</span>
                                </li>
                            </ul>
                        </div>

                        {/* Instructions Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Registration Process
                            </h3>
                            <div className="space-y-4">
                                {[
                                    {
                                        step: 1,
                                        title: "Account Information",
                                        desc: "Basic details to create your seller account",
                                    },
                                    {
                                        step: 2,
                                        title: "Store Setup",
                                        desc: "Tell us about your store and products",
                                    },
                                    {
                                        step: 3,
                                        title: "Review & Submit",
                                        desc: "Final confirmation before approval",
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.step}
                                        className={`flex items-start p-3 rounded-lg ${
                                            step === item.step
                                                ? "bg-blue-50 border border-blue-200"
                                                : "bg-gray-50"
                                        }`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                                step === item.step
                                                    ? "bg-blue-600 text-white"
                                                    : step > item.step
                                                    ? "bg-green-500 text-white"
                                                    : "bg-gray-300 text-gray-600"
                                            }`}
                                        >
                                            {step > item.step ? (
                                                <FaCheckCircle className="w-4 h-4" />
                                            ) : (
                                                item.step
                                            )}
                                        </div>
                                        <div>
                                            <p
                                                className={`font-medium ${
                                                    step === item.step
                                                        ? "text-blue-900"
                                                        : "text-gray-900"
                                                }`}
                                            >
                                                {item.title}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Security Note */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-start">
                                <FaLock className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        Your information is secure
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        We use bank-level encryption to protect
                                        your data. All information is verified
                                        before approval.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}
