import React from "react";

export function ReturnsRefundsModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Returns &amp; Refunds Policy
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                        aria-label="Close returns and refunds modal"
                    >
                        ×
                    </button>
                </div>

                <div className="px-6 py-4 space-y-3 text-sm text-gray-700">
                    <p>
                        This is placeholder content for the Returns &amp; Refunds
                        policy. You can replace this text later with your actual
                        marketplace policies.
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Items can be returned within 7–14 days (example).</li>
                        <li>Refunds are processed after the item is inspected.</li>
                        <li>
                            Buyers and sellers should communicate clearly about item
                            condition and shipping.
                        </li>
                    </ul>
                    <p>
                        For your final deployment, update this component with the
                        real terms required by your college or business.
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

