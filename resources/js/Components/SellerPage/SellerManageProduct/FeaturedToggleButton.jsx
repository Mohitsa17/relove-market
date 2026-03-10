// Components/SellerPage/SellerManageProduct/FeaturedToggleButton.jsx
import React, { useState } from "react";
import { Star } from "lucide-react";
import { FeaturedTaxModal } from "./FeaturedTaxModal";

export const FeaturedToggleButton = ({
    product,
    isProductFeatured,
    toggleProductFeatured,
    togglingProduct,
}) => {
    const [showTaxModal, setShowTaxModal] = useState(false);
    const currentFeaturedStatus = isProductFeatured(product.product_id);

    const handleToggleClick = () => {
        // Show tax modal only when enabling featured status
        if (!currentFeaturedStatus) {
            setShowTaxModal(true);
        } else {
            // Directly disable featured status (no tax for disabling)
            toggleProductFeatured(product);
        }
    };

    const handleConfirmFeatured = () => {
        setShowTaxModal(false);
        toggleProductFeatured(product);
    };

    return (
        <>
            <button
                onClick={handleToggleClick}
                disabled={togglingProduct === product.product_id}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    currentFeaturedStatus
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
                        : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                } ${
                    togglingProduct === product.product_id
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                }`}
                title={
                    currentFeaturedStatus
                        ? "Remove from featured"
                        : "Make featured (10% tax applies)"
                }
            >
                <Star
                    size={12}
                    className={
                        currentFeaturedStatus
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-gray-400"
                    }
                />
                {togglingProduct === product.product_id ? (
                    <span>Processing...</span>
                ) : (
                    <span>
                        {currentFeaturedStatus ? "Featured" : "Feature"}
                    </span>
                )}
            </button>

            <FeaturedTaxModal
                isOpen={showTaxModal}
                onClose={() => setShowTaxModal(false)}
                onConfirm={handleConfirmFeatured}
                product={product}
                currentFeaturedStatus={currentFeaturedStatus}
            />
        </>
    );
};
