import React from "react";

export function TermsConditions({ isOpen, onClose, onAccept }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Terms &amp; Conditions
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                        aria-label="Close terms and conditions modal"
                    >
                        ×
                    </button>
                </div>

                <div className="px-6 py-4 space-y-3 text-sm text-gray-700 max-h-[60vh] overflow-y-auto">
                    <p>
                        This is placeholder content for the Relove Market Terms
                        &amp; Conditions. Replace this text with your real legal
                        copy before going live.
                    </p>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>Use of this platform is for educational/demo purposes.</li>
                        <li>Buyers and sellers are responsible for their own items.</li>
                        <li>No real money transactions should be made in this demo.</li>
                    </ol>
                    <p>
                        For your college submission, you can summarize your rules,
                        privacy expectations, and dispute-handling process here.
                    </p>
                </div>

                <div className="px-6 py-3 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={onAccept}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                    >
                        I Agree
                    </button>
                </div>
            </div>
        </div>
    );
}

