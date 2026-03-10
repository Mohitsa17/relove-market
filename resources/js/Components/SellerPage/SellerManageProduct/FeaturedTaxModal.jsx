// Components/SellerPage/SellerManageProduct/FeaturedTaxModal.jsx
import React from "react";
import { AlertTriangle, DollarSign, Info } from "lucide-react";

export const FeaturedTaxModal = ({
    isOpen,
    onClose,
    onConfirm,
    product,
    currentFeaturedStatus,
}) => {
    if (!isOpen) return null;

    const calculateTax = (price) => {
        const taxRate = 0.1; // 10%
        return (parseFloat(price) * taxRate).toFixed(2);
    };

    const taxAmount = calculateTax(product.product_price);
    const isEnabling = !currentFeaturedStatus;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center gap-3 p-6 border-b border-gray-200">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            Featured Product Tax
                        </h3>
                        <p className="text-sm text-gray-600">
                            {isEnabling ? "Enable" : "Disable"} featured status
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Product Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-800 text-sm mb-2">
                            Product Details
                        </h4>
                        <div className="space-y-1 text-sm">
                            <p className="text-gray-600">
                                <span className="font-medium">Name:</span>{" "}
                                {product.product_name}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-medium">Price:</span> RM{" "}
                                {product.product_price}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-medium">
                                    Current Status:
                                </span>
                                <span
                                    className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                                        currentFeaturedStatus
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                    {currentFeaturedStatus
                                        ? "Featured"
                                        : "Not Featured"}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Information Box */}
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-gray-600">
                                {isEnabling ? (
                                    <p>
                                        Featured products get priority placement
                                        in search results and recommendations.
                                        The 10% tax will be charged for
                                        featuring the product.
                                    </p>
                                ) : (
                                    <p>
                                        Removing this product from featured
                                        status will stop it from appearing in
                                        featured sections. No refund will be
                                        provided for the remaining period.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Warning Message */}
                    {isEnabling && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-xs text-yellow-800 text-center font-medium">
                                💳 Tax amount will be charged when your
                                product is sell.
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-2 m-2 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors font-medium ${
                            isEnabling
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-gray-600 hover:bg-gray-700"
                        }`}
                    >
                        {isEnabling
                            ? "Agree"
                            : "Remove from Featured"}
                    </button>
                </div>
            </div>
        </div>
    );
};
