// Components/BuyerPage/ProductCard.jsx
import { FaStar, FaHeart, FaShoppingBag, FaEye } from "react-icons/fa";
import { useState } from "react";
import { Link } from "@inertiajs/react";

export function ProductCard({ product, isFlashSale = false, save_wishlist }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [selectedVariants, setSelectedVariants] = useState({});
    const [wishlistPending, setWishlistPending] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    if (!product) {
        console.warn("ProductCard: No product data provided");
        return null;
    }

    // Safe data extraction with fallbacks
    const productData = product || {};

    const productName =
        productData.product_name || productData.name || "Unnamed Product";
    const productId =
        product.product_id ||
        productData.product_id ||
        `unknown-${Math.random()}`;
    const productPrice = parseFloat(productData.product_price) || 0;
    const originalPrice = productData.original_price
        ? parseFloat(productData.original_price)
        : null;
    const primaryImage = productData.product_image || "/default-product-image.jpg";
    const category = productData.category ||
        product.category || { category_name: "General" };
    const ratings = productData.product_total_ratings || 0;
    const rating = parseFloat(ratings[0]?.rating ?? ratings ?? 0);
    const reviewCount = ratings[0]?.review_count || productData.ratings || 0;
    const seller = productData.seller || { store_name: "Unknown Seller" };

    // Check if product has variants and process them according to your data structure
    const hasVariants =
        productData.product_variant && productData.product_variant.length > 0;

    // Process variants based on your data structure
    const variantGroups = {};
    const allVariants = productData.product_variant || [];

    if (hasVariants) {
        allVariants.forEach((variant) => {
            try {
                // Parse variant_combination which is a string containing JSON
                const combination =
                    typeof variant.variant_combination === "string"
                        ? JSON.parse(variant.variant_combination)
                        : variant.variant_combination || {};

                // Extract variant types and values from the combination
                Object.entries(combination).forEach(([type, value]) => {
                    if (!variantGroups[type]) {
                        variantGroups[type] = new Set();
                    }
                    variantGroups[type].add(value);
                });
            } catch (error) {
                console.error(
                    "Error parsing variant combination:",
                    error,
                    variant
                );
                // Fallback: use variant_key as a single variant type
                if (variant.variant_key) {
                    const type = "Option";
                    if (!variantGroups[type]) {
                        variantGroups[type] = new Set();
                    }
                    variantGroups[type].add(variant.variant_key);
                }
            }
        });

        // Convert Sets to Arrays
        Object.keys(variantGroups).forEach((type) => {
            variantGroups[type] = Array.from(variantGroups[type]);
        });
    }

    const allVariantsSelected = hasVariants
        ? Object.keys(variantGroups).every((type) => selectedVariants[type])
        : true;

    const findMatchingVariant = () => {
        if (!hasVariants || !allVariantsSelected) return null;

        return allVariants.find((variant) => {
            try {
                const combination =
                    typeof variant.variant_combination === "string"
                        ? JSON.parse(variant.variant_combination)
                        : variant.variant_combination || {};

                return Object.keys(selectedVariants).every(
                    (type) => combination[type] === selectedVariants[type]
                );
            } catch (error) {
                console.error("Error matching variant:", error);
                // Fallback: match by variant_key
                return (
                    variant.variant_key ===
                    Object.values(selectedVariants).join(" ")
                );
            }
        });
    };

    const selectedVariant = findMatchingVariant();
    const displayPrice = selectedVariant
        ? parseFloat(selectedVariant.variant_price || selectedVariant.price)
        : productPrice;
    const displayQuantity = selectedVariant
        ? parseInt(selectedVariant.variant_quantity || selectedVariant.quantity)
        : parseInt(productData.product_quantity) || 0;
    const isInStock = displayQuantity > 0;

    // Calculate discount percentage
    const discountPercent =
        originalPrice && originalPrice > displayPrice
            ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
            : 0;

    const handleWishlistClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (hasVariants && !allVariantsSelected) {
            setWishlistPending(true);
            setShowVariantModal(true);
            return;
        }

        // Prepare variant data for wishlist
        const variantData = selectedVariant
            ? {
                  variant_id: selectedVariant.variant_id,
                  variant_combination: selectedVariant.variant_combination,
                  price: displayPrice,
                  quantity: displayQuantity,
              }
            : null;

        save_wishlist(productId, variantData);
        setIsLiked(!isLiked);
    };

    const handleVariantSelect = (variantType, variantValue) => {
        setSelectedVariants((prev) => ({
            ...prev,
            [variantType]: variantValue,
        }));
    };

    const confirmWishlist = () => {
        if (allVariantsSelected && selectedVariant) {
            const variantData = {
                variant_id: selectedVariant.variant_id,
                variant_combination: selectedVariant.variant_combination,
                price: displayPrice,
                quantity: displayQuantity,
            };

            save_wishlist(productId, variantData);
            setIsLiked(true);
            setShowVariantModal(false);
            setWishlistPending(false);
        }
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoaded(true);
    };

    // Reset variants when modal opens
    const handleOpenVariantModal = () => {
        setSelectedVariants({});
        setShowVariantModal(true);
    };

    // Get available stock for selected variant or product
    const getVariantStock = (variantValue, variantType) => {
        const variant = allVariants.find((v) => {
            try {
                const combination =
                    typeof v.variant_combination === "string"
                        ? JSON.parse(v.variant_combination)
                        : v.variant_combination || {};
                return combination[variantType] === variantValue;
            } catch (error) {
                return v.variant_key === variantValue;
            }
        });
        return variant
            ? parseInt(variant.variant_quantity || variant.quantity)
            : 0;
    };

    // Get price for specific variant value
    const getVariantPrice = (variantValue, variantType) => {
        const variant = allVariants.find((v) => {
            try {
                const combination =
                    typeof v.variant_combination === "string"
                        ? JSON.parse(v.variant_combination)
                        : v.variant_combination || {};
                return combination[variantType] === variantValue;
            } catch (error) {
                return v.variant_key === variantValue;
            }
        });
        return variant
            ? parseFloat(variant.variant_price || variant.price)
            : productPrice;
    };

    return (
        <>
            <div
                className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col border border-gray-100 overflow-hidden relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Image Container */}
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="relative h-64 sm:h-60 md:h-56 lg:h-52 xl:h-60">
                        {/* Image with loading state */}
                        {!imageLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
                                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}

                        <img
                            src={
                                imageError
                                    ? "/default-product-image.jpg"
                                    : import.meta.env.VITE_BASE_URL +
                                      primaryImage
                            }
                            alt={productName}
                            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                                imageLoaded ? "opacity-100" : "opacity-0"
                            }`}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                        />

                        {/* Overlay with quick actions */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

                        {/* Top badges */}
                        <div className="absolute top-3 left-3 flex flex-col space-y-2">
                            {isFlashSale && (
                                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                    🔥 FLASH SALE
                                </div>
                            )}

                            {discountPercent > 0 && (
                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                    -{discountPercent}% OFF
                                </div>
                            )}

                            {/* Category badge */}
                            <div className="bg-white/95 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                                {category}
                            </div>

                            {/* Variant indicator */}
                            {hasVariants && (
                                <div className="bg-white/95 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-full border text-black">
                                    {Object.keys(variantGroups).length}{" "}
                                    {Object.keys(variantGroups).length === 1
                                        ? "Option"
                                        : "Options"}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                            {/* Wishlist Button */}
                            <button
                                onClick={handleWishlistClick}
                                className={`p-2.5 rounded-full backdrop-blur-sm border shadow-lg transition-all duration-300 transform hover:scale-110 ${
                                    isLiked
                                        ? "bg-red-500 border-red-500 text-white"
                                        : "bg-white/90 border-white/20 text-gray-700 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                                }`}
                            >
                                <FaHeart
                                    className={`w-3.5 h-3.5 ${
                                        isLiked ? "fill-current" : ""
                                    }`}
                                />
                            </button>

                            {/* Quick View */}
                            <Link href={route("product-details", productId)}>
                                <button className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-white/20 text-gray-700 shadow-lg transition-all duration-300 transform hover:scale-110 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                                    <FaEye className="w-3.5 h-3.5" />
                                </button>
                            </Link>
                        </div>

                        {/* Stock Status */}
                        {!isInStock && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-2xl">
                                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                                    <span className="text-sm font-bold text-gray-800">
                                        Out of Stock
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Info Section */}
                <div className="p-5 flex-grow flex flex-col">
                    {/* Seller & Category */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            {seller.store_name || "Unknown Store"}
                        </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 text-base leading-tight group-hover:text-gray-700 transition-colors duration-200 min-h-[2.5rem]">
                        {productName}
                    </h3>

                    {/* Selected Variant Display */}
                    {hasVariants &&
                        Object.keys(selectedVariants).length > 0 && (
                            <div className="mb-3">
                                <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(selectedVariants).map(
                                        ([type, value]) => (
                                            <span
                                                key={type}
                                                className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-xs font-medium rounded-lg border border-gray-200"
                                            >
                                                {type}:{" "}
                                                <span className="font-semibold ml-1">
                                                    {value}
                                                </span>
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                    {/* Rating and Reviews */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                        key={star}
                                        className={`w-3 h-3 ${
                                            star <= Math.round(rating)
                                                ? "text-yellow-400 fill-current"
                                                : "text-gray-300"
                                        }`}
                                    />
                                ))}
                                <span className="text-xs font-bold text-gray-700 ml-1.5">
                                    {rating.toFixed(1)}
                                </span>
                            </div>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                            {reviewCount} review{reviewCount !== 1 ? "s" : ""}
                        </span>
                    </div>

                    {/* Price Section */}
                    <div className="mb-4">
                        <div className="flex items-baseline space-x-2">
                            <span className="text-xl font-bold text-gray-900">
                                RM {displayPrice.toFixed(2)}
                            </span>
                            {originalPrice && originalPrice > displayPrice && (
                                <>
                                    <span className="text-sm text-gray-400 line-through">
                                        RM {originalPrice.toFixed(2)}
                                    </span>
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                        Save RM{" "}
                                        {(originalPrice - displayPrice).toFixed(
                                            2
                                        )}
                                    </span>
                                </>
                            )}
                        </div>
                        {hasVariants && selectedVariant && (
                            <p className="text-xs text-gray-500 mt-1">
                                Selected variant
                            </p>
                        )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                        <Link href={route("product-details", productId)}>
                            <button
                                className={`w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                                    isFlashSale
                                        ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                                        : isInStock
                                        ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                                disabled={!isInStock}
                            >
                                {isInStock ? (
                                    <>
                                        <FaShoppingBag className="w-4 h-4" />
                                        <span>
                                            {isFlashSale
                                                ? "Buy Now"
                                                : "View Details"}
                                        </span>
                                    </>
                                ) : (
                                    <span>Out of Stock</span>
                                )}
                            </button>
                        </Link>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span
                            className={`px-2 py-1 rounded-full ${
                                isInStock
                                    ? "bg-green-50 text-green-600 font-medium"
                                    : "bg-red-50 text-red-600 font-medium"
                            }`}
                        >
                            {isInStock
                                ? `${displayQuantity} in stock`
                                : "Out of stock"}
                        </span>
                        {hasVariants && (
                            <button
                                onClick={handleOpenVariantModal}
                                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                Select options
                            </button>
                        )}
                    </div>
                </div>

                {/* Hover effect border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 rounded-2xl pointer-events-none transition-all duration-300" />
            </div>

            {/* Enhanced Variant Selection Modal */}
            {showVariantModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden transform animate-scaleIn">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        Select Options
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Choose your preferred variants
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowVariantModal(false);
                                        setWishlistPending(false);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                                >
                                    <svg
                                        className="w-5 h-5 text-gray-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {/* Product Preview */}
                            <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-2xl">
                                <img
                                    src={
                                        import.meta.env.VITE_BASE_URL +
                                        primaryImage
                                    }
                                    alt={productName}
                                    className="w-20 h-20 object-cover rounded-xl shadow-sm"
                                    onError={(e) => {
                                        e.target.src =
                                            "/default-product-image.jpg";
                                    }}
                                />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                                        {productName}
                                    </h4>
                                    <p className="text-lg font-bold text-blue-600">
                                        RM {displayPrice.toFixed(2)}
                                    </p>
                                    {originalPrice &&
                                        originalPrice > displayPrice && (
                                            <p className="text-sm text-gray-500 line-through">
                                                RM {originalPrice.toFixed(2)}
                                            </p>
                                        )}
                                </div>
                            </div>

                            {/* Variant Selection */}
                            {Object.entries(variantGroups).map(
                                ([type, values]) => (
                                    <div key={type} className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-900 mb-3 capitalize">
                                            {type}
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {values.map((value) => {
                                                const stock = getVariantStock(
                                                    value,
                                                    type
                                                );
                                                const variantPrice =
                                                    getVariantPrice(
                                                        value,
                                                        type
                                                    );
                                                const isAvailable = stock > 0;
                                                const priceDifference =
                                                    variantPrice - productPrice;
                                                const isSelected =
                                                    selectedVariants[type] ===
                                                    value;

                                                return (
                                                    <button
                                                        key={value}
                                                        onClick={() =>
                                                            handleVariantSelect(
                                                                type,
                                                                value
                                                            )
                                                        }
                                                        disabled={!isAvailable}
                                                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                                                            isSelected
                                                                ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                                                                : isAvailable
                                                                ? "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:shadow-sm"
                                                                : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                                                        }`}
                                                    >
                                                        <div className="text-left">
                                                            <div className="font-semibold">
                                                                {value}
                                                            </div>
                                                            {priceDifference !==
                                                                0 && (
                                                                <div
                                                                    className={`text-xs mt-1 ${
                                                                        priceDifference >
                                                                        0
                                                                            ? "text-green-600"
                                                                            : "text-red-600"
                                                                    }`}
                                                                >
                                                                    {priceDifference >
                                                                    0
                                                                        ? "+"
                                                                        : ""}
                                                                    RM{" "}
                                                                    {Math.abs(
                                                                        priceDifference
                                                                    ).toFixed(
                                                                        2
                                                                    )}
                                                                </div>
                                                            )}
                                                            {!isAvailable && (
                                                                <div className="text-xs text-red-500 mt-1">
                                                                    Out of stock
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )
                            )}

                            {/* Selected Variants Summary */}
                            {Object.keys(selectedVariants).length > 0 &&
                                selectedVariant && (
                                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                            <svg
                                                className="w-4 h-4 mr-2 text-blue-600"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Selected Options
                                        </h4>
                                        <div className="space-y-2">
                                            {Object.entries(
                                                selectedVariants
                                            ).map(([type, value]) => (
                                                <div
                                                    key={type}
                                                    className="flex justify-between text-sm"
                                                >
                                                    <span className="text-gray-600 capitalize">
                                                        {type}:
                                                    </span>
                                                    <span className="font-semibold text-gray-900">
                                                        {value}
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
                                                <span className="text-gray-600">
                                                    Price:
                                                </span>
                                                <span className="font-bold text-blue-600">
                                                    RM {displayPrice.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">
                                                    Stock:
                                                </span>
                                                <span
                                                    className={`font-semibold ${
                                                        selectedVariant.variant_quantity >
                                                        0
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                    }`}
                                                >
                                                    {selectedVariant.variant_quantity >
                                                    0
                                                        ? `${selectedVariant.variant_quantity} available`
                                                        : "Out of stock"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            {/* Action Buttons */}
                            <div className="flex space-x-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        setShowVariantModal(false);
                                        setWishlistPending(false);
                                    }}
                                    className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmWishlist}
                                    disabled={
                                        !allVariantsSelected ||
                                        !selectedVariant ||
                                        selectedVariant.variant_quantity === 0
                                    }
                                    className={`flex-1 px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
                                        allVariantsSelected &&
                                        selectedVariant &&
                                        selectedVariant.variant_quantity > 0
                                            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                                >
                                    {wishlistPending
                                        ? "Add to Wishlist"
                                        : "Confirm Selection"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
