import React from "react";

export function SafetyGuidelinesModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Safety Guidelines
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                        aria-label="Close safety guidelines modal"
                    >
                        ×
                    </button>
                </div>

                <div className="px-6 py-4 space-y-3 text-sm text-gray-700">
                    <p>
                        This is placeholder content for marketplace safety
                        guidelines. Replace it later with your own safety rules.
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Meet in public places when exchanging items.</li>
                        <li>Verify item condition before completing a deal.</li>
                        <li>Never share sensitive personal or banking details.</li>
                    </ul>
                    <p>
                        These guidelines help you explain safe buying and selling
                        practices to your users in the final version.
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

