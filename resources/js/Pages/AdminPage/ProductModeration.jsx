import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FaSearch,
   
    FaBan,
    FaExclamationTriangle,
    FaCheck,
    FaStore,
    FaStar,
    FaStarHalfAlt,
    FaRegStar,
    FaChevronLeft,
    FaChevronRight,
    FaChartBar,
    FaCommentAlt,
    FaThumbsDown,
    FaThumbsUp,
    FaTimes,
  
    FaCalendarAlt,
    FaUser,
    FaTag,
    FaInfoCircle,
} from "react-icons/fa";
import { Sidebar } from "@/Components/AdminPage/Sidebar";
import axios from "axios";
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

const showLoadingAlert = (title, text = "") => {
    return Swal.fire({
        title,
        text,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });
};

const showConfirmationAlert = (
    title,
    text,
    confirmButtonText = "Yes",
    cancelButtonText = "Cancel"
) => {
    return Swal.fire({
        title,
        text,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText,
        cancelButtonText,
        customClass: {
            popup: "rounded-2xl",
            confirmButton: "px-4 py-2 rounded-lg font-medium",
            cancelButton: "px-4 py-2 rounded-lg font-medium",
        },
    });
};

export default function ProductModeration() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [ratingFilter, setRatingFilter] = useState("all");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [actionType, setActionType] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // NEW: Product status analysis modal states
    const [showStatusAnalysisModal, setShowStatusAnalysisModal] =
        useState(false);
    const [productAnalysis, setProductAnalysis] = useState(null);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [reviewFilter, setReviewFilter] = useState("all"); // all, positive, negative, recent
    const [selectedReview, setSelectedReview] = useState(null);
    const [showReviewDetail, setShowReviewDetail] = useState(false);

    // Pagination state from database
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [from, setFrom] = useState(0);
    const [to, setTo] = useState(0);
    // Stats state
    const [stats, setStats] = useState({
        flagged: 0,
        blocked: 0,
        lowRated: 0,
        active: 0,
    });

    const fetchProducts = async (
        page = 1,
        search = searchTerm,
        status = statusFilter,
        rating = ratingFilter
    ) => {
        setLoading(true);
        try {
            const params = {
                page,
                per_page: itemsPerPage,
                search,
                status: status !== "all" ? status : "",
                rating: rating !== "all" ? rating : "",
            };

            const response = await axios.get(route("get-all-products"), {
                params,
            });

            const data = response.data.products;

            if (data && data.data) {
                setProducts(data.data);
                setCurrentPage(data.current_page);
                setTotalPages(data.last_page);
                setTotalProducts(data.total);
                setFrom(data.from || 0);
                setTo(data.to || 0);
            } else {
                setProducts([]);
                setTotalProducts(0);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
            showAlert("error", "Error", "Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(route("get-product-stats"));

            if (response.data) {
                setStats({
                    flagged: response.data.flagged || 0,
                    blocked: response.data.blocked || 0,
                    lowRated: response.data.lowRated || 0,
                    active: response.data.active || 0,
                });
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
            showAlert("error", "Error", "Failed to load statistics");
        }
    };

    // NEW: Fetch detailed product analysis
    const fetchProductAnalysis = async (productId) => {
        setLoadingAnalysis(true);
        try {
            const response = await axios.get(
                route("admin.product-analysis", productId)
            );

            if (response.data) {
                setProductAnalysis(response.data);
            } else {
                throw new Error("No analysis data received");
            }
        } catch (error) {
            console.error("Error fetching product analysis:", error);
            showAlert("error", "Error", "Failed to load product analysis");
            setProductAnalysis(null);
        } finally {
            setLoadingAnalysis(false);
        }
    };

    // NEW: Open product status analysis modal
    const openStatusAnalysisModal = async (product) => {
        setSelectedProduct(product);
        setShowStatusAnalysisModal(true);
        await fetchProductAnalysis(product.product_id);
    };

    // NEW: Close analysis modal
    const closeStatusAnalysisModal = () => {
        setShowStatusAnalysisModal(false);
        setProductAnalysis(null);
        setSelectedProduct(null);
        setReviewFilter("all");
        setSelectedReview(null);
        setShowReviewDetail(false);
    };

    // NEW: Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // NEW: Get review sentiment icon
    const getReviewSentimentIcon = (rating) => {
        if (rating >= 4) return <FaThumbsUp className="text-green-500" />;
        if (rating >= 2.5) return <FaThumbsUp className="text-yellow-500" />;
        return <FaThumbsDown className="text-red-500" />;
    };

    // NEW: Calculate rating trend
    const calculateRatingTrend = (analysis) => {
        if (!analysis?.rating_history || analysis.rating_history.length < 2) {
            return { trend: "stable", change: 0 };
        }

        const recent =
            analysis.rating_history.slice(-1)[0]?.average_rating || 0;
        const previous =
            analysis.rating_history.slice(-2, -1)[0]?.average_rating || 0;
        const change = recent - previous;

        if (change > 0.1)
            return { trend: "improving", change: change.toFixed(1) };
        if (change < -0.1)
            return { trend: "declining", change: Math.abs(change).toFixed(1) };
        return { trend: "stable", change: change.toFixed(1) };
    };

    // NEW: Filter reviews based on selected filter
    const getFilteredReviews = () => {
        if (!productAnalysis?.reviews) return [];

        let filtered = [...productAnalysis.reviews];

        switch (reviewFilter) {
            case "positive":
                return filtered.filter((review) => review.rating >= 4);
            case "negative":
                return filtered.filter((review) => review.rating < 3);
            case "recent":
                return filtered.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
            default:
                return filtered;
        }
    };

    // NEW: Get common complaints from negative reviews
    const getCommonComplaints = () => {
        if (!productAnalysis?.reviews) return [];

        const negativeReviews = productAnalysis.reviews.filter(
            (review) => review.rating < 3
        );
        const complaints = {};

        negativeReviews.forEach((review) => {
            const text = review.comment.toLowerCase();

            if (text.includes("quality") || text.includes("poor quality")) {
                complaints.quality = (complaints.quality || 0) + 1;
            }
            if (
                text.includes("shipping") ||
                text.includes("delivery") ||
                text.includes("late")
            ) {
                complaints.shipping = (complaints.shipping || 0) + 1;
            }
            if (
                text.includes("price") ||
                text.includes("expensive") ||
                text.includes("overpriced")
            ) {
                complaints.price = (complaints.price || 0) + 1;
            }
            if (
                text.includes("size") ||
                text.includes("fit") ||
                text.includes("measurement")
            ) {
                complaints.size = (complaints.size || 0) + 1;
            }
            if (
                text.includes("description") ||
                text.includes("wrong") ||
                text.includes("different")
            ) {
                complaints.description = (complaints.description || 0) + 1;
            }
            if (
                text.includes("customer service") ||
                text.includes("support") ||
                text.includes("response")
            ) {
                complaints.service = (complaints.service || 0) + 1;
            }
        });

        return Object.entries(complaints)
            .map(([key, count]) => ({ issue: key, count }))
            .sort((a, b) => b.count - a.count);
    };

    // NEW: Get product performance summary
    const getPerformanceSummary = (analysis) => {
        if (!analysis) return null;

        const totalReviews = analysis.reviews?.length || 0;
        const negativeReviews =
            analysis.reviews?.filter((r) => r.rating < 3).length || 0;
        const positiveReviews =
            analysis.reviews?.filter((r) => r.rating >= 4).length || 0;
        const negativePercentage =
            totalReviews > 0
                ? ((negativeReviews / totalReviews) * 100).toFixed(1)
                : 0;
        const positivePercentage =
            totalReviews > 0
                ? ((positiveReviews / totalReviews) * 100).toFixed(1)
                : 0;

        return {
            totalReviews,
            negativeReviews,
            positiveReviews,
            negativePercentage,
            positivePercentage,
            averageRating: analysis.average_rating?.toFixed(1) || "N/A",
        };
    };

    useEffect(() => {
        fetchProducts();
        fetchStats();
    }, []);

    // Debounced search and filter
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProducts(1, searchTerm, statusFilter, ratingFilter);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter, ratingFilter, itemsPerPage]);

    const handleAction = async (product, action) => {
        setSelectedProduct(product);
        setActionType(action);

        // Use SweetAlert for confirmation instead of custom modal
        const actionConfig = {
            block: {
                title: "Block Product",
                text: `Are you sure you want to block the product "${product.product_name}"? This will hide it from all users and prevent future purchases.`,
                icon: "warning",
                confirmButtonColor: "#d33",
                confirmButtonText: "Yes, Block Product",
            },
            unblock: {
                title: "Unblock Product",
                text: `Are you sure you want to unblock the product "${product.product_name}"? This will make it visible to all users again.`,
                icon: "question",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "Yes, Unblock Product",
            },
        };

        const config = actionConfig[action];

        // For blocking, show a more detailed confirmation with reason input
        if (action === "block") {
            const { value: reason } = await Swal.fire({
                title: config.title,
                text: config.text,
                icon: config.icon,
                input: "textarea",
                inputLabel: "Reason for blocking (optional)",
                inputPlaceholder:
                    "Enter the reason for blocking this product...",
                inputAttributes: {
                    "aria-label": "Enter the reason for blocking this product",
                },
                showCancelButton: true,
                confirmButtonColor: config.confirmButtonColor,
                cancelButtonColor: "#6b7280",
                confirmButtonText: config.confirmButtonText,
                cancelButtonText: "Cancel",
                customClass: {
                    popup: "rounded-2xl",
                    confirmButton: "px-4 py-2 rounded-lg font-medium",
                    cancelButton: "px-4 py-2 rounded-lg font-medium",
                },
                preConfirm: (reason) => {
                    if (!reason) {
                        Swal.showValidationMessage(
                            "Please provide a reason for blocking"
                        );
                    }
                },
            });

            if (reason) {
                await performAction(product, action, reason);
            }
        } else {
            // For other actions, use standard confirmation
            const result = await showConfirmationAlert(
                config.title,
                config.text,
                config.confirmButtonText,
                "Cancel"
            );

            if (result.isConfirmed) {
                await performAction(
                    product,
                    action,
                    `Product ${action}ed by admin`
                );
            }
        }
    };

    const performAction = async (product, action, reason = "") => {
        setActionLoading(true);
        const loadingAlert = showLoadingAlert(
            `${action.charAt(0).toUpperCase() + action.slice(1)}ing Product...`,
            "Please wait while we process your request"
        );

        try {
            let endpoint;
            let method = "post";

            switch (action) {
                case "block":
                    endpoint = route(
                        "admin.products.block",
                        product.product_id
                    );
                    break;
                case "unblock":
                    endpoint = route(
                        "admin.products.unblock",
                        product.product_id
                    );
                    break;
                case "flag":
                    endpoint = route("admin.products.flag", product.product_id);
                    break;
                default:
                    console.error("Unknown action type:", action);
                    return;
            }

            console.log(`Performing ${action} on product:`, product.product_id);
            console.log(`Endpoint: ${endpoint}`);

            const response = await axios[method](endpoint, {
                reason: reason || `Product ${action}ed by admin`,
            });

            console.log("Action response:", response);

            if (response.data.success) {
                loadingAlert.close();

                // Show success message
                showAlert(
                    "success",
                    "Success!",
                    response.data.message || `Product ${action}ed successfully`
                );

                // Refresh the data
                await fetchProducts(
                    currentPage,
                    searchTerm,
                    statusFilter,
                    ratingFilter
                );
                await fetchStats();
            } else {
                loadingAlert.close();
                showAlert(
                    "error",
                    "Action Failed",
                    response.data.error || `Failed to ${action} product`
                );
            }
        } catch (error) {
            loadingAlert.close();
            console.error("Error performing action:", error);

            let errorMessage = `Failed to ${action} product`;

            if (error.response) {
                // Server responded with error status
                errorMessage =
                    error.response.data?.message ||
                    error.response.data?.error ||
                    errorMessage;
                console.error("Server error:", error.response.data);
            } else if (error.request) {
                // Request was made but no response received
                errorMessage =
                    "No response from server. Please check your connection.";
            }

            showAlert("error", "Error", errorMessage);
        } finally {
            setActionLoading(false);
            setSelectedProduct(null);
        }
    };

    // Pagination controls
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchProducts(page, searchTerm, statusFilter, ratingFilter);
        }
    };

    const renderPaginationButtons = () => {
        const buttons = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxVisiblePages / 2)
        );
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Previous button
        buttons.push(
            <button
                key="prev"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <FaChevronLeft className="w-4 h-4" />
            </button>
        );

        // First page
        if (startPage > 1) {
            buttons.push(
                <button
                    key={1}
                    onClick={() => goToPage(1)}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                    1
                </button>
            );
            if (startPage > 2) {
                buttons.push(
                    <span key="ellipsis1" className="px-2 py-2 text-gray-500">
                        ...
                    </span>
                );
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`px-3 py-2 rounded-lg border ${
                        currentPage === i
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                >
                    {i}
                </button>
            );
        }

        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                buttons.push(
                    <span key="ellipsis2" className="px-2 py-2 text-gray-500">
                        ...
                    </span>
                );
            }
            buttons.push(
                <button
                    key={totalPages}
                    onClick={() => goToPage(totalPages)}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                    {totalPages}
                </button>
            );
        }

        // Next button
        buttons.push(
            <button
                key="next"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <FaChevronRight className="w-4 h-4" />
            </button>
        );

        return buttons;
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            available: { color: "bg-green-100 text-green-800", text: "Active" },
            flagged: {
                color: "bg-yellow-100 text-yellow-800",
                text: "Flagged",
            },
            blocked: { color: "bg-red-100 text-red-800", text: "Blocked" },
            draft: { color: "bg-gray-100 text-gray-800", text: "Draft" },
        };

        const config = statusConfig[status] || statusConfig.available;
        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
            >
                {config.text}
            </span>
        );
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(
                    <FaStar key={i} className="text-yellow-400 w-3 h-3" />
                );
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(
                    <FaStarHalfAlt
                        key={i}
                        className="text-yellow-400 w-3 h-3"
                    />
                );
            } else {
                stars.push(
                    <FaRegStar key={i} className="text-yellow-400 w-3 h-3" />
                );
            }
        }

        return <div className="flex space-x-1">{stars}</div>;
    };

    const getRiskLevel = (product) => {
        const negativeReviews = product.negative_reviews_count || 0;
        const totalReviews = product.reviews_count || 1;
        const negativeRatio = negativeReviews / totalReviews;
        const averageRating = product.average_rating || 0;

        if (negativeRatio > 0.4 || averageRating < 2.0) return "high";
        if (negativeRatio > 0.2 || averageRating < 3.0) return "medium";
        return "low";
    };

    const getRiskBadge = (riskLevel) => {
        const riskConfig = {
            low: { color: "bg-green-100 text-green-800", text: "Low Risk" },
            medium: {
                color: "bg-yellow-100 text-yellow-800",
                text: "Medium Risk",
            },
            high: { color: "bg-red-100 text-red-800", text: "High Risk" },
        };

        const config = riskConfig[riskLevel] || riskConfig.low;
        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
            >
                {config.text}
            </span>
        );
    };

    if (loading && products.length === 0) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 p-4 md:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="bg-white rounded-lg shadow p-4 md:p-6"
                                    >
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
                <div className="max-w-7xl mx-auto w-full">
                    {/* Header */}
                    <div className="mb-6 mt-16 md:mt-0 md:mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            Product Moderation
                        </h1>
                        <p className="text-sm md:text-base text-gray-600">
                            Monitor and manage products, review quality issues,
                            and take necessary actions
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                        <div className="bg-white rounded-lg shadow p-4 md:p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <FaBan className="text-red-600 text-lg md:text-xl" />
                                </div>
                                <div className="ml-3 md:ml-4">
                                    <p className="text-xs md:text-sm font-medium text-gray-600">
                                        Blocked Products
                                    </p>
                                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                                        {stats.blocked}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4 md:p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <FaStar className="text-yellow-600 text-lg md:text-xl" />
                                </div>
                                <div className="ml-3 md:ml-4">
                                    <p className="text-xs md:text-sm font-medium text-gray-600">
                                        Low Rated
                                    </p>
                                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                                        {stats.lowRated}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4 md:p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FaCheck className="text-green-600 text-lg md:text-xl" />
                                </div>
                                <div className="ml-3 md:ml-4">
                                    <p className="text-xs md:text-sm font-medium text-gray-600">
                                        Active Products
                                    </p>
                                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                                        {stats.active}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white rounded-lg shadow mb-4 md:mb-6 p-3 md:p-4">
                        <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search products, sellers, or categories..."
                                        className="text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                                <select
                                    className="text-black w-full md:w-32 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                >
                                    <option value="all">All Status</option>
                                    <option value="available">Active</option>
                                    <option value="flagged">Flagged</option>
                                    <option value="blocked">Blocked</option>
                                </select>

                                <select
                                    className="text-black border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                                    value={ratingFilter}
                                    onChange={(e) =>
                                        setRatingFilter(e.target.value)
                                    }
                                >
                                    <option value="all">All Ratings</option>
                                    <option value="low">Low (&lt; 2.5)</option>
                                    <option value="medium">
                                        Medium (2.5-4)
                                    </option>
                                    <option value="high">High (&gt; 4)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {/* Table Header with Pagination Info */}
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="text-sm text-gray-700">
                                {totalProducts > 0 ? (
                                    <>
                                        Showing{" "}
                                        <span className="font-medium">
                                            {from}
                                        </span>{" "}
                                        to{" "}
                                        <span className="font-medium">
                                            {to}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-medium">
                                            {totalProducts}
                                        </span>{" "}
                                        results
                                    </>
                                ) : (
                                    "No results found"
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-700">Show:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="text-black border border-gray-300 rounded px-2 py-1 w-14 text-sm"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                                <span className="text-gray-700">per page</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                            Seller
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                            Rating & Reviews
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Risk Level
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <motion.tr
                                            key={product.product_id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0 bg-gray-200 rounded-lg flex items-center justify-center">
                                                        {product.product_image &&
                                                        product.product_image
                                                            .length > 0 ? (
                                                            <img
                                                                src={
                                                                    import.meta
                                                                        .env
                                                                        .VITE_BASE_URL +
                                                                    product
                                                                        .product_image[0]
                                                                        .image_path
                                                                }
                                                                alt={
                                                                    product.product_name
                                                                }
                                                                className="h-full w-full object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-500 text-xs">
                                                                IMG
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900 truncate max-w-[150px] md:max-w-none">
                                                            {
                                                                product.product_name
                                                            }
                                                        </div>
                                                        <div className="text-xs text-gray-500 sm:hidden">
                                                            {product.seller
                                                                ?.seller_name ||
                                                                "N/A"}
                                                        </div>
                                                        <div className="text-xs text-gray-500 md:hidden">
                                                            {product.average_rating?.toFixed(
                                                                1
                                                            ) || 0}{" "}
                                                            ★ (
                                                            {product.reviews_count ||
                                                                0}{" "}
                                                            reviews)
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                                                <div className="text-sm text-gray-900 flex items-center">
                                                    <FaStore className="mr-2 flex-shrink-0 text-gray-400" />
                                                    <span className="truncate max-w-[120px]">
                                                        {product.seller
                                                            ?.seller_name ||
                                                            "N/A"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                                                <div className="flex items-center space-x-2">
                                                    {renderStars(
                                                        product.average_rating ||
                                                            0
                                                    )}
                                                    <span className="text-sm text-gray-900">
                                                        {product.average_rating?.toFixed(
                                                            1
                                                        ) || 0}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {product.reviews_count || 0}{" "}
                                                    reviews
                                                    {product.negative_reviews_count >
                                                        0 && (
                                                        <span className="text-red-600 ml-1">
                                                            (
                                                            {
                                                                product.negative_reviews_count
                                                            }{" "}
                                                            negative)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {getRiskBadge(
                                                    getRiskLevel(product)
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                                                {getStatusBadge(
                                                    product.product_status
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-1 md:space-x-2">
                                                    <button
                                                        onClick={() =>
                                                            openStatusAnalysisModal(
                                                                product
                                                            )
                                                        }
                                                        className="text-purple-600 hover:text-purple-900 p-1"
                                                        title="View Status Analysis"
                                                    >
                                                        <FaChartBar className="w-4 h-4" />
                                                    </button>

                                                    {product.product_status !==
                                                        "blocked" && (
                                                        <button
                                                            onClick={() =>
                                                                handleAction(
                                                                    product,
                                                                    "block"
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading
                                                            }
                                                            className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Block Product"
                                                        >
                                                            <FaBan className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {product.product_status ===
                                                        "blocked" && (
                                                        <button
                                                            onClick={() =>
                                                                handleAction(
                                                                    product,
                                                                    "unblock"
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading
                                                            }
                                                            className="text-green-600 hover:text-green-900 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Unblock Product"
                                                        >
                                                            <FaCheck className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {products.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <FaSearch className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    No products found
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Try adjusting your search or filter
                                    criteria.
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalProducts > 0 && (
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="text-sm text-gray-700">
                                        Page{" "}
                                        <span className="font-medium">
                                            {currentPage}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-medium">
                                            {totalPages}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-1">
                                        {renderPaginationButtons()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Status Analysis Modal */}
            {showStatusAnalysisModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <FaChartBar className="text-purple-600" />
                                    Product Status Analysis
                                </h3>
                                <p className="text-gray-600 text-sm mt-1">
                                    Detailed review insights and performance
                                    metrics for{" "}
                                    <span className="font-semibold">
                                        {selectedProduct?.product_name}
                                    </span>
                                </p>
                            </div>
                            <button
                                onClick={closeStatusAnalysisModal}
                                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                            >
                                <FaTimes className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {loadingAnalysis ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                                    <p className="ml-4 text-gray-600">
                                        Loading analysis...
                                    </p>
                                </div>
                            ) : productAnalysis ? (
                                <div className="space-y-6">
                                    {/* Product Overview */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="flex flex-col md:flex-row items-start gap-6">
                                            <div className="flex-shrink-0">
                                                <div className="md:w-32 h-32 w-full bg-gray-200 rounded-lg flex items-center justify-center">
                                                    {selectedProduct
                                                        ?.product_image?.[0] ? (
                                                        <img
                                                            src={
                                                                import.meta.env
                                                                    .VITE_BASE_URL +
                                                                selectedProduct
                                                                    .product_image[0]
                                                                    .image_path
                                                            }
                                                            alt={
                                                                selectedProduct.product_name
                                                            }
                                                            className="h-full w-full object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-500">
                                                            No Image
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                                    <div>
                                                        <h4 className="text-xl font-bold text-gray-900">
                                                            {
                                                                selectedProduct.product_name
                                                            }
                                                        </h4>
                                                        <div className="flex flex-col md:flex-row items-center gap-4 mt-2">
                                                            <div className="flex items-center gap-2">
                                                                <FaStore className="text-gray-400" />
                                                                <span className="text-gray-700">
                                                                    {selectedProduct
                                                                        .seller
                                                                        ?.seller_name ||
                                                                        "Unknown Seller"}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <FaTag className="text-gray-400" />
                                                                <span className="text-gray-700">
                                                                    {selectedProduct
                                                                        .category
                                                                        ?.category_name ||
                                                                        "Uncategorized"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {getStatusBadge(
                                                            selectedProduct.product_status
                                                        )}
                                                        {getRiskBadge(
                                                            getRiskLevel(
                                                                selectedProduct
                                                            )
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Performance Metrics */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm text-gray-600">
                                                                    Average
                                                                    Rating
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    {renderStars(
                                                                        productAnalysis.average_rating ||
                                                                            0
                                                                    )}
                                                                    <span className="text-2xl font-bold text-gray-900">
                                                                        {(
                                                                            productAnalysis.average_rating ||
                                                                            0
                                                                        ).toFixed(
                                                                            1
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {(() => {
                                                                const trend =
                                                                    calculateRatingTrend(
                                                                        productAnalysis
                                                                    );
                                                                return (
                                                                    <div
                                                                        className={`flex items-center gap-1 ${
                                                                            trend.trend ===
                                                                            "improving"
                                                                                ? "text-green-600"
                                                                                : trend.trend ===
                                                                                  "declining"
                                                                                ? "text-red-600"
                                                                                : "text-gray-600"
                                                                        }`}
                                                                    >
                                                                        {trend.trend ===
                                                                        "improving" ? (
                                                                            <FaArrowTrendUp />
                                                                        ) : trend.trend ===
                                                                          "declining" ? (
                                                                            <FaArrowTrendDown />
                                                                        ) : null}
                                                                        <span className="text-sm">
                                                                            {trend.trend ===
                                                                            "improving"
                                                                                ? `+${trend.change}`
                                                                                : trend.trend ===
                                                                                  "declining"
                                                                                ? `-${trend.change}`
                                                                                : "Stable"}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>

                                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                        <p className="text-sm text-gray-600">
                                                            Total Reviews
                                                        </p>
                                                        <p className="text-2xl font-bold text-gray-900 mt-1">
                                                            {productAnalysis
                                                                .reviews
                                                                ?.length || 0}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2 text-sm">
                                                            <span className="text-green-600 flex items-center gap-1">
                                                                <FaThumbsUp />{" "}
                                                                {productAnalysis.reviews?.filter(
                                                                    (r) =>
                                                                        r.rating >=
                                                                        4
                                                                ).length ||
                                                                    0}{" "}
                                                                positive
                                                            </span>
                                                            <span className="text-red-600 flex items-center gap-1">
                                                                <FaThumbsDown />{" "}
                                                                {productAnalysis.reviews?.filter(
                                                                    (r) =>
                                                                        r.rating <
                                                                        3
                                                                ).length ||
                                                                    0}{" "}
                                                                negative
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                        <p className="text-sm text-gray-600">
                                                            Recent Activity
                                                        </p>
                                                        <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1">
                                                            {productAnalysis
                                                                .recent_reviews
                                                                ?.length ||
                                                                0}{" "}
                                                            in last 30 days
                                                        </p>
                                                        <p className="text-xs md:text-sm text-gray-500 mt-2">
                                                            Last review:{" "}
                                                            {productAnalysis
                                                                .reviews?.[0]
                                                                ? formatDate(
                                                                      productAnalysis
                                                                          .reviews[0]
                                                                          .created_at
                                                                  )
                                                                : "No reviews"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Common Issues & Insights */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Common Complaints */}
                                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                                            <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <FaExclamationTriangle className="text-red-500" />
                                                Common Complaints
                                            </h5>
                                            <div className="space-y-3">
                                                {(() => {
                                                    const complaints =
                                                        getCommonComplaints();
                                                    return complaints.length >
                                                        0 ? (
                                                        complaints.map(
                                                            (
                                                                complaint,
                                                                index
                                                            ) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                                                                >
                                                                    <span className="font-medium text-gray-700 capitalize">
                                                                        {
                                                                            complaint.issue
                                                                        }
                                                                    </span>
                                                                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                                                        {
                                                                            complaint.count
                                                                        }{" "}
                                                                        reports
                                                                    </span>
                                                                </div>
                                                            )
                                                        )
                                                    ) : (
                                                        <p className="text-gray-500 text-center py-4">
                                                            No common complaints
                                                            identified
                                                        </p>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        {/* Performance Summary */}
                                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                                            <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <FaChartBar className="text-blue-500" />
                                                Performance Summary
                                            </h5>
                                            <div className="space-y-4">
                                                {(() => {
                                                    const summary =
                                                        getPerformanceSummary(
                                                            productAnalysis
                                                        );
                                                    return summary ? (
                                                        <>
                                                            <div>
                                                                <p className="text-sm text-gray-600">
                                                                    Overall
                                                                    Rating
                                                                    Distribution
                                                                </p>
                                                                <div className="mt-2 space-y-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm text-gray-700">
                                                                            Positive
                                                                            (4-5
                                                                            stars)
                                                                        </span>
                                                                        <span className="font-medium">
                                                                            {
                                                                                summary.positivePercentage
                                                                            }
                                                                            %
                                                                        </span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                                        <div
                                                                            className="bg-green-500 h-2 rounded-full"
                                                                            style={{
                                                                                width: `${summary.positivePercentage}%`,
                                                                            }}
                                                                        ></div>
                                                                    </div>
                                                                </div>

                                                                <div className="mt-3 space-y-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm text-gray-700">
                                                                            Negative
                                                                            (1-2
                                                                            stars)
                                                                        </span>
                                                                        <span className="font-medium">
                                                                            {
                                                                                summary.negativePercentage
                                                                            }
                                                                            %
                                                                        </span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                                        <div
                                                                            className="bg-red-500 h-2 rounded-full"
                                                                            style={{
                                                                                width: `${summary.negativePercentage}%`,
                                                                            }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <p className="text-gray-500 text-center py-4">
                                                            No performance data
                                                            available
                                                        </p>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reviews Section */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                            <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                                                <FaCommentAlt className="text-indigo-500" />
                                                Customer Reviews
                                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
                                                    {productAnalysis.reviews
                                                        ?.length || 0}{" "}
                                                    total
                                                </span>
                                            </h5>

                                            {/* Review Filters */}
                                            <div className="flex flex-wrap md:flex-row gap-2">
                                                <button
                                                    onClick={() =>
                                                        setReviewFilter("all")
                                                    }
                                                    className={`px-3 py-1 rounded-lg text-sm ${
                                                        reviewFilter === "all"
                                                            ? "bg-indigo-100 text-indigo-700"
                                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    }`}
                                                >
                                                    All
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setReviewFilter(
                                                            "positive"
                                                        )
                                                    }
                                                    className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${
                                                        reviewFilter ===
                                                        "positive"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    }`}
                                                >
                                                    <FaThumbsUp className="w-3 h-3" />{" "}
                                                    Positive
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setReviewFilter(
                                                            "negative"
                                                        )
                                                    }
                                                    className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${
                                                        reviewFilter ===
                                                        "negative"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    }`}
                                                >
                                                    <FaThumbsDown className="w-3 h-3" />{" "}
                                                    Negative
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setReviewFilter(
                                                            "recent"
                                                        )
                                                    }
                                                    className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${
                                                        reviewFilter ===
                                                        "recent"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    }`}
                                                >
                                                    <FaCalendarAlt className="w-3 h-3" />{" "}
                                                    Recent
                                                </button>
                                            </div>
                                        </div>

                                        {/* Reviews List */}
                                        <div className="space-y-4 max-h-96 overflow-y-auto">
                                            {(() => {
                                                const filteredReviews =
                                                    getFilteredReviews();
                                                return filteredReviews.length >
                                                    0 ? (
                                                    filteredReviews.map(
                                                        (review) => (
                                                            <div
                                                                key={
                                                                    review.review_id ||
                                                                    review.id
                                                                }
                                                                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                                                onClick={() => {
                                                                    setSelectedReview(
                                                                        review
                                                                    );
                                                                    setShowReviewDetail(
                                                                        true
                                                                    );
                                                                }}
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="flex items-center">
                                                                                {renderStars(
                                                                                    review.rating
                                                                                )}
                                                                            </div>
                                                                            <span className="font-medium text-gray-900">
                                                                                {review.rating.toFixed(
                                                                                    1
                                                                                )}
                                                                            </span>
                                                                            {getReviewSentimentIcon(
                                                                                review.rating
                                                                            )}
                                                                        </div>
                                                                        <p className="text-sm text-gray-500 mt-1">
                                                                            By{" "}
                                                                            {review
                                                                                .user
                                                                                ?.name ||
                                                                                "Anonymous"}{" "}
                                                                            •{" "}
                                                                            {formatDate(
                                                                                review.created_at
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <div
                                                                        className={`px-2 py-1 rounded-full text-xs ${
                                                                            review.rating >=
                                                                            4
                                                                                ? "bg-green-100 text-green-800"
                                                                                : review.rating >=
                                                                                  2.5
                                                                                ? "bg-yellow-100 text-yellow-800"
                                                                                : "bg-red-100 text-red-800"
                                                                        }`}
                                                                    >
                                                                        {review.rating >=
                                                                        4
                                                                            ? "Positive"
                                                                            : review.rating >=
                                                                              2.5
                                                                            ? "Neutral"
                                                                            : "Negative"}
                                                                    </div>
                                                                </div>
                                                                <p className="text-gray-700 line-clamp-2">
                                                                    {
                                                                        review.comment
                                                                    }
                                                                </p>
                                                                {review.images
                                                                    ?.length >
                                                                    0 && (
                                                                    <div className="flex gap-2 mt-3">
                                                                        {review.images
                                                                            .slice(
                                                                                0,
                                                                                3
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    img,
                                                                                    idx
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            idx
                                                                                        }
                                                                                        className="w-16 h-16 bg-gray-200 rounded"
                                                                                    >
                                                                                        <img
                                                                                            src={
                                                                                                import.meta
                                                                                                    .env
                                                                                                    .VITE_BASE_URL +
                                                                                                img.image_path
                                                                                            }
                                                                                            alt="Review"
                                                                                            className="w-full h-full object-cover rounded"
                                                                                        />
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    )
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <FaCommentAlt className="mx-auto text-gray-400 text-3xl mb-3" />
                                                        <p className="text-gray-500">
                                                            No reviews found
                                                            with current filter
                                                        </p>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Recommendations Section */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                        <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <FaInfoCircle className="text-blue-500" />
                                            Recommendations & Actions
                                        </h5>
                                        <div className="space-y-3">
                                            {(() => {
                                                const summary =
                                                    getPerformanceSummary(
                                                        productAnalysis
                                                    );
                                                const recommendations = [];

                                                if (
                                                    summary?.negativePercentage >
                                                    30
                                                ) {
                                                    recommendations.push({
                                                        type: "critical",
                                                        text: "High percentage of negative reviews. Consider contacting seller for improvement plan.",
                                                        action: "Require Seller Action",
                                                    });
                                                }

                                                if (
                                                    productAnalysis.average_rating <
                                                    2.5
                                                ) {
                                                    recommendations.push({
                                                        type: "warning",
                                                        text: "Low average rating affecting product visibility.",
                                                        action: "Consider Temporary Suspension",
                                                    });
                                                }

                                                if (
                                                    productAnalysis.recent_reviews?.some(
                                                        (r) => r.rating < 2
                                                    )
                                                ) {
                                                    recommendations.push({
                                                        type: "warning",
                                                        text: "Recent negative reviews detected. Monitor closely.",
                                                        action: "Flag for Monitoring",
                                                    });
                                                }

                                                if (
                                                    recommendations.length === 0
                                                ) {
                                                    recommendations.push({
                                                        type: "success",
                                                        text: "Product performance is within acceptable parameters.",
                                                        action: "Continue Monitoring",
                                                    });
                                                }

                                                return recommendations.map(
                                                    (rec, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`p-4 rounded-lg ${
                                                                rec.type ===
                                                                "critical"
                                                                    ? "bg-red-50 border border-red-200"
                                                                    : rec.type ===
                                                                      "warning"
                                                                    ? "bg-yellow-50 border border-yellow-200"
                                                                    : "bg-green-50 border border-green-200"
                                                            }`}
                                                        >
                                                            <div className="flex flex-col md:flex-row justify-between items-center">
                                                                <p
                                                                    className={`font-medium ${
                                                                        rec.type ===
                                                                        "critical"
                                                                            ? "text-red-800"
                                                                            : rec.type ===
                                                                              "warning"
                                                                            ? "text-yellow-800"
                                                                            : "text-green-800"
                                                                    }`}
                                                                >
                                                                    {rec.text}
                                                                </p>
                                                                <div
                                                                    className={`px-4 py-2 mt-3 md:mt-0 rounded-lg text-sm font-medium ${
                                                                        rec.type ===
                                                                        "critical"
                                                                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                                                                            : rec.type ===
                                                                              "warning"
                                                                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                                                            : "bg-green-100 text-green-700 hover:bg-green-200"
                                                                    }`}
                                                                >
                                                                    {rec.action}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Modal Footer */}
                                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={closeStatusAnalysisModal}
                                            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleAction(
                                                    selectedProduct,
                                                    "block"
                                                );
                                                closeStatusAnalysisModal();
                                            }}
                                            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                        >
                                            Block Product
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FaExclamationTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">
                                        Unable to load product analysis.
                                    </p>
                                    <button
                                        onClick={() =>
                                            fetchProductAnalysis(
                                                selectedProduct?.product_id
                                            )
                                        }
                                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Review Detail Modal */}
            {showReviewDetail && selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                            <h4 className="text-xl font-bold text-gray-800">
                                Review Details
                            </h4>
                            <button
                                onClick={() => {
                                    setShowReviewDetail(false);
                                    setSelectedReview(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                        {selectedReview.user?.profile_image ? (
                                            <img
                                                src={
                                                    import.meta.env
                                                        .VITE_BASE_URL +
                                                    selectedReview.user
                                                        .profile_image
                                                }
                                                alt="User Avatar"
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        ) : (
                                            <FaUser className="text-gray-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {selectedReview.user?.name ||
                                                "Anonymous User"}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(
                                                selectedReview.created_at
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {renderStars(selectedReview.rating)}
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            selectedReview.rating >= 4
                                                ? "bg-green-100 text-green-800"
                                                : selectedReview.rating >= 2.5
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {selectedReview.rating.toFixed(1)} stars
                                    </span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h5 className="font-medium text-gray-700 mb-2">
                                    Review Content
                                </h5>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-800">
                                        {selectedReview.comment}
                                    </p>
                                </div>
                            </div>

                            {selectedReview.images &&
                                selectedReview.images.length > 0 && (
                                    <div className="mb-6">
                                        <h5 className="font-medium text-gray-700 mb-3">
                                            Review Images
                                        </h5>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {selectedReview.images.map(
                                                (img, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-gray-200 rounded-lg overflow-hidden"
                                                    >
                                                        <img
                                                            src={
                                                                import.meta.env
                                                                    .VITE_BASE_URL +
                                                                img.image_path
                                                            }
                                                            alt={`Review image ${
                                                                idx + 1
                                                            }`}
                                                            className="w-full h-32 object-cover hover:scale-105 transition-transform"
                                                        />
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                            {selectedReview.seller_response && (
                                <div className="mb-6">
                                    <h5 className="font-medium text-gray-700 mb-2">
                                        Seller Response
                                    </h5>
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaStore className="text-blue-500" />
                                            <span className="font-medium text-blue-700">
                                                Seller's Response
                                            </span>
                                        </div>
                                        <p className="text-gray-800">
                                            {selectedReview.seller_response}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Responded on{" "}
                                            {selectedReview.response_date
                                                ? formatDate(
                                                      selectedReview.response_date
                                                  )
                                                : "Unknown date"}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setShowReviewDetail(false);
                                        setSelectedReview(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Close
                                </button>
                                {selectedReview.rating < 3 && (
                                    <button
                                        onClick={() => {
                                            // Add to flagged reviews or take action
                                            alert(
                                                "This review has been flagged for attention."
                                            );
                                            setShowReviewDetail(false);
                                            setSelectedReview(null);
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        Flag Review
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
