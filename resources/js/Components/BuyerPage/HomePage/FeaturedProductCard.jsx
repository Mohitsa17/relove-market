import { FaStar, FaHeart, FaShoppingCart, FaCartPlus } from "react-icons/fa";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // Import from react-dom
import { Link, usePage } from "@inertiajs/react";
import Swal from "sweetalert2";

// SweetAlert configuration
const showAlert = (icon, title, text, confirmButtonText = "OK") => {
    return Swal.fire({
        icon,
        title,
        text,
        confirmButtonText,
        confirmButtonColor: "#3085d6",
        customClass: {
            popup: "rounded-2xl",
            confirmButton: "px-4 py-2 rounded-lg font-medium",
        },
    });
};

// Create a Portal component for the modal
const ModalPortal = ({ children }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(children, document.body);
};

export function FeaturedProductCard({ product, save_wishlist }) {
    const { auth } = usePage().props;
    const [isHovered, setIsHovered] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({});

    // Check if user is logged in
    const isLoggedIn = auth && auth.user;

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (showVariantModal) {
            document.body.style.overflow = "hidden";
            document.documentElement.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
            document.documentElement.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
            document.documentElement.style.overflow = "unset";
        };
    }, [showVariantModal]);

    if (!product) return null;

    const { category } = product;
    const currentPrice = product.product_price;
    const rating = product.ratings?.[0]?.rating || 0;
    const reviewCount = product.ratings?.length || 0;
    const isInStock = product.product_quantity > 0;

    // Check if product has variants
    const hasVariants =
        product.product_variant && product.product_variant.length > 0;

    // Parse variant combination from different formats
    const parseVariantCombination = (variantData) => {
        if (!variantData) return {};

        try {
            // If it's already in the correct format with value_name, return it
            if (
                typeof variantData === "object" &&
                variantData.Colors &&
                typeof variantData.Colors === "object" &&
                variantData.Colors.value_name
            ) {
                return variantData;
            }

            // If it's in format: {"Colors":"red","Size":"U18"}
            if (typeof variantData === "object") {
                const combinations = {};
                Object.keys(variantData).forEach((key) => {
                    combinations[key] = { value_name: variantData[key] };
                });
                return combinations;
            }

            // If it's a string, try to parse it as JSON first
            if (typeof variantData === "string") {
                try {
                    const parsed = JSON.parse(variantData);
                    return parseVariantCombination(parsed);
                } catch (e) {
                    // If JSON parsing fails, try the text format
                    const combinations = {};
                    const pairs = variantData.split(", ");

                    pairs.forEach((pair) => {
                        const [key, value] = pair.split(": ");
                        if (key && value) {
                            combinations[key.trim()] = {
                                value_name: value.trim(),
                            };
                        }
                    });
                    return combinations;
                }
            }
        } catch (error) {
            console.error("Error parsing variant combination:", error);
        }

        return {};
    };

    // Get unique variant types (Colors, Sizes, etc.)
    const getVariantTypes = () => {
        if (!hasVariants) return [];

        const types = new Set();
        product.product_variant.forEach((variant) => {
            const combination = parseVariantCombination(
                variant.variant_combination
            );
            Object.keys(combination).forEach((type) => {
                types.add(type);
            });
        });
        return Array.from(types);
    };

    // Get available options for a variant type
    const getOptionsForType = (type) => {
        if (!hasVariants) return [];

        const options = new Set();
        product.product_variant.forEach((variant) => {
            const combination = parseVariantCombination(
                variant.variant_combination
            );
            if (combination && combination[type]) {
                options.add(combination[type].value_name);
            }
        });
        return Array.from(options);
    };

    // Find variant based on selected options
    const findVariant = (currentSelectedOptions = selectedOptions) => {
        if (!hasVariants || Object.keys(currentSelectedOptions).length === 0)
            return null;

        return product.product_variant.find((variant) => {
            const combination = parseVariantCombination(
                variant.variant_combination
            );
            if (!combination) return false;

            return Object.keys(currentSelectedOptions).every((type) => {
                return (
                    combination[type]?.value_name ===
                    currentSelectedOptions[type]
                );
            });
        });
    };

    const handleWishlistClick = () => {
        // Check if user is logged in
        if (!isLoggedIn) {
            showAlert(
                "warning",
                "Login Required",
                "Please log in to add items to your wishlist.",
                "Go to Login"
            ).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = route("login");
                }
            });
            return;
        }

        // If logged in, proceed with wishlist action
        if (hasVariants) {
            setShowVariantModal(true);
        } else {
            save_wishlist(product.product_id);
            setIsLiked(true);
        }
    };

    const handleAddToWishlistWithVariant = () => {
        // Double check if user is logged in (in case session expired)
        if (!isLoggedIn) {
            showAlert(
                "warning",
                "Session Expired",
                "Please log in again to add items to your wishlist.",
                "Go to Login"
            ).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = route("login");
                }
            });
            setShowVariantModal(false);
            return;
        }

        const variant = findVariant();

        if (variant) {
            save_wishlist(product.product_id, variant);
            setIsLiked(true);
            setShowVariantModal(false);
            setSelectedOptions({});
            setSelectedVariant(null);
        }
    };

    const handleOptionSelect = (type, option) => {
        // Check if user is logged in before allowing option selection
        if (!isLoggedIn) {
            showAlert(
                "warning",
                "Login Required",
                "Please log in to select product options.",
                "Go to Login"
            ).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = route("login");
                }
            });
            return;
        }

        const newSelectedOptions = { ...selectedOptions, [type]: option };
        setSelectedOptions(newSelectedOptions);
        const variant = findVariant(newSelectedOptions);
        setSelectedVariant(variant);
    };

    const VariantSelectionModal = () => {
        if (!showVariantModal) return null;

        const variantTypes = getVariantTypes();
        const selectedVariantPrice =
            selectedVariant?.price ||
            selectedVariant?.variant_price ||
            currentPrice;
        const isVariantInStock = selectedVariant
            ? selectedVariant.quantity > 0 || selectedVariant.stock_quantity > 0
            : true;

        return (
            <ModalPortal>
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-[9999]">
                    {/* Mobile Bottom Sheet / Desktop Centered Modal */}
                    <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-xl max-h-[85vh] overflow-hidden flex flex-col transform transition-transform duration-300 translate-y-0">
                        {/* Header - Compact */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Select Options
                                </h2>
                                <p className="text-gray-600 text-sm mt-1">
                                    Choose your preferred variant
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowVariantModal(false);
                                    setSelectedOptions({});
                                    setSelectedVariant(null);
                                }}
                                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2"
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

                        {/* Product Info - Compact */}
                        <div className="p-4 border-b border-gray-200 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <img
                                    src={
                                        import.meta.env.VITE_BASE_URL +
                                        product.product_image[0].image_path
                                    }
                                    alt={product.product_name}
                                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-base">
                                        {product.product_name}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {category.category_name}
                                    </p>
                                    <p className="text-lg font-bold text-green-600">
                                        RM {selectedVariantPrice}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Variant Selection - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {/* Login Prompt if not logged in */}
                            {!isLoggedIn && (
                                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                                    <div className="text-yellow-700 mb-3">
                                        <svg
                                            className="w-12 h-12 mx-auto mb-2 text-yellow-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                        <h4 className="font-semibold text-lg mb-1">
                                            Login Required
                                        </h4>
                                        <p className="text-sm">
                                            Please log in to select product
                                            options and add items to your
                                            wishlist.
                                        </p>
                                    </div>
                                    <Link
                                        href={route("login")}
                                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Go to Login
                                    </Link>
                                </div>
                            )}

                            {/* Variant options (only show if logged in) */}
                            {isLoggedIn && variantTypes.length > 0 ? (
                                variantTypes.map((type) => (
                                    <div key={type} className="mb-6 last:mb-0">
                                        <h4 className="font-semibold text-gray-900 mb-3 capitalize text-base">
                                            {type}
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {getOptionsForType(type).map(
                                                (option) => {
                                                    const isSelected =
                                                        selectedOptions[
                                                            type
                                                        ] === option;
                                                    return (
                                                        <button
                                                            key={option}
                                                            onClick={() =>
                                                                handleOptionSelect(
                                                                    type,
                                                                    option
                                                                )
                                                            }
                                                            className={`
                                                                px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all flex-shrink-0 min-w-[80px]
                                                                ${
                                                                    isSelected
                                                                        ? "border-green-500 bg-green-50 text-green-700"
                                                                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                                                                }
                                                            `}
                                                        >
                                                            {option}
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : isLoggedIn ? (
                                <div className="text-center py-4 text-gray-500">
                                    No variants available
                                </div>
                            ) : null}

                            {/* Help Text (only show if logged in) */}
                            {isLoggedIn &&
                                hasVariants &&
                                variantTypes.length > 0 &&
                                !selectedVariant && (
                                    <div className="text-center py-4 text-gray-500 text-sm">
                                        Please select options to see
                                        availability
                                    </div>
                                )}

                            {/* Stock Status (only show if logged in and variant selected) */}
                            {isLoggedIn && selectedVariant && (
                                <div
                                    className={`mt-4 p-3 rounded-lg text-sm font-medium ${
                                        isVariantInStock
                                            ? "bg-green-50 text-green-700 border border-green-200"
                                            : "bg-red-50 text-red-700 border border-red-200"
                                    }`}
                                >
                                    {isVariantInStock
                                        ? "✓ In Stock"
                                        : "✗ Out of Stock"}
                                </div>
                            )}
                        </div>

                        {/* Footer - Fixed at bottom */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => {
                                        setShowVariantModal(false);
                                        setSelectedOptions({});
                                        setSelectedVariant(null);
                                    }}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddToWishlistWithVariant}
                                    disabled={
                                        !isLoggedIn ||
                                        !selectedVariant ||
                                        !isVariantInStock
                                    }
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <FaCartPlus className="w-4 h-4" />
                                    {!isLoggedIn
                                        ? "Login Required"
                                        : "Add to Cart"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </ModalPortal>
        );
    };

    return (
        <>
            <VariantSelectionModal />

            <div
                className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col group border border-gray-100 overflow-hidden relative"
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
                            className="absolute top-3 right-3 bg-white hover:bg-gray-50 p-2 rounded-full shadow-md transition-colors duration-200 z-10"
                            title={
                                !isLoggedIn
                                    ? "Login to add to cart"
                                    : hasVariants
                                    ? "Add to Cart (Select Options)"
                                    : "Add to Cart"
                            }
                        >
                            <FaHeart
                                className={`w-4 h-4 ${
                                    isLiked
                                        ? "text-red-500"
                                        : !isLoggedIn
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                }`}
                            />
                        </button>

                        {/* Login Required Badge for Wishlist */}
                        {!isLoggedIn && (
                            <div className="absolute top-12 right-3 z-10">
                                <div className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-1 rounded shadow-sm">
                                    Login to Wishlist
                                </div>
                            </div>
                        )}

                        {/* Variant Indicator Badge */}
                        {hasVariants && isLoggedIn && (
                            <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                                <div className="bg-white bg-opacity-95 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded">
                                    {category.category_name}
                                </div>
                                <div className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                                    Options Available
                                </div>
                            </div>
                        )}

                        {/* Category Badge (when no variants or not logged in) */}
                        {(!hasVariants || !isLoggedIn) && (
                            <div className="absolute top-3 left-3 z-10">
                                <div className="bg-white bg-opacity-95 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded">
                                    {category.category_name}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Info Section */}
                <div className="p-5 flex-grow flex flex-col">
                    {/* Product Name */}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm md:text-base leading-tight group-hover:text-gray-700 transition-colors duration-200">
                        {product.product_name}
                    </h3>

                    {/* Variant Info (only show if logged in) */}
                    {hasVariants && isLoggedIn && (
                        <div className="mb-2">
                            <p className="text-xs text-blue-600 font-medium">
                                ⓘ Multiple options available
                            </p>
                        </div>
                    )}

                    {/* Login Prompt for Variants */}
                    {hasVariants && !isLoggedIn && (
                        <div className="mb-2">
                            <p className="text-xs text-yellow-600 font-medium">
                                ⓘ Login to see options
                            </p>
                        </div>
                    )}

                    {/* Rating and Reviews */}
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
                            ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
                        </span>
                    </div>

                    {/* Price Section */}
                    <div className="mb-4">
                        <div className="flex items-baseline space-x-2">
                            <span className="text-xl font-bold text-gray-900">
                                RM {currentPrice}
                            </span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                        <Link
                            href={route("product-details", product.product_id)}
                        >
                            <button
                                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                                    !isInStock
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg"
                                }`}
                                disabled={!isInStock}
                            >
                                <FaShoppingCart className="w-4 h-4" />
                                <span>
                                    {!isInStock
                                        ? "Out of Stock"
                                        : "View Details"}
                                </span>
                            </button>
                        </Link>
                    </div>

                    {/* Seller Info */}
                    <div className="mt-3 flex justify-between text-xs text-gray-500">
                        <span className="truncate">
                            {product.seller?.seller_store?.store_name ||
                                "Seller"}
                        </span>
                        <span className="flex font-bold items-center">
                            Sold: {product.order_items?.length || 0}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
