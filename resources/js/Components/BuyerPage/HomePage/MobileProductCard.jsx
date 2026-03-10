import {
    FaStar,
    FaHeart,
    FaShoppingCart,
    FaShieldAlt as FaShield,
    FaClock,
    FaCheckCircle,
    FaChevronDown,
} from "react-icons/fa";

import { X } from "lucide-react";

import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";

import Swal from "sweetalert2";

export function MobileProductCard({ product, save_wishlist, get_wishlist }) {
    const [isLiked, setIsLiked] = useState(false);
    const [loadingWishlist, setLoadingWishlist] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [quantity, setQuantity] = useState(1);

    if (!product) return null;

    const { category, seller, product_variant } = product;

    // Use variant price if selected, otherwise use product price
    const currentPrice = selectedVariant?.price || product.product_price;
    const rating = product.ratings[0]?.rating || 0;
    const reviewCount = product.ratings.length || 0;

    // Enhanced product information
    const productCondition = product.product_condition || "Like New";
    const createdAt = product.created_at ? new Date(product.created_at) : null;
    const isNewProduct =
        createdAt && Date.now() - createdAt.getTime() < 7 * 24 * 60 * 60 * 1000;

    // Use variant quantity if selected, otherwise use product quantity
    const stockQuantity =
        selectedVariant?.quantity || product.product_quantity || 0;
    const isInStock = stockQuantity > 0;

    // Calculate discount percentage
    const originalPrice =
        product.original_price || product.product_original_price;
    const discountPercentage =
        originalPrice && parseFloat(originalPrice) > parseFloat(currentPrice)
            ? Math.round(
                  ((parseFloat(originalPrice) - parseFloat(currentPrice)) /
                      parseFloat(originalPrice)) *
                      100
              )
            : 0;

    // Check if product has variants
    const hasVariants = product_variant && product_variant.length > 0;

    // ADD THIS BACK: Check wishlist status on component mount
    useEffect(() => {
        const checkWishlistStatus = async () => {
            if (!get_wishlist) return;
            setLoadingWishlist(true);
            try {
                const wishlistData = await get_wishlist(product.product_id);
                if (wishlistData.is_wishlisted) {
                    setIsLiked(true);
                }
            } catch (error) {
                console.error("Error checking wishlist status:", error);
            } finally {
                setLoadingWishlist(false);
            }
        };
        checkWishlistStatus();
    }, [product.product_id, get_wishlist]);

    const handleWishlistClick = async () => {
        // Block if product is out of stock
        if (!isInStock) {
            Swal.fire(
                "Out of Stock",
                "This product is currently out of stock.",
                "warning"
            );
            return;
        }

        // For products with variants, show modal if no variant selected
        if (hasVariants && !selectedVariant) {
            setShowVariantModal(true);
            return;
        }

        // Prevent double click if already liked
        if (isLiked) return;

        setLoadingWishlist(true);

        try {
            const success = await save_wishlist(
                product.product_id,
                selectedVariant
            );
            if (success) {
                setIsLiked(true);
            }
        } catch (error) {
            console.error("Error adding to wishlist:", error);
            Swal.fire("Error", "Failed to add product to wishlist.", "error");
        } finally {
            setLoadingWishlist(false);
        }
    };

    const handleAddToCart = async () => {
        // Block if product is out of stock
        if (!isInStock) {
            Swal.fire(
                "Out of Stock",
                "This product is currently out of stock.",
                "warning"
            );
            return;
        }

        // For products with variants, show modal if no variant selected
        if (hasVariants && !selectedVariant) {
            setShowVariantModal(true);
            return;
        }

        // If we have selected variant or no variants, proceed with add to cart
        try {
            const success = await save_wishlist(
                product.product_id,
                selectedVariant
            );

            if (success) {
                setIsLiked(true);
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            Swal.fire("Error", "Failed to add product to cart.", "error");
        }
    };

    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);
        setShowVariantModal(false);
        setQuantity(1); // Reset quantity when variant changes
    };

    const formatRelativeTime = (date) => {
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            return `${Math.floor(diffInHours / 24)}d ago`;
        }
    };

    // Function to convert JSON variant data to readable text
    const formatVariantText = (variant) => {
        if (!variant) return "Select Option";

        // If variant_combination is a JSON string, parse it
        let combination = variant.variant_combination;

        if (typeof combination === "string") {
            try {
                combination = JSON.parse(combination);
            } catch (error) {
                console.error("Error parsing variant combination:", error);
                // If parsing fails, try to extract color from the string
                if (variant.variant_key) {
                    return variant.variant_key;
                }
                return "Selected";
            }
        }

        // If it's an object, convert to readable text
        if (typeof combination === "object" && combination !== null) {
            const parts = [];

            // Handle different variant types from your data
            if (combination.Colors) parts.push(`Color: ${combination.Colors}`);
            if (combination.Size) parts.push(`Size: ${combination.Size}`);
            if (combination.Material)
                parts.push(`Material: ${combination.Material}`);
            if (combination.Style) parts.push(`Style: ${combination.Style}`);

            // If no specific properties found, try to use any properties
            if (parts.length === 0) {
                for (const [key, value] of Object.entries(combination)) {
                    if (
                        key !== "variant_id" &&
                        key !== "price" &&
                        key !== "quantity"
                    ) {
                        parts.push(`${key}: ${value}`);
                    }
                }
            }

            return parts.length > 0
                ? parts.join(" • ")
                : variant.variant_key || "Selected";
        }

        // Fallback to variant key or generic text
        return variant.variant_key || "Selected";
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden">
                {/* Full Width Image Section */}
                <div className="relative">
                    <Link href={route("product-details", product.product_id)}>
                        <img
                            src={
                                import.meta.env.VITE_BASE_URL +
                                (product.product_image?.[0]?.image_path ||
                                    "/images/placeholder.jpg")
                            }
                            alt={product.product_name}
                            className="w-full h-48 object-cover"
                        />
                    </Link>

                    {/* Image Overlay Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {isNewProduct && (
                            <div className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                                NEW ARRIVAL
                            </div>
                        )}
                        {discountPercentage > 0 && (
                            <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                                {discountPercentage}% OFF
                            </div>
                        )}
                    </div>

                    {/* Condition Badge */}
                    <div className="absolute top-3 right-3">
                        <div className="bg-black bg-opacity-80 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                            {productCondition}
                        </div>
                    </div>

                    {/* Wishlist Button */}
                    <button
                        onClick={handleWishlistClick}
                        disabled={loadingWishlist || isLiked || !isInStock}
                        className="absolute bottom-3 right-3 bg-white bg-opacity-95 p-3 rounded-full shadow-lg transition-all duration-200 disabled:opacity-50 hover:scale-110"
                    >
                        {loadingWishlist ? (
                            <div className="w-5 h-5 border-2 border-gray-400 border-t-red-500 rounded-full animate-spin"></div>
                        ) : (
                            <FaHeart
                                className={`w-5 h-5 transition-colors ${
                                    isLiked
                                        ? "text-red-500 fill-red-500"
                                        : "text-gray-600 hover:text-red-400"
                                }`}
                            />
                        )}
                    </button>

                    <div className="absolute bottom-3 left-3 bg-red-200 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                        Sold: {product.order_items?.length || 0}
                    </div>
                </div>

                {/* Product Information Section */}
                <div className="p-4">
                    {/* Product Title and Basic Info */}
                    <div className="mb-3">
                        <Link
                            href={route("product-details", product.product_id)}
                        >
                            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2">
                                {product.product_name}
                            </h3>
                        </Link>

                        {/* Category and Posted Time */}
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                                {category?.category_name || "General"}
                            </span>
                            <div className="flex items-center space-x-1 text-gray-500">
                                <FaClock className="w-3 h-3" />
                                <span className="text-xs">
                                    {createdAt
                                        ? formatRelativeTime(createdAt)
                                        : "Recently"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Variant Selection */}
                    {hasVariants && (
                        <div className="mb-3">
                            <button
                                onClick={() => setShowVariantModal(true)}
                                className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                            >
                                <div className="text-left">
                                    <span className="text-sm font-medium text-gray-700 block">
                                        {formatVariantText(selectedVariant)}
                                    </span>
                                    {selectedVariant && (
                                        <span className="text-xs text-green-600">
                                            {selectedVariant.quantity} in stock
                                        </span>
                                    )}
                                </div>
                                <FaChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            </button>
                        </div>
                    )}

                    {/* Rating and Price Row */}
                    <div className="flex items-center justify-between mb-4">
                        {/* Rating */}
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                                <FaStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="font-bold text-gray-900">
                                    {rating.toFixed(1)}
                                </span>
                            </div>
                            <span className="text-gray-500">•</span>
                            <span className="text-sm text-gray-600">
                                {reviewCount} review
                                {reviewCount !== 1 ? "s" : ""}
                            </span>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                            <div className="flex items-center space-x-2">
                                <span className="text-xl font-bold text-gray-900">
                                    RM {parseFloat(currentPrice).toFixed(2)}
                                </span>
                                {originalPrice &&
                                    parseFloat(originalPrice) >
                                        parseFloat(currentPrice) && (
                                        <span className="text-sm text-gray-500 line-through">
                                            RM{" "}
                                            {parseFloat(originalPrice).toFixed(
                                                2
                                            )}
                                        </span>
                                    )}
                            </div>
                        </div>
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                        <div
                            className={`flex items-center space-x-2 ${
                                isInStock ? "text-green-600" : "text-red-600"
                            }`}
                        >
                            <FaCheckCircle className="w-4 h-4" />
                            <span className="font-semibold">
                                {isInStock ? "Available" : "Out of Stock"}
                            </span>
                        </div>
                        {isInStock && (
                            <span className="text-sm text-gray-600">
                                {stockQuantity} unit
                                {stockQuantity !== 1 ? "s" : ""} left
                            </span>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Link
                            href={route("product-details", product.product_id)}
                            className="flex-1"
                        >
                            <button className="w-full py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition-all duration-200 font-semibold text-sm">
                                View Details
                            </button>
                        </Link>
                        <button
                            onClick={handleAddToCart}
                            disabled={!isInStock}
                            className={`flex-1 py-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                                isInStock
                                    ? "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700 shadow-md hover:shadow-lg"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            <FaShoppingCart className="w-4 h-4" />
                            <span>
                                {hasVariants && !selectedVariant
                                    ? "Select Options"
                                    : "Add to Cart"}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Variant Selection Modal */}
            {showVariantModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end justify-center p-4">
                    <div className="bg-white rounded-t-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Select Variant
                                </h3>
                                <button
                                    onClick={() => setShowVariantModal(false)}
                                    className="p-2 text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4">
                            {/* Product Info */}
                            <div className="flex items-center space-x-3 mb-4">
                                <img
                                    src={
                                        import.meta.env.VITE_BASE_URL +
                                        (product.product_image?.[0]
                                            ?.image_path ||
                                            "/images/placeholder.jpg")
                                    }
                                    alt={product.product_name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm">
                                        {product.product_name}
                                    </h4>
                                    <p className="text-lg font-bold text-gray-900">
                                        RM{" "}
                                        {parseFloat(
                                            product.product_price
                                        ).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* Variant Options */}
                            <div className="space-y-3">
                                {product_variant.map((variant, index) => (
                                    <button
                                        key={variant.variant_id}
                                        onClick={() =>
                                            handleVariantSelect(variant)
                                        }
                                        disabled={variant.quantity <= 0}
                                        className={`w-full text-left p-3 border-2 rounded-lg transition-all ${
                                            selectedVariant?.variant_id ===
                                            variant.variant_id
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        } ${
                                            variant.quantity <= 0
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 text-sm">
                                                    {formatVariantText(variant)}
                                                </p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        RM{" "}
                                                        {parseFloat(
                                                            variant.price ||
                                                                product.product_price
                                                        ).toFixed(2)}
                                                    </p>
                                                    {variant.price !==
                                                        product.product_price && (
                                                        <p className="text-xs text-gray-500 line-through">
                                                            RM{" "}
                                                            {parseFloat(
                                                                product.product_price
                                                            ).toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p
                                                    className={`text-xs font-medium ${
                                                        variant.quantity > 0
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                    }`}
                                                >
                                                    {variant.quantity > 0
                                                        ? `${variant.quantity} in stock`
                                                        : "Out of stock"}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Selected Variant Summary */}
                            {selectedVariant && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm font-medium text-green-800">
                                        Selected:{" "}
                                        {formatVariantText(selectedVariant)}
                                    </p>
                                    <p className="text-sm text-green-600">
                                        Price: RM{" "}
                                        {parseFloat(
                                            selectedVariant.price ||
                                                product.product_price
                                        ).toFixed(2)}
                                    </p>
                                    <p className="text-sm text-green-600">
                                        Stock: {selectedVariant.quantity}{" "}
                                        available
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="sticky bottom-0 bg-white pt-4 mt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setShowVariantModal(false)}
                                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                                >
                                    {selectedVariant
                                        ? "Confirm Selection"
                                        : "Close"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
