import { Calendar } from "lucide-react";

export function TrialWelcomeModal({ showTrialModal, setShowTrialModal }) {
    if (!showTrialModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="text-green-600 w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Welcome to Your 7-Day Free Trial!
                        </h3>
                        <p className="text-gray-600 mb-4">
                            You have <strong>7 days</strong> of unlimited access
                            to all chat features. After the trial, you'll need
                            to subscribe to continue using the service.
                        </p>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">
                                What's included:
                            </h4>
                            <ul className="text-sm text-blue-800 space-y-1 text-left">
                                <li>• Unlimited conversations during trial</li>
                                <li>• All messaging features</li>
                                <li>• Priority customer support</li>
                            </ul>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowTrialModal(false)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Start My Trial
                    </button>
                </div>
            </div>
        </div>
    );
}
