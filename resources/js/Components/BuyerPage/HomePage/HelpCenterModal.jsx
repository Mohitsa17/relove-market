import React from "react";

export function HelpCenterModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Help Center
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                        aria-label="Close help center modal"
                    >
                        ×
                    </button>
                </div>

                <div className="px-6 py-4 space-y-3 text-sm text-gray-700">
                    <p>
                        This is a placeholder Help Center for Relove Market. You
                        can update this later with real FAQs and support links.
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>How to create an account and log in.</li>
                        <li>How to list a product for sale.</li>
                        <li>How to contact a seller or buyer.</li>
                    </ul>
                    <p>
                        For now, this dummy content simply demonstrates how the
                        modal system works in your frontend.
                    </p>
                </div>

                <div className="px-6 py-3 border-t border-gray-200 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

