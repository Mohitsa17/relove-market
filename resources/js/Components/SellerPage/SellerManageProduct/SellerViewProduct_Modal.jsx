import {
    X,
    Package,
    CheckCircle,
    Star,
    Box,
    ImageIcon,
    Video,
    Info,
    Calendar,
    Eye,
    ShoppingCart,
    ChevronLeft,
    ChevronRight,
    Palette,
    PackageOpen,
    TrendingUp,
    Hash,
    AlertTriangle,
} from "lucide-react";
import { useState } from "react";

export function SellerViewProduct_Modal({ product, onClose }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    // Helper functions
    const getConditionStyle = (condition) => {
        const styles = {
            new: "bg-green-100 text-green-800 border-green-200",
            excellent: "bg-emerald-100 text-emerald-800 border-emerald-200",
            good: "bg-amber-100 text-amber-800 border-amber-200",
            fair: "bg-orange-100 text-orange-800 border-orange-200",
            poor: "bg-red-100 text-red-800 border-red-200",
        };
        return styles[condition] || styles.good;
    };

    const getConditionLabel = (condition) => {
        const labels = {
            new: "Brand New",
            excellent: "Excellent",
            good: "Good",
            fair: "Fair",
            poor: "Poor",
        };
        return labels[condition] || condition;
    };

    const getStatusStyle = (status) => {
        const styles = {
            available: "bg-green-100 text-green-800",
            reserved: "bg-yellow-100 text-yellow-800",
            sold: "bg-gray-100 text-gray-800",
            draft: "bg-blue-100 text-blue-800",
        };
        return styles[status] || styles.draft;
    };

    const getStatusLabel = (status) => {
        const labels = {
            available: "Available",
            reserved: "Reserved",
            sold: "Sold",
            draft: "Draft",
        };
        return labels[status] || status;
    };

    const getVariantStatusStyle = (quantity) => {
        if (quantity === 0) return "bg-red-100 text-red-800 border-red-200";
        if (quantity <= 5)
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        return "bg-green-100 text-green-800 border-green-200";
    };

    const getVariantStatusLabel = (quantity) => {
        if (quantity === 0) return "Out of Stock";
        if (quantity <= 5) return "Low Stock";
        return "In Stock";
    };

    const hasFeatures = product?.product_feature?.length > 0;
    const hasIncludedItems = product?.product_include_item?.length > 0;
    const hasImages = product?.product_image?.length > 0;
    const hasVideos = product?.product_video?.length > 0;
    const hasVariants = product?.product_variant?.length > 0;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const openImageModal = (index) => {
        setSelectedImageIndex(index);
        setIsImageModalOpen(true);
    };

    const nextImage = () => {
        setSelectedImageIndex(
            (prev) => (prev + 1) % product.product_image.length
        );
    };

    const prevImage = () => {
        setSelectedImageIndex(
            (prev) =>
                (prev - 1 + product.product_image.length) %
                product.product_image.length
        );
    };

    // Calculate variant statistics
    const calculateVariantStats = () => {
        if (!hasVariants) return null;

        const variants = product.product_variant;
        const totalVariants = variants.length;
        const inStockVariants = variants.filter((v) => v.quantity > 0).length;
        const outOfStockVariants = variants.filter(
            (v) => v.quantity === 0
        ).length;
        const lowStockVariants = variants.filter(
            (v) => v.quantity > 0 && v.quantity <= 5
        ).length;

        const totalStock = variants.reduce(
            (sum, v) => sum + (v.quantity || 0),
            0
        );
        const minPrice = Math.min(
            ...variants.map((v) =>
                parseFloat(v.price || product.product_price || 0)
            )
        );
        const maxPrice = Math.max(
            ...variants.map((v) =>
                parseFloat(v.price || product.product_price || 0)
            )
        );

        return {
            totalVariants,
            inStockVariants,
            outOfStockVariants,
            lowStockVariants,
            totalStock,
            minPrice,
            maxPrice,
            hasPriceRange: minPrice !== maxPrice,
        };
    };

    const variantStats = calculateVariantStats();

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-0">
                    {/* Header */}
                    <div className="flex justify-between items-start sm:items-center p-4 sm:p-5 border-b bg-white sticky top-0 z-10">
                        <div className="flex items-start sm:items-center space-x-3 max-w-[70%]">
                            <div className="bg-indigo-100 p-2 rounded-lg flex-shrink-0">
                                <Package
                                    className="text-indigo-600"
                                    size={20}
                                />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 break-words">
                                    {product?.product_name}
                                </h2>
                                <p className="text-xs text-gray-600 flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                                    <span>ID: {product?.product_id}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                                            product?.product_status
                                        )}`}
                                    >
                                        {getStatusLabel(
                                            product?.product_status
                                        )}
                                    </span>
                                    {hasVariants && (
                                        <>
                                            <span className="hidden sm:inline">
                                                •
                                            </span>
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {variantStats.totalVariants}{" "}
                                                Variants
                                            </span>
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 mt-1 sm:mt-0"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="border-b bg-white sticky top-[72px] sm:top-[84px] z-10">
                        <nav className="flex space-x-1 sm:space-x-4 px-3 sm:px-5 overflow-x-auto">
                            {[
                                {
                                    id: "overview",
                                    label: "Overview",
                                    icon: Eye,
                                },
                                {
                                    id: "features",
                                    label: "Features",
                                    icon: Star,
                                },
                                {
                                    id: "variants",
                                    label: "Variants",
                                    icon: Palette,
                                    show: hasVariants,
                                },
                                {
                                    id: "media",
                                    label: "Media",
                                    icon: ImageIcon,
                                },
                                { id: "details", label: "Details", icon: Info },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-3 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex items-center ${
                                        activeTab === tab.id
                                            ? "border-indigo-500 text-indigo-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    <tab.icon
                                        size={16}
                                        className="mr-1 sm:mr-2"
                                    />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {/* Overview Tab */}
                        {activeTab === "overview" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-5">
                                {/* Media Section */}
                                <div className="space-y-3">
                                    {/* Main Image */}
                                    <div className="bg-gray-50 rounded-lg p-3 aspect-square flex items-center justify-center relative">
                                        {hasImages ? (
                                            <img
                                                src={`${BASE_URL}${product.product_image[0].image_path}`}
                                                alt={product.product_name}
                                                className="w-full h-full object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() =>
                                                    openImageModal(0)
                                                }
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                                <ImageIcon size={32} />
                                                <span className="mt-2 text-sm">
                                                    No image available
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Image Thumbnails */}
                                    {hasImages &&
                                        product.product_image.length > 1 && (
                                            <div className="grid grid-cols-4 gap-2">
                                                {product.product_image
                                                    .slice(0, 4)
                                                    .map((img, index) => (
                                                        <div
                                                            key={index}
                                                            className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all"
                                                            onClick={() =>
                                                                openImageModal(
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            <img
                                                                src={`${BASE_URL}${img.image_path}`}
                                                                alt={`${
                                                                    product.product_name
                                                                } ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                {product.product_image.length >
                                                    4 && (
                                                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 text-sm">
                                                        +
                                                        {product.product_image
                                                            .length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                </div>

                                {/* Product Details */}
                                <div className="space-y-4">
                                    {/* Price and Condition */}
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                        <div>
                                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                                                {hasVariants &&
                                                variantStats.hasPriceRange ? (
                                                    <>
                                                        RM{" "}
                                                        {variantStats.minPrice.toFixed(
                                                            2
                                                        )}{" "}
                                                        - RM{" "}
                                                        {variantStats.maxPrice.toFixed(
                                                            2
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        RM{" "}
                                                        {parseFloat(
                                                            product?.product_price ||
                                                                0
                                                        ).toFixed(2)}
                                                    </>
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {hasVariants &&
                                                variantStats.hasPriceRange
                                                    ? "Price Range"
                                                    : "Selling Price"}
                                                {hasVariants &&
                                                    ` (${variantStats.totalVariants} variants)`}
                                            </p>
                                        </div>
                                        <div className="sm:text-right">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getConditionStyle(
                                                    product?.product_condition
                                                )}`}
                                            >
                                                {getConditionLabel(
                                                    product?.product_condition
                                                )}
                                            </span>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Condition
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quick Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                                        <div className="text-center p-3 bg-white rounded-lg">
                                            <div className="flex items-center justify-center space-x-1">
                                                <ShoppingCart
                                                    size={16}
                                                    className="text-gray-400"
                                                />
                                                <span className="text-lg font-semibold text-gray-900">
                                                    {hasVariants
                                                        ? variantStats.totalStock
                                                        : product?.product_quantity ||
                                                          0}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Total Stock
                                            </p>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-lg">
                                            <div className="flex items-center justify-center space-x-1">
                                                <PackageOpen
                                                    size={16}
                                                    className="text-gray-400"
                                                />
                                                <span className="text-lg font-semibold text-gray-900">
                                                    {hasVariants
                                                        ? variantStats.totalVariants
                                                        : 1}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {hasVariants
                                                    ? "Variants"
                                                    : "Variant"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="bg-white rounded-lg border p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                            <Info
                                                size={16}
                                                className="mr-2 text-indigo-500"
                                            />
                                            Description
                                        </h3>
                                        <p className="text-gray-700 leading-relaxed text-sm">
                                            {product?.product_description ||
                                                "No description provided."}
                                        </p>
                                    </div>

                                    {/* Variant Quick Stats */}
                                    {hasVariants && (
                                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center text-sm">
                                                <TrendingUp
                                                    size={16}
                                                    className="mr-2 text-purple-500"
                                                />
                                                Variant Summary
                                            </h3>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        In Stock:
                                                    </span>
                                                    <span className="font-medium text-green-600">
                                                        {
                                                            variantStats.inStockVariants
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Low Stock:
                                                    </span>
                                                    <span className="font-medium text-yellow-600">
                                                        {
                                                            variantStats.lowStockVariants
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Out of Stock:
                                                    </span>
                                                    <span className="font-medium text-red-600">
                                                        {
                                                            variantStats.outOfStockVariants
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Price Range:
                                                    </span>
                                                    <span className="font-medium text-blue-600">
                                                        RM
                                                        {variantStats.minPrice.toFixed(
                                                            2
                                                        )}
                                                        -
                                                        {variantStats.maxPrice.toFixed(
                                                            2
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Features Tab */}
                        {activeTab === "features" && (
                            <div className="p-4 sm:p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    {/* Key Features */}
                                    <div className="bg-white rounded-lg border p-4 sm:p-5">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                            <Star
                                                size={18}
                                                className="text-yellow-500 mr-2"
                                            />
                                            Key Features
                                        </h3>
                                        {hasFeatures ? (
                                            <div className="space-y-3">
                                                {product.product_feature.map(
                                                    (feature, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-start p-3 bg-blue-50 rounded-lg"
                                                        >
                                                            <CheckCircle
                                                                size={16}
                                                                className="text-blue-500 mt-0.5 mr-3 flex-shrink-0"
                                                            />
                                                            <span className="text-gray-700 text-sm">
                                                                {
                                                                    feature.feature_text
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <Star
                                                    size={28}
                                                    className="mx-auto text-gray-300 mb-2"
                                                />
                                                <p className="text-sm">
                                                    No key features specified
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Included Items */}
                                    <div className="bg-white rounded-lg border p-4 sm:p-5">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                            <Box
                                                size={18}
                                                className="text-green-500 mr-2"
                                            />
                                            What's Included
                                        </h3>
                                        {hasIncludedItems ? (
                                            <div className="space-y-3">
                                                {product.product_include_item.map(
                                                    (item, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-start p-3 bg-green-50 rounded-lg"
                                                        >
                                                            <CheckCircle
                                                                size={16}
                                                                className="text-green-500 mt-0.5 mr-3 flex-shrink-0"
                                                            />
                                                            <span className="text-gray-700 text-sm">
                                                                {item.item_name}
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <Box
                                                    size={28}
                                                    className="mx-auto text-gray-300 mb-2"
                                                />
                                                <p className="text-sm">
                                                    No items included
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Variants Tab */}
                        {activeTab === "variants" && hasVariants && (
                            <div className="p-4 sm:p-5">
                                <div className="bg-white rounded-lg border">
                                    {/* Variants Header */}
                                    <div className="p-4 sm:p-5 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
                                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                            <Palette
                                                size={20}
                                                className="mr-2 text-purple-500"
                                            />
                                            Product Variants
                                        </h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Hash size={16} />
                                                <span>
                                                    Total:{" "}
                                                    <strong>
                                                        {
                                                            variantStats.totalVariants
                                                        }
                                                    </strong>{" "}
                                                    variants
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <CheckCircle
                                                    size={16}
                                                    className="text-green-500"
                                                />
                                                <span>
                                                    In Stock:{" "}
                                                    <strong>
                                                        {
                                                            variantStats.inStockVariants
                                                        }
                                                    </strong>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <AlertTriangle
                                                    size={16}
                                                    className="text-yellow-500"
                                                />
                                                <span>
                                                    Low Stock:{" "}
                                                    <strong>
                                                        {
                                                            variantStats.lowStockVariants
                                                        }
                                                    </strong>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Variants View */}
                                    <div className="p-4">
                                        <div className="space-y-3">
                                            {product.product_variant.map(
                                                (variant, index) => {
                                                    const combination =
                                                        typeof variant.variant_combination ===
                                                        "string"
                                                            ? JSON.parse(
                                                                  variant.variant_combination ||
                                                                      "{}"
                                                              )
                                                            : variant.variant_combination ||
                                                              {};

                                                    return (
                                                        <div
                                                            key={
                                                                variant.variant_id
                                                            }
                                                            className="border rounded-lg p-3 bg-white"
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="font-mono text-xs text-gray-500">
                                                                    {
                                                                        variant.variant_id
                                                                    }
                                                                </div>
                                                                <span
                                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getVariantStatusStyle(
                                                                        variant.quantity
                                                                    )}`}
                                                                >
                                                                    {getVariantStatusLabel(
                                                                        variant.quantity
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <div className="mb-2">
                                                                <div className="flex flex-wrap gap-1 mb-2">
                                                                    {Object.entries(
                                                                        combination
                                                                    ).map(
                                                                        ([
                                                                            key,
                                                                            value,
                                                                        ]) => (
                                                                            <span
                                                                                key={
                                                                                    key
                                                                                }
                                                                                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                                                                            >
                                                                                {
                                                                                    key
                                                                                }

                                                                                :{" "}
                                                                                {
                                                                                    value
                                                                                }
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-between items-center text-sm">
                                                                <div>
                                                                    <span className="font-semibold text-gray-900">
                                                                        RM{" "}
                                                                        {parseFloat(
                                                                            variant.price ||
                                                                                0
                                                                        ).toFixed(
                                                                            2
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="text-gray-600">
                                                                        Qty:{" "}
                                                                    </span>
                                                                    <span
                                                                        className={`font-medium ${
                                                                            variant.quantity ===
                                                                            0
                                                                                ? "text-red-600"
                                                                                : variant.quantity <=
                                                                                  5
                                                                                ? "text-yellow-600"
                                                                                : "text-green-600"
                                                                        }`}
                                                                    >
                                                                        {variant.quantity ||
                                                                            0}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Media Tab */}
                        {activeTab === "media" && (
                            <div className="p-4 sm:p-5">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                    {/* Images Section */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                            <ImageIcon
                                                size={18}
                                                className="text-indigo-500 mr-2"
                                            />
                                            Product Images (
                                            {hasImages
                                                ? product.product_image.length
                                                : 0}
                                            )
                                        </h3>
                                        {hasImages ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {product.product_image.map(
                                                    (img, index) => (
                                                        <div
                                                            key={index}
                                                            className="group relative cursor-pointer"
                                                            onClick={() =>
                                                                openImageModal(
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            <img
                                                                src={`${BASE_URL}${img.image_path}`}
                                                                alt={`Product image ${
                                                                    index + 1
                                                                }`}
                                                                className="w-full h-24 sm:h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-indigo-400 transition-colors"
                                                            />
                                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                                                                <Eye
                                                                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    size={16}
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                                <ImageIcon
                                                    size={40}
                                                    className="mx-auto text-gray-300 mb-3"
                                                />
                                                <p className="text-gray-500 text-sm">
                                                    No images available
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Videos Section */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                            <Video
                                                size={18}
                                                className="text-red-500 mr-2"
                                            />
                                            Product Videos (
                                            {hasVideos
                                                ? product.product_video.length
                                                : 0}
                                            )
                                        </h3>
                                        {hasVideos ? (
                                            <div className="space-y-4">
                                                {product.product_video.map(
                                                    (vid, index) => (
                                                        <div
                                                            key={index}
                                                            className="bg-gray-100 rounded-lg p-3"
                                                        >
                                                            <video
                                                                src={`${BASE_URL}${vid.video_path}`}
                                                                controls
                                                                className="w-full rounded-lg"
                                                            />
                                                            <p className="text-sm text-gray-600 mt-2 text-center">
                                                                Video{" "}
                                                                {index + 1}
                                                            </p>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                                <Video
                                                    size={40}
                                                    className="mx-auto text-gray-300 mb-3"
                                                />
                                                <p className="text-gray-500 text-sm">
                                                    No videos available
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Details Tab */}
                        {activeTab === "details" && (
                            <div className="p-4 sm:p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    {/* Product Information */}
                                    <div className="bg-white rounded-lg border p-4 sm:p-5">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                            <Info
                                                size={18}
                                                className="text-indigo-500 mr-2"
                                            />
                                            Product Information
                                        </h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between py-2 border-b">
                                                <span className="text-gray-600">
                                                    Product ID:
                                                </span>
                                                <span className="font-medium text-gray-900">
                                                    {product?.product_id}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b">
                                                <span className="text-gray-600">
                                                    Category:
                                                </span>
                                                <span className="font-medium text-gray-900">
                                                    {product?.category
                                                        ?.category_name ||
                                                        "Not specified"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b">
                                                <span className="text-gray-600">
                                                    Status:
                                                </span>
                                                <span
                                                    className={`font-medium ${getStatusStyle(
                                                        product?.product_status
                                                    )} px-2 py-1 rounded-full text-xs`}
                                                >
                                                    {getStatusLabel(
                                                        product?.product_status
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b">
                                                <span className="text-gray-600">
                                                    Condition:
                                                </span>
                                                <span
                                                    className={`font-medium ${getConditionStyle(
                                                        product?.product_condition
                                                    )} px-2 py-1 rounded-full text-xs`}
                                                >
                                                    {getConditionLabel(
                                                        product?.product_condition
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="bg-white rounded-lg border p-4 sm:p-5">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                            <Calendar
                                                size={18}
                                                className="text-indigo-500 mr-2"
                                            />
                                            Timeline
                                        </h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between py-2 border-b">
                                                <span className="text-gray-600">
                                                    Created:
                                                </span>
                                                <span className="font-medium text-gray-900">
                                                    {product?.created_at
                                                        ? formatDate(
                                                              product.created_at
                                                          )
                                                        : "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b">
                                                <span className="text-gray-600">
                                                    Last Updated:
                                                </span>
                                                <span className="font-medium text-gray-900">
                                                    {product?.updated_at
                                                        ? formatDate(
                                                              product.updated_at
                                                          )
                                                        : "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t bg-gray-50">
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                        >
                            Close Preview
                        </button>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {isImageModalOpen && hasImages && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
                    <div className="relative max-w-4xl w-full">
                        <button
                            onClick={() => setIsImageModalOpen(false)}
                            className="absolute top-4 right-4 z-10 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="relative">
                            <img
                                src={`${BASE_URL}${product.product_image[selectedImageIndex].image_path}`}
                                alt={`Product image ${selectedImageIndex + 1}`}
                                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                            />

                            {product.product_image.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="text-center text-white mt-4 text-sm">
                            Image {selectedImageIndex + 1} of{" "}
                            {product.product_image.length}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
