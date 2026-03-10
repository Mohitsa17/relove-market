import { Star, CheckCircle, Zap, Loader } from "lucide-react";

import { useState } from "react";

export function TrialModal({ isOpen, onStartTrial, onSubscribe }) {
    const [isStartingTrial, setIsStartingTrial] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);

    // Handle trial start with loading state
    const handleStartTrial = async () => {
        setIsStartingTrial(true);
        try {
            await onStartTrial();
        } finally {
            setIsStartingTrial(false);
        }
    };

    // Handle subscription with loading state
    const handleSubscribe = async (url) => {
        setIsSubscribing(true);
        try {
            await onSubscribe(url);
        } finally {
            setIsSubscribing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="relative p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                            <Zap size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Start Your Free Trial!
                            </h2>
                            <p className="text-gray-600">
                                Welcome to Relove Market! Start selling with our
                                7-day free trial.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Free Trial Card */}
                        <div className="border-2 border-green-500 rounded-xl p-5 bg-green-50">
                            <div className="text-center mb-4">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Star
                                        className="text-green-600"
                                        size={20}
                                    />
                                    <h3 className="font-bold text-gray-900 text-lg">
                                        Free Trial
                                    </h3>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">
                                    Free
                                </div>
                                <div className="text-green-600 font-medium">
                                    7 days
                                </div>
                            </div>
                            <ul className="space-y-2 mb-4">
                                <li className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle
                                        size={14}
                                        className="text-green-500"
                                    />
                                    Full platform access
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle
                                        size={14}
                                        className="text-green-500"
                                    />
                                    No credit card required
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle
                                        size={14}
                                        className="text-green-500"
                                    />
                                    Cancel anytime
                                </li>
                            </ul>
                            <button
                                onClick={handleStartTrial}
                                disabled={isStartingTrial || isSubscribing}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isStartingTrial ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Starting Trial...
                                    </>
                                ) : (
                                    "Start Free Trial"
                                )}
                            </button>
                            {isStartingTrial && (
                                <p className="text-xs text-green-600 text-center mt-2">
                                    Setting up your trial account...
                                </p>
                            )}
                        </div>

                        {/* Premium Card */}
                        <div className="border border-gray-300 rounded-xl p-5 bg-white">
                            <div className="text-center mb-4">
                                <h3 className="font-bold text-gray-900 text-lg">
                                    Premium
                                </h3>
                                <div className="text-3xl font-bold text-gray-900 mb-1">
                                    RM 99
                                    <span className="text-sm text-gray-500">
                                        /month
                                    </span>
                                </div>
                                <div className="text-gray-600">After trial</div>
                            </div>
                            <ul className="space-y-2 mb-4">
                                <li className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle
                                        size={14}
                                        className="text-blue-500"
                                    />
                                    Unlimited products
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle
                                        size={14}
                                        className="text-blue-500"
                                    />
                                    Advanced analytics
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle
                                        size={14}
                                        className="text-blue-500"
                                    />
                                    Priority support
                                </li>
                            </ul>
                            <button
                                onClick={() =>
                                    handleSubscribe(
                                        "/seller-manage-subscription"
                                    )
                                }
                                disabled={isSubscribing || isStartingTrial}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubscribing ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Redirecting...
                                    </>
                                ) : (
                                    "Upgrade Now"
                                )}
                            </button>
                            {isSubscribing && (
                                <p className="text-xs text-blue-600 text-center mt-2">
                                    Taking you to subscription page...
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            No risk. Start your free trial today and upgrade
                            anytime during the 7-day period.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
