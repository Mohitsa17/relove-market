import { FaStar, FaHeart, FaTimes, FaClock } from "react-icons/fa";

import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";

export function ShopProductCard({ product, save_wishlist, get_wishlist }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [selectedVariants, setSelectedVariants] = useState({});
    const [loadingWishlist, setLoadingWishlist] = useState(false); // Add loading state

    if (!product) return null;

    const { category } = product;
    const currentPrice = product.product_price;
    const rating = product.ratings[0]?.rating || 0;
    const reviewCount = product.ratings.length || 0;

    // Enhanced product information
    const productCondition = product.product_condition || "Like New";
    const createdAt = product.created_at ? new Date(product.created_at) : null;
    const isNewProduct =
        createdAt && Date.now() - createdAt.getTime() < 7 * 24 * 60 * 60 * 1000;
    const productSoldCount = product.order_items?.length || 0;

    // Check if product is in wishlist when component mounts
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

    // Variant handling
    const hasVariants =
        product.product_variant && product.product_variant.length > 0;
    const variantGroups = {};

    if (hasVariants) {
        product.product_variant.forEach((variant) => {
            try {
                const combination =
                    typeof variant.variant_combination === "string"
                        ? JSON.parse(variant.variant_combination)
                        : variant.variant_combination;

                Object.entries(combination).forEach(([type, value]) => {
                    if (!variantGroups[type]) {
                        variantGroups[type] = new Set();
                    }
                    variantGroups[type].add(value);
                });
            } catch (error) {
                console.error("Error parsing variant combination:", error);
            }
        });

        Object.keys(variantGroups).forEach((type) => {
            variantGroups[type] = Array.from(variantGroups[type]);
        });
    }

    const allVariantsSelected = hasVariants
        ? Object.keys(variantGroups).every((type) => selectedVariants[type])
        : true;

    const findMatchingVariant = () => {
        if (!hasVariants || !allVariantsSelected) return null;

        return product.product_variant.find((variant) => {
            try {
                const combination =
                    typeof variant.variant_combination === "string"
                        ? JSON.parse(variant.variant_combination)
                        : variant.variant_combination;

                return Object.keys(selectedVariants).every(
                    (type) => combination[type] === selectedVariants[type]
                );
            } catch (error) {
                console.error("Error finding matching variant:", error);
                return false;
            }
        });
    };

    const selectedVariant = findMatchingVariant();

    // Use the correct field names from your data structure
    const displayPrice = selectedVariant?.price || currentPrice;
    const displayQuantity =
        selectedVariant?.quantity || product.product_quantity;
    const isInStock = displayQuantity > 0;

    const handleWishlistClick = async (e) => {
        e.preventDefault();

        if (isLiked) {
            console.log("Product is already in wishlist");
            return;
        }

        if (hasVariants && !allVariantsSelected) {
            setShowVariantModal(true);
            return;
        }

        // Prepare variant data according to controller expectations
        let variantData = null;
        if (hasVariants && selectedVariant) {
            variantData = {
                variant_id: selectedVariant.variant_id,
                variant_combination:
                    typeof selectedVariant.variant_combination === "string"
                        ? JSON.parse(selectedVariant.variant_combination)
                        : selectedVariant.variant_combination,
                price: selectedVariant.price, // Use 'price' not 'variant_price'
                quantity: selectedVariant.quantity, // Use 'quantity' not 'stock_quantity'
            };
        }

        console.log("Sending wishlist data:", {
            product_id: product.product_id,
            selected_variant: variantData,
        }); // Debug log

        setLoadingWishlist(true);
        const success = await save_wishlist(product.product_id, variantData);
        if (success) {
            setIsLiked(true);
        }
        setLoadingWishlist(false);
    };

    const handleVariantSelect = (variantType, variantValue) => {
        const newSelection = {
            ...selectedVariants,
            [variantType]: variantValue,
        };
        setSelectedVariants(newSelection);
        console.log("Variant selection updated:", newSelection); // Debug log
    };

    const confirmWishlist = async () => {
        if (allVariantsSelected && selectedVariant) {
            // Prepare variant data according to controller expectations
            const variantData = {
                variant_id: selectedVariant.variant_id,
                variant_combination:
                    typeof selectedVariant.variant_combination === "string"
                        ? JSON.parse(selectedVariant.variant_combination)
                        : selectedVariant.variant_combination,
                price: selectedVariant.price, // Use 'price' not 'variant_price'
                quantity: selectedVariant.quantity, // Use 'quantity' not 'stock_quantity'
            };

            console.log("Confirming wishlist with data:", {
                product_id: product.product_id,
                selected_variant: variantData,
            }); // Debug log

            setLoadingWishlist(true);
            const success = await save_wishlist(
                product.product_id,
                variantData
            );
            if (success) {
                setIsLiked(true);
                setShowVariantModal(false);
            }
            setLoadingWishlist(false);
        }
    };

    // Get variant display text
    const getVariantDisplayText = () => {
        if (!hasVariants || Object.keys(selectedVariants).length === 0)
            return null;

        return Object.entries(selectedVariants)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ");
    };

    // Initialize variants when modal opens
    const handleOpenVariantModal = () => {
        // If no variants are selected yet, auto-select the first available option for each type
        if (Object.keys(selectedVariants).length === 0 && hasVariants) {
            const initialSelection = {};
            Object.keys(variantGroups).forEach((type) => {
                if (variantGroups[type].length > 0) {
                    initialSelection[type] = variantGroups[type][0];
                }
            });
            setSelectedVariants(initialSelection);
        }
        setShowVariantModal(true);
    };

    // Format date to relative time
    const formatRelativeTime = (date) => {
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else if (diffInHours < 168) {
            return `${Math.floor(diffInHours / 24)}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    return (
        <>
            <div
                className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col group border border-gray-100 overflow-hidden"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Image Section */}
                <div className="relative overflow-hidden bg-gray-50">
                    <div className="relative h-60 sm:h-56 md:h-52 lg:h-48 xl:h-56">
                        <img
                            src={
                                import.meta.env.VITE_BASE_URL +
                                product.product_image[0].image_path
                            }
                            alt={product.product_name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        {/* Wishlist Button */}
                        <button
                            onClick={handleWishlistClick}
                            disabled={loadingWishlist || isLiked}
                            className="absolute top-3 right-3 bg-white hover:bg-gray-50 p-2 rounded-full shadow-md transition-colors duration-200 disabled:opacity-50"
                        >
                            {loadingWishlist ? (
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                            ) : (
                                <FaHeart
                                    className={`w-4 h-4 ${
                                        isLiked
                                            ? "text-red-500"
                                            : "text-gray-600"
                                    }`}
                                />
                            )}
                        </button>

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col space-y-2">
                            <div className="bg-white bg-opacity-95 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded">
                                {category.category_name}
                            </div>
                            {hasVariants && (
                                <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                                    {Object.keys(variantGroups).length} Options
                                </div>
                            )}

                            {isLiked && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-2 py-1 rounded">
                                    In Cart
                                </div>
                            )}
                        </div>

                        {/* Condition Badge */}
                        <div className="absolute bottom-3 left-3">
                            <div className="bg-black bg-opacity-70 text-white text-xs font-medium px-2 py-1 rounded">
                                {productCondition}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Info */}
                <div className="p-5 flex-grow flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm md:text-base leading-tight">
                        {product.product_name}
                    </h3>

                    {/* Product Condition and Posted Date */}
                    <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
                        <span className="flex items-center">
                            <FaClock className="w-3 h-3 mr-1" />
                            {createdAt
                                ? formatRelativeTime(createdAt)
                                : "Recently"}
                        </span>
                        <span className="text-black font-bold">
                            Sold:{" "}
                            <span className="text-red-600">
                                {productSoldCount}
                            </span>
                        </span>
                    </div>

                    {/* Selected Variants */}
                    {hasVariants && getVariantDisplayText() && (
                        <div className="mb-2">
                            <div className="flex flex-wrap gap-1">
                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                                    {getVariantDisplayText()}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Show variant selection prompt if no variant selected but product has variants */}
                    {hasVariants && !getVariantDisplayText() && (
                        <div className="mb-2">
                            <button
                                onClick={handleOpenVariantModal}
                                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Select options
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                        key={star}
                                        className={`w-3 h-3 ${
                                            star <= Math.round(rating)
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-gray-600 font-medium">
                                {rating.toFixed(1)}
                            </span>
                        </div>
                        <span className="text-xs text-gray-500">
                            ({reviewCount} reviews)
                        </span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                        <span className="text-xl font-bold text-gray-900">
                            RM {displayPrice}
                        </span>
                        {hasVariants &&
                            selectedVariant &&
                            selectedVariant.price !==
                                parseFloat(currentPrice) && (
                                <span className="text-sm text-gray-500 line-through ml-2">
                                    RM {currentPrice}
                                </span>
                            )}
                    </div>
                    {hasVariants &&
                        selectedVariant &&
                        selectedVariant.price !== parseFloat(currentPrice) && (
                            <span className="text-sm text-gray-500 line-through">
                                RM {currentPrice}
                            </span>
                        )}

                    {/* Stock Status */}
                    <div className="mb-4">
                        <div className="flex flex-row justify-between">
                            <span
                                className={`text-xs font-medium ${
                                    isInStock
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {isInStock
                                    ? `In Stock (${displayQuantity})`
                                    : "Out of Stock"}
                            </span>
                            {isNewProduct && (
                                <div className="text-violet-600 text-xs font-bold rounded">
                                    NEW ARRIVAL
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto space-y-2">
                        <Link
                            href={route("product-details", product.product_id)}
                        >
                            <button className="w-full py-2.5 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                View Details
                            </button>
                        </Link>
                    </div>

                    {/* Seller Info */}
                    <div className="mt-3 text-xs text-gray-500">
                        {product.seller?.seller_store?.store_name || "Seller"}
                    </div>
                </div>
            </div>

            {/* Variant Modal */}
            {showVariantModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Select Variants
                            </h3>
                            <button
                                onClick={() => setShowVariantModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <img
                                    src={
                                        import.meta.env.VITE_BASE_URL +
                                        product.product_image[0].image_path
                                    }
                                    alt={product.product_name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm">
                                        {product.product_name}
                                    </h4>
                                    <p className="text-lg font-bold text-gray-900">
                                        RM {displayPrice}
                                    </p>
                                </div>
                            </div>

                            {/* Variant Selection */}
                            {Object.entries(variantGroups).map(
                                ([type, values]) => (
                                    <div key={type} className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-3 capitalize">
                                            {type}
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {values.map((value) => {
                                                const variantForValue =
                                                    product.product_variant.find(
                                                        (v) => {
                                                            try {
                                                                const combination =
                                                                    typeof v.variant_combination ===
                                                                    "string"
                                                                        ? JSON.parse(
                                                                              v.variant_combination
                                                                          )
                                                                        : v.variant_combination;
                                                                return (
                                                                    combination[
                                                                        type
                                                                    ] === value
                                                                );
                                                            } catch {
                                                                return false;
                                                            }
                                                        }
                                                    );
                                                const isAvailable =
                                                    variantForValue &&
                                                    variantForValue.quantity >
                                                        0;

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
                                                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                                                            selectedVariants[
                                                                type
                                                            ] === value
                                                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                                                : isAvailable
                                                                ? "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                                                                : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        }`}
                                                    >
                                                        {value}
                                                        {!isAvailable && (
                                                            <span className="text-xs text-red-500 ml-1">
                                                                (Out of Stock)
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )
                            )}

                            {/* Selected Variant Details */}
                            {selectedVariant && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                RM {selectedVariant.price}{" "}
                                                {/* Use 'price' not 'variant_price' */}
                                            </p>
                                            <p
                                                className={`text-sm ${
                                                    selectedVariant.quantity > 0
                                                        ? "text-green-600"
                                                        : "text-red-600" /* Use 'quantity' not 'stock_quantity' */
                                                }`}
                                            >
                                                {selectedVariant.quantity > 0
                                                    ? `${selectedVariant.quantity} in stock`
                                                    : "Out of stock"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-600">
                                        Selected: {getVariantDisplayText()}
                                    </div>
                                </div>
                            )}

                            {/* Show message if not all variants selected */}
                            {!allVariantsSelected && (
                                <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        Please select all variant options
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowVariantModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmWishlist}
                                    disabled={
                                        loadingWishlist ||
                                        !allVariantsSelected ||
                                        !selectedVariant ||
                                        selectedVariant.quantity === 0
                                    }
                                    className={`flex-1 px-4 py-3 rounded-xl font-medium flex items-center justify-center ${
                                        allVariantsSelected &&
                                        selectedVariant &&
                                        selectedVariant.quantity > 0
                                            ? "bg-red-600 hover:bg-red-700 text-white"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                                >
                                    {loadingWishlist ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Adding...
                                        </>
                                    ) : (
                                        "Add to Cart"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
