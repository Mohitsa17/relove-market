import {
    ShoppingCart,
    Heart,
    Star,
    Check,
    Shield,
    Minus,
    Plus,
    RotateCcw,
    ChevronRight,
    ArrowLeft,
    Loader2,
    AlertCircle,
    CheckCircle,
    Play,
    Pause,
    Volume2,
    VolumeX,
    DollarSign,
} from "lucide-react";

import { Link, router, usePage } from "@inertiajs/react";

import { useEffect, useCallback, useState, useRef } from "react";

import axios from "axios";

import Swal from "sweetalert2";

import { Navbar } from "@/Components/BuyerPage/Navbar";
import { Footer } from "@/Components/BuyerPage/Footer";

import { MobileVariantsPanel } from "@/Components/BuyerPage/ProductDetails/MobileVariantsPanel";
import { ShowReviewModal } from "@/Components/BuyerPage/ProductDetails/ShowReviewModal";
import { ShowZoomModal } from "@/Components/BuyerPage/ProductDetails/ShowZoomModal";
import { ShowConversationModal } from "@/Components/BuyerPage/ProductDetails/ShowConversationModal";
import { ShowAllReviewsModal } from "@/Components/BuyerPage/ProductDetails/ShowAllReviewsModal";
import { ProductCarousel } from "@/Components/BuyerPage/ProductDetails/ProductCarousel";

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

export default function ProductDetails({ product_info }) {
    const [selectedImage, setSelectedImage] = useState(
        product_info[0]?.product_image[0]?.image_path || ""
    );
    const [activeTab, setActiveTab] = useState("description");
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [showZoomModal, setShowZoomModal] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [showConversationModal, setShowConversationModal] = useState(false);
    const [initialMessage, setInitialMessage] = useState("");
    const [isStartingConversation, setIsStartingConversation] = useState(false);
    const [loadingStates, setLoadingStates] = useState({
        addToCart: false,
        wishlist: false,
        buyNow: false,
    });
    const [variantError, setVariantError] = useState("");
    const [actionSuccess, setActionSuccess] = useState({
        addToCart: false,
        wishlist: false,
    });

    // NEW: Address validation state
    const [hasValidAddress, setHasValidAddress] = useState(true);
    const [isCheckingAddress, setIsCheckingAddress] = useState(false);

    // Video states
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(true);
    const videoRef = useRef(null);

    // Review and comment states
    const [reviewFilter, setReviewFilter] = useState("all");
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
    const [newReview, setNewReview] = useState({
        rating: 0,
        comment: "",
        images: [],
    });

    // Mobile specific states
    const [showMobileVariants, setShowMobileVariants] = useState(false);

    // Reviews pagination and loading states
    const [allReviews, setAllReviews] = useState([]);
    const [currentReviewsPage, setCurrentReviewsPage] = useState(1);
    const [hasMoreReviews, setHasMoreReviews] = useState(true);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);

    const [reviews, setReviews] = useState(() => {
        const initialReviews = product_info[0]?.ratings || [];
        return initialReviews;
    });

    const [showPageContent, setShowPageContent] = useState(false);

    const { auth } = usePage().props;

    const reviewCount = reviews.length;
    const hasVariants = product_info[0]?.product_variant?.length > 0;
    const variants = product_info[0]?.product_variant || [];
    const averageRating =
        reviews.length > 0
            ? reviews.reduce((acc, review) => acc + (review.rating || 0), 0) /
              reviews.length
            : 0;

    // Check if product has videos
    const hasVideos = product_info[0]?.product_video?.length > 0;
    const videos = product_info[0]?.product_video || [];

    // function to check if user has a valid address
    const checkUserAddress = useCallback(async () => {
        if (!auth.user) {
            setHasValidAddress(false);
            return false;
        }

        setIsCheckingAddress(true);
        try {
            const response = await axios.get(route("check-address"));
            const hasAddress = response.data.hasValidAddress;
            setHasValidAddress(hasAddress);
            return hasAddress;
        } catch (error) {
            console.error("Error checking user address:", error);
            setHasValidAddress(false);
            return false;
        } finally {
            setIsCheckingAddress(false);
        }
    }, [auth.user]);

    const showImmediateAddressAlert = useCallback(async () => {
        if (!auth.user) {
            setShowPageContent(true);
            return;
        }

        // Check if user has valid address
        const hasAddress = await checkUserAddress();

        if (!hasAddress) {
            // Show SweetAlert immediately
            Swal.fire({
                title: "📍 Setup Your Shipping Address",
                html: `
                <div class="text-left">
                    <p class="mb-4 text-gray-700">Before you start shopping, please set up your shipping address to enable purchases.</p>
                    <p class="text-sm text-gray-600">You can update this anytime in your profile settings.</p>
                </div>
            `,
                icon: "info",
                showCancelButton: true,
                confirmButtonText: "📝 Setup Address Now",
                cancelButtonText: "✕ I'll Do It Later",
                confirmButtonColor: "#3B82F6",
                cancelButtonColor: "#6B7280",
                allowOutsideClick: false,
                allowEscapeKey: true,
                customClass: {
                    popup: "rounded-2xl",
                    confirmButton: "px-6 py-3 rounded-lg font-semibold",
                    cancelButton: "px-6 py-3 rounded-lg font-semibold",
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    // Redirect to profile page with address tab focused
                    router.visit(route("profile"), {
                        data: {
                            focus: "address",
                            redirect_back: window.location.href,
                        },
                    });
                } else {
                    // User chose "I'll Do It Later" - show the page content
                    setShowPageContent(true);
                    // Show a smaller reminder
                    Swal.fire({
                        title: "Reminder",
                        text: "You can update your address anytime in your profile to enable purchases.",
                        icon: "info",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#3B82F6",
                        timer: 3000,
                        showConfirmButton: true,
                    });
                }
            });
        } else {
            // User has address, show page content immediately
            setShowPageContent(true);
        }
    }, [auth.user, checkUserAddress, router]);

    // NEW: Enhanced function to handle address update prompt with SweetAlert
    const promptAddressUpdate = (actionType = "purchase") => {
        const actionText =
            actionType === "purchase" ? "making a purchase" : "checking out";

        Swal.fire({
            title: "📍 Shipping Address Required",
            html: `
            <div class="text-left">
                <p class="mb-4 text-gray-700">Please update your shipping address to complete your ${actionText}.</p>
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div class="flex items-start gap-3">
                        <div class="flex-shrink-0">
                            <svg class="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                        <div>
                            <p class="text-yellow-800 font-medium text-sm">Why we need your address?</p>
                            <ul class="text-yellow-700 text-xs mt-1 space-y-1">
                                <li>• Calculate accurate shipping costs</li>
                                <li>• Ensure timely delivery</li>
                                <li>• Provide order tracking</li>
                                <li>• Process returns if needed</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "📝 Update Address Now",
            cancelButtonText: "✕ Maybe Later",
            confirmButtonColor: "#3B82F6",
            cancelButtonColor: "#6B7280",
            allowOutsideClick: false,
            allowEscapeKey: true,
            customClass: {
                popup: "rounded-2xl",
                confirmButton: "px-6 py-3 rounded-lg font-semibold",
                cancelButton: "px-6 py-3 rounded-lg font-semibold",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                // Redirect to profile page with address tab focused
                router.visit(route("profile"), {
                    data: {
                        focus: "address",
                        redirect_back: window.location.href, // Return here after updating address
                    },
                });
            } else {
                // User chose "Maybe Later" - show informative message
                Swal.fire({
                    title: "No Problem!",
                    text: `You can update your address anytime in your profile. You'll need it before ${actionText}.`,
                    icon: "info",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#3B82F6",
                    timer: 3000,
                    showConfirmButton: true,
                });
            }
        });
    };

    // Video controls
    const toggleVideoPlay = () => {
        if (videoRef.current) {
            if (isVideoPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsVideoPlaying(!isVideoPlaying);
        }
    };

    const toggleVideoMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isVideoMuted;
            setIsVideoMuted(!isVideoMuted);
        }
    };

    const handleVideoSelect = (video) => {
        setSelectedVideo(video);
        setIsVideoPlaying(true);
        // Auto-play when video is selected
        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.play().catch(console.error);
            }
        }, 100);
    };

    const increaseQty = () => setQuantity((prev) => prev + 1);
    const decreaseQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    // Get available stock for selected variant or product
    const availableStock = selectedVariant
        ? selectedVariant.quantity
        : product_info[0]?.product_quantity || 0;

    // Validate variant before action
    const validateVariant = (action) => {
        if (hasVariants && !selectedVariant) {
            setVariantError(`Please select a variant before ${action}`);

            // Auto-hide error after 5 seconds
            setTimeout(() => {
                setVariantError("");
            }, 5000);

            return false;
        }
        setVariantError("");
        return true;
    };

    // Filter reviews based on rating
    const filteredReviews =
        reviewFilter === "all"
            ? reviews.slice(0, 3)
            : reviews
                  .filter((review) => review.rating === parseInt(reviewFilter))
                  .slice(0, 3);

    // Check if user has liked the product
    const checkWishlistStatus = useCallback(async () => {
        try {
            const response = await axios.get(
                route("get-wishlist", product_info[0]?.product_id)
            );

            setIsWishlisted(response.data.is_wishlisted);
        } catch (error) {
            console.error("Error checking wishlist status:", error);
        }
    }, [product_info[0]?.product_id]);

    // Load all reviews for modal with pagination
    const loadAllReviews = useCallback(
        async (page = 1) => {
            if (isLoadingReviews) return;

            setIsLoadingReviews(true);
            try {
                const response = await axios.get(
                    `/api/product/${product_info[0]?.product_id}/reviews`,
                    {
                        params: { page, per_page: 10 },
                    }
                );

                const newReviews = response.data.reviews || [];

                if (page === 1) {
                    setAllReviews(newReviews);
                } else {
                    setAllReviews((prev) => [...prev, ...newReviews]);
                }

                setHasMoreReviews(
                    response.data.hasMore ||
                        response.data.next_page_url !== null
                );
                setCurrentReviewsPage(page);
            } catch (error) {
                console.error("Error loading reviews:", error);
                if (page === 1) {
                    setAllReviews(reviews);
                }
            } finally {
                setIsLoadingReviews(false);
            }
        },
        [product_info[0]?.product_id, isLoadingReviews, reviews]
    );

    // Load more reviews for infinite scroll
    const loadMoreReviews = useCallback(() => {
        if (hasMoreReviews && !isLoadingReviews) {
            loadAllReviews(currentReviewsPage + 1);
        }
    }, [hasMoreReviews, isLoadingReviews, currentReviewsPage, loadAllReviews]);

    // Variant selection handler
    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);

        // Clear error when user selects a variant
        if (variantError) {
            setVariantError("");
        }
    };

    // Get variant combination text
    const getVariantCombinationText = (variant) => {
        if (
            !variant.variant_key ||
            Object.keys(variant.variant_key).length === 0
        ) {
            return "Standard";
        }

        return variant.variant_key;
    };

    // Prepare selected variant data
    const prepareSelectedVariantData = () => {
        return {
            variant_id: selectedVariant?.variant_id || null,
            variant_key: selectedVariant?.variant_key || "default",
            combination: selectedVariant?.variant_combination || {},
            quantity:
                selectedVariant?.quantity || product_info[0]?.product_quantity,
            price: selectedVariant?.price || product_info[0]?.product_price,
        };
    };

    // NEW FUNCTION: Prepare checkout data in same structure as wishlist
    const prepareCheckoutData = () => {
        const variantData = prepareSelectedVariantData();

        // Create the same data structure as wishlist items
        const checkoutItem = {
            user: {
                user_id: auth.user.user_id,
            },
            product_id: product_info[0].product_id,
            selected_quantity: quantity,
            selected_variant: JSON.stringify(variantData),
            product: {
                product_id: product_info[0].product_id,
                product_name: product_info[0].product_name,
                product_price: parseFloat(product_info[0].product_price),
                product_quantity: product_info[0].product_quantity,
                product_image: product_info[0].product_image[0] || {},
                seller_id: product_info[0].seller_id,
            },
        };

        return [checkoutItem]; // Return as array to match wishlist structure
    };

    // UPDATED: Enhanced Handle Buy Now - with comprehensive validation using SweetAlert
    const handleBuyNow = async () => {
        // Check if user is authenticated
        if (!auth.user) {
            showAlert(
                "warning",
                "🔐 Login Required",
                "Please login to continue with your purchase",
                "Login Now"
            ).then((result) => {
                if (result.isConfirmed) {
                    const currentUrl = window.location.href;
                    router.visit(route("login"), {
                        data: { redirect: currentUrl },
                    });
                }
            });
            return;
        }

        // Check if product is in stock
        if (availableStock === 0) {
            showAlert(
                "error",
                "Out of Stock",
                "This product is currently out of stock. Please check back later.",
                "OK"
            );
            return;
        }

        // Validate variant selection for products with variants
        if (hasVariants && !selectedVariant) {
            showAlert(
                "warning",
                "Variant Selection Required",
                "Please select a product variant before proceeding with your purchase.",
                "Select Variant"
            );
            return;
        }

        // NEW: Check if user has valid address with loading state
        const hasAddress = await checkUserAddress();

        if (!hasAddress) {
            promptAddressUpdate("purchase");
            return;
        }

        // Show loading state for buy now
        setLoadingStates((prev) => ({ ...prev, buyNow: true }));

        try {
            const checkoutData = prepareCheckoutData();

            // Show processing alert
            const loadingAlert = showLoadingAlert(
                "Processing Your Order...",
                "Please wait while we prepare your purchase"
            );

            // Proceed with checkout
            router.post(route("checkout-process"), {
                items: checkoutData,
                onSuccess: () => {
                    loadingAlert.close();
                },
                onError: (errors) => {
                    loadingAlert.close();
                    console.error("Error during buy now:", errors);

                    let errorMessage =
                        "Something went wrong. Please try again.";

                    // Handle specific error cases
                    if (errors.items) {
                        errorMessage = errors.items;
                    } else if (errors.product_id) {
                        errorMessage =
                            "Product validation failed. Please refresh the page and try again.";
                    } else if (errors.quantity) {
                        errorMessage =
                            "Invalid quantity selected. Please adjust the quantity and try again.";
                    }

                    showAlert("error", "Checkout Error", errorMessage, "OK");
                },
            });
        } catch (error) {
            console.error("Error during buy now:", error);
            showAlert(
                "error",
                "Unexpected Error",
                "An unexpected error occurred. Please try again later.",
                "OK"
            );
        } finally {
            setLoadingStates((prev) => ({ ...prev, buyNow: false }));
        }
    };

    // Review and comment handlers
    const handleAddReview = async (e) => {
        e.preventDefault();
        if (newReview.rating === 0 || !newReview.comment.trim()) return;

        try {
            const payload = {
                product_id: product_info[0].product_id,
                rating: newReview.rating,
                comment: newReview.comment,
            };

            const response = await axios.post(route("make-review"), payload);
            const newReviewData = response.data.review;

            // Transform the API response to match your frontend structure
            const transformedReview = {
                id: newReviewData.id,
                rating: newReviewData.rating,
                comment: newReviewData.comment,
                user: {
                    profile_image: auth.user.profile_image || null,
                    name: "You",
                },
                date: new Date(newReviewData.created_at)
                    .toISOString()
                    .split("T")[0],
                created_at: newReviewData.created_at,
                user_id: newReviewData.user_id,
            };

            // Update both reviews states immediately
            setReviews((prev) => [transformedReview, ...prev]);
            setAllReviews((prev) => [transformedReview, ...prev]);

            // Clear the form
            setNewReview({
                rating: 0,
                comment: "",
                images: [],
            });

            setShowReviewModal(false);

            showAlert(
                "success",
                "Success",
                "Review submitted successfully!",
                "OK"
            );
        } catch (error) {
            console.error("Error submitting review:", error);
            showAlert(
                "error",
                "Error",
                "Something error! Please try again later...",
                "OK"
            );
        }
    };

    // Handle Add to Cart
    const handleAddToCart = async () => {
        if (!auth.user) {
            showAlert(
                "warning",
                "Login Required",
                "Please login to add items to your cart",
                "Login Now"
            ).then((result) => {
                if (result.isConfirmed) {
                    const currentUrl = window.location.href;
                    console.log("Redirecting to login...");
                    router.visit(route("login"), {
                        data: { redirect: currentUrl },
                    });
                }
            });
            return;
        }

        if (!validateVariant("adding to cart")) {
            return;
        }

        setLoadingStates((prev) => ({ ...prev, addToCart: true }));
        setActionSuccess((prev) => ({ ...prev, addToCart: false }));

        try {
            const cartData = prepareCheckoutData();
            const cartItem = cartData[0]; // Get single item

            const response = await axios.post(route("store-wishlist"), {
                product_id: cartItem.product_id,
                quantity: cartItem.selected_quantity,
                selected_variant: cartItem.selected_variant,
            });

            if (response.data.successMessage) {
                // Show success SweetAlert
                showAlert(
                    "success",
                    "Success!",
                    "Item has been added to your cart",
                    "OK"
                );

                // Show success state
                setActionSuccess((prev) => ({ ...prev, addToCart: true }));

                // Reset success state after 2 seconds
                setTimeout(() => {
                    setActionSuccess((prev) => ({ ...prev, addToCart: false }));
                }, 2000);
            } else {
                console.error("Failed to add to cart:", response.data);
                // Show error SweetAlert
                showAlert(
                    "error",
                    "Error!",
                    "Failed to add item to cart. Please try again.",
                    "OK"
                );
            }
        } catch (error) {
            console.error("Error adding to cart:", error);

            // Show error SweetAlert
            showAlert(
                "error",
                "Error!",
                "An error occurred while adding item to cart. Please try again.",
                "OK"
            );
        } finally {
            setLoadingStates((prev) => ({ ...prev, addToCart: false }));
        }
    };

    // UPDATED: Handle Wishlist Toggle - Send data in same structure
    const handleWishlistToggle = async (product_id) => {
        // Check if user is authenticated
        if (!auth.user) {
            showAlert(
                "warning",
                "Login Required",
                "Please login to add items to your wishlist",
                "Login Now"
            ).then((result) => {
                if (result.isConfirmed) {
                    router.visit(route("login"));
                }
            });
            return;
        }

        if (product_info[0].product_quantity <= 0) {
            showAlert(
                "warning",
                "Product Out of Stock",
                "Items not available currently",
                "OK"
            );
            return;
        }

        if (!validateVariant("adding to wishlist")) {
            return;
        }

        setLoadingStates((prev) => ({ ...prev, wishlist: true }));
        setActionSuccess((prev) => ({ ...prev, wishlist: false }));

        try {
            if (isWishlisted) {
                await axios.delete(route("remove-wishlist"), {
                    data: { product_id: [product_id] },
                });
                setIsWishlisted(false);

                // Show success state for removal
                setActionSuccess((prev) => ({ ...prev, wishlist: true }));
            } else {
                const variantData = prepareSelectedVariantData();

                const response = await axios.post(route("store-wishlist"), {
                    product_id: product_id,
                    selected_variant: variantData,
                    selected_quantity: quantity,
                });

                console.log("Wishlist added:", response);
                setIsWishlisted(true);

                // Show success state for addition
                setActionSuccess((prev) => ({ ...prev, wishlist: true }));
            }

            // Reset success state after 2 seconds
            setTimeout(() => {
                setActionSuccess((prev) => ({ ...prev, wishlist: false }));
            }, 2000);
        } catch (error) {
            console.error("Error updating wishlist:", error);
            showAlert(
                "error",
                "Error",
                "Failed to update wishlist. Please try again.",
                "OK"
            );
        } finally {
            setLoadingStates((prev) => ({ ...prev, wishlist: false }));
        }
    };

    // Handle showing all reviews modal
    const handleShowAllReviews = () => {
        setShowAllReviewsModal(true);
        if (allReviews.length === 0) {
            loadAllReviews(1);
        }
    };

    // UPDATED: Improved startConversation function
    const startConversation = async (e) => {
        e.preventDefault();

        // Prevent multiple submissions
        if (isStartingConversation) {
            console.log("Already starting conversation, ignoring click");
            return;
        }

        if (!initialMessage.trim()) {
            showAlert(
                "warning",
                "Message Required",
                "Please enter a message to start the conversation.",
                "OK"
            );
            return;
        }

        // Check authentication
        if (!auth.user) {
            showAlert(
                "warning",
                "Login Required",
                "Please login to chat with the seller",
                "Login Now"
            ).then((result) => {
                if (result.isConfirmed) {
                    router.visit(route("login"));
                }
            });
            return;
        }

        // Check if user is trying to chat with themselves
        if (auth.user.user_id === product_info[0]?.seller?.user_id) {
            showAlert(
                "info",
                "Own Product",
                "This is your own product listing.",
                "OK"
            );
            return;
        }

        setIsStartingConversation(true);
        console.log("Starting conversation with seller:", {
            seller_id: product_info[0]?.seller_id,
            product_id: product_info[0]?.product_id,
            message_length: initialMessage.length,
        });

        try {
            const response = await axios.post(
                "/start-conversation",
                {
                    seller_id: product_info[0]?.seller_id,
                    product_id: product_info[0]?.product_id,
                    message: initialMessage,
                },
                {
                    timeout: 10000, // 10 second timeout
                    headers: {
                        "X-CSRF-TOKEN": document.querySelector(
                            'meta[name="csrf-token"]'
                        )?.content,
                    },
                }
            );

            console.log("Conversation response:", response.data);

            // Show success and redirect
            showAlert(
                "success",
                "Conversation Started",
                "Redirecting to chat...",
                "OK"
            ).then(() => {
                setShowConversationModal(false);
                setInitialMessage("");
                // Redirect to chat page
                router.visit(route("buyer-chat"));
            });
        } catch (error) {
            console.error("Conversation error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config,
            });

            let errorMessage =
                "Failed to start conversation. Please try again.";

            if (error.response?.status === 401) {
                errorMessage = "Your session has expired. Please login again.";
            } else if (error.response?.status === 404) {
                errorMessage = "Seller not found.";
            } else if (error.response?.status === 422) {
                errorMessage = error.response.data.message || "Invalid input.";
            } else if (error.code === "ECONNABORTED") {
                errorMessage = "Request timeout. Please check your connection.";
            }

            showAlert("error", "Error", errorMessage, "OK");
        } finally {
            setIsStartingConversation(false);
        }
    };

    // Fetch product recommendations
    const getRecommendations = async () => {
        try {
            const res = await axios.post(route("recommend"), {
                product_id: product_info[0].product_id,
            });

            setRecommendations(res.data.recommendations);
        } catch (error) {
            console.error("Error fetching recommendations:", error);
        }
    };

    useEffect(() => {
        if (!showPageContent && auth.user) {
            Swal.fire({
                title: "Loading...",
                text: "Please wait while we load the page.",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });
        } else {
            Swal.close();
        }
    }, [showPageContent, auth.user]);

    useEffect(() => {
        if (auth.user) {
            showImmediateAddressAlert();
        } else {
            // If not logged in, show page content immediately
            setShowPageContent(true);
        }
    }, [auth.user, showImmediateAddressAlert]);

    // Auto-select first variant if none selected and variants exist
    useEffect(() => {
        if (hasVariants && !selectedVariant && variants.length > 0) {
            setSelectedVariant(variants[0]);
        }
    }, [hasVariants, selectedVariant, variants]);

    // Initialize data
    useEffect(() => {
        checkWishlistStatus();
        setAllReviews(reviews);

        if (reviews.length > 0) {
            setHasMoreReviews(true);
        }
    }, [checkWishlistStatus, reviews]);

    // NEW: Check user address on component mount and when auth changes
    useEffect(() => {
        if (auth.user && showPageContent) {
            checkUserAddress();
        } else {
            setHasValidAddress(false);
        }
    }, [auth.user, showPageContent, checkUserAddress]);

    // WebSocket and other preserved effects
    useEffect(() => {
        getRecommendations();
    }, [product_info[0].product_id]);

    // Code for always listening to new reviews via WebSocket
    useEffect(() => {
        if (!product_info[0]) return;

        const channel = window.Echo.channel(
            `product.${product_info[0].product_id}`
        );

        channel.listen(".ReviewsUpdate", (e) => {
            console.log("New review received via WebSocket:", e);

            const newReviewData = e.review || e;

            const transformedReview = {
                id: newReviewData.id,
                rating: newReviewData.rating,
                comment: newReviewData.comment,
                user: newReviewData.user?.name || "Anonymous",
                profile_image:
                    newReviewData.user.profile_image ||
                    (newReviewData.user?.name || "A").charAt(0).toUpperCase(),
                date: new Date(newReviewData.created_at)
                    .toISOString()
                    .split("T")[0],
                created_at: newReviewData.created_at,
                user_id: newReviewData.user_id,
            };

            setReviews((prev) => {
                const exists = prev.find((r) => r.id === transformedReview.id);
                if (exists) return prev;
                return [transformedReview, ...prev];
            });

            setAllReviews((prev) => {
                const exists = prev.find((r) => r.id === transformedReview.id);
                if (exists) return prev;
                return [transformedReview, ...prev];
            });
        });

        return () => {
            console.log("Cleaning up WebSocket listener");
            channel.stopListening(".ReviewsUpdate");
        };
    }, [product_info]);

    // WebSocket connection status handlers
    useEffect(() => {
        if (typeof window.Echo === "undefined") {
            console.error(
                "Echo is not available. WebSocket connections will not work."
            );
            return;
        }

        const connection = window.Echo.connector.pusher?.connection;

        if (!connection) {
            console.error("WebSocket connection object not available yet.");
            return;
        }

        connection.bind("connected", () => {
            console.log("WebSocket connected successfully");
        });

        connection.bind("disconnected", () => {
            console.log("WebSocket disconnected");
        });

        connection.bind("error", (error) => {
            console.error("WebSocket error:", error);
        });

        return () => {
            connection.unbind_all();
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Main Product Section */}

            <div className="max-w-7xl mx-auto mt-14 md:mt-16 px-4 sm:px-6 py-4 lg:py-6">
                <div className="flex items-center mb-4">
                    <Link
                        href={route("shopping")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Shop</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
                    {/* Media Gallery - Updated with Video Support */}
                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-6 space-y-3 lg:space-y-4">
                            {/* Main Media Display */}
                            <div className="bg-white rounded-xl lg:rounded-2xl p-3 lg:p-4 border">
                                {selectedVideo ? (
                                    // Video Player
                                    <div className="relative">
                                        <video
                                            ref={videoRef}
                                            src={`${
                                                import.meta.env.VITE_BASE_URL
                                            }${selectedVideo.video_path}`}
                                            className="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-lg"
                                            muted={isVideoMuted}
                                            onPlay={() =>
                                                setIsVideoPlaying(true)
                                            }
                                            onPause={() =>
                                                setIsVideoPlaying(false)
                                            }
                                            onEnded={() =>
                                                setIsVideoPlaying(false)
                                            }
                                        />
                                        {/* Video Controls */}
                                        <div className="absolute inset-0">
                                            {/* Play/Pause button at bottom left */}
                                            <div className="absolute bottom-4 left-4">
                                                <button
                                                    onClick={toggleVideoPlay}
                                                    className="bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-all shadow-lg"
                                                >
                                                    {isVideoPlaying ? (
                                                        <Pause
                                                            size={20}
                                                            className="text-white"
                                                        />
                                                    ) : (
                                                        <Play
                                                            size={20}
                                                            className="text-white ml-0.5"
                                                        />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        {/* Mute/Unmute Button */}
                                        <button
                                            onClick={toggleVideoMute}
                                            className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                                        >
                                            {isVideoMuted ? (
                                                <VolumeX size={16} />
                                            ) : (
                                                <Volume2 size={16} />
                                            )}
                                        </button>
                                        {/* Video Indicator */}
                                        <div className="absolute top-4 left-4 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                                            VIDEO
                                        </div>
                                    </div>
                                ) : (
                                    // Image Display
                                    <div
                                        className="cursor-zoom-in"
                                        onClick={() => setShowZoomModal(true)}
                                    >
                                        <img
                                            src={
                                                import.meta.env.VITE_BASE_URL +
                                                selectedImage
                                            }
                                            alt={product_info[0]?.product_name}
                                            className="w-full h-48 sm:h-64 lg:h-80 object-contain transition-transform hover:scale-105"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Media Thumbnails - Updated with Video Support */}
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {/* Image Thumbnails */}
                                {product_info[0]?.product_image.map(
                                    (img, idx) => (
                                        <button
                                            key={`img-${idx}`}
                                            onClick={() => {
                                                setSelectedImage(
                                                    img.image_path
                                                );
                                                setSelectedVideo(null);
                                            }}
                                            className={`flex-shrink-0 w-12 h-12 lg:w-16 lg:h-16 rounded-lg border-2 overflow-hidden transition-all ${
                                                selectedImage ===
                                                    img.image_path &&
                                                !selectedVideo
                                                    ? "border-blue-500 ring-2 ring-blue-200"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <img
                                                src={
                                                    import.meta.env
                                                        .VITE_BASE_URL +
                                                    img.image_path
                                                }
                                                alt={`Thumbnail ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    )
                                )}

                                {/* Video Thumbnails */}
                                {hasVideos &&
                                    videos.map((video, idx) => (
                                        <button
                                            key={`video-${idx}`}
                                            onClick={() =>
                                                handleVideoSelect(video)
                                            }
                                            className={`flex-shrink-0 w-12 h-12 lg:w-16 lg:h-16 rounded-lg border-2 overflow-hidden transition-all relative ${
                                                selectedVideo?.video_id ===
                                                video.video_id
                                                    ? "border-blue-500 ring-2 ring-blue-200"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                                <Play
                                                    size={16}
                                                    className="text-white"
                                                />
                                            </div>
                                            <div className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs px-1 rounded">
                                                VIDEO
                                            </div>
                                        </button>
                                    ))}
                            </div>

                            {/* Media Type Indicator */}
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <div>
                                    {product_info[0]?.product_image?.length ||
                                        0}{" "}
                                    images
                                    {hasVideos && ` • ${videos.length} videos`}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Click to{" "}
                                    {selectedVideo
                                        ? "watch video"
                                        : "zoom image"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="lg:col-span-7 space-y-4 lg:space-y-6">
                        {/* Variant Error Message */}
                        {variantError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                <AlertCircle
                                    className="text-red-500 mt-0.5 flex-shrink-0"
                                    size={18}
                                />
                                <div>
                                    <p className="text-red-800 font-medium text-sm">
                                        {variantError}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* // In your JSX, enhance the address warning message: */}
                        {auth.user && !hasValidAddress && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 mb-4">
                                <svg
                                    className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                                <div className="flex-1">
                                    <p className="text-yellow-800 font-medium text-sm">
                                        Shipping Address Required
                                    </p>
                                    <p className="text-yellow-700 text-sm mt-1">
                                        You need to set up your shipping address
                                        before making purchases
                                    </p>
                                    <Link href={route("profile")}>
                                        <button className="text-yellow-800 underline text-sm mt-2 hover:text-yellow-900 font-medium">
                                            📝 Set Up Address Now
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        )}
                        {/* Product Header */}
                        <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 border">
                            <div className="flex items-start justify-between mb-3 lg:mb-4">
                                <div className="flex-1">
                                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                                        {product_info[0]?.product_name}
                                    </h1>
                                    <div className="flex items-center gap-2 lg:gap-3 text-sm text-gray-600 flex-wrap">
                                        <div className="flex items-center">
                                            <div className="flex text-yellow-400 mr-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        className={
                                                            i <
                                                            Math.floor(
                                                                averageRating
                                                            )
                                                                ? "fill-current"
                                                                : ""
                                                        }
                                                    />
                                                ))}
                                            </div>
                                            <span className="font-semibold text-gray-900 ml-1 text-sm">
                                                {averageRating.toFixed(1)}
                                            </span>
                                        </div>
                                        <span className="hidden lg:inline">
                                            •
                                        </span>
                                        <button
                                            onClick={handleShowAllReviews}
                                            className="text-blue-600 hover:underline text-sm"
                                        >
                                            {reviewCount}{" "}
                                            {reviewCount === 1
                                                ? "review"
                                                : "reviews"}
                                        </button>
                                        <span className="hidden lg:inline">
                                            •
                                        </span>
                                        <span className="text-sm">
                                            {product_info?.[0]?.order_items
                                                ?.length || 0}{" "}
                                            sold
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1 lg:gap-2">
                                    <button
                                        onClick={() =>
                                            handleWishlistToggle(
                                                product_info[0].product_id
                                            )
                                        }
                                        disabled={
                                            loadingStates.wishlist ||
                                            (hasVariants && !selectedVariant)
                                        }
                                        className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                            actionSuccess.wishlist
                                                ? "bg-green-100 text-green-600 hover:bg-green-200"
                                                : isWishlisted
                                                ? "bg-red-100 text-red-500 hover:bg-red-200"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-red-500"
                                        }`}
                                        title={
                                            hasVariants && !selectedVariant
                                                ? "Please select a variant first"
                                                : ""
                                        }
                                    >
                                        {loadingStates.wishlist ? (
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />
                                        ) : actionSuccess.wishlist ? (
                                            <CheckCircle
                                                size={18}
                                                className="text-green-600"
                                            />
                                        ) : (
                                            <Heart
                                                size={18}
                                                className={
                                                    isWishlisted
                                                        ? "fill-red-500 text-red-500 stroke-red-500"
                                                        : "text-current stroke-current"
                                                }
                                            />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-4 lg:mb-6">
                                <div className="flex items-baseline gap-2 lg:gap-3 mb-1 flex-wrap">
                                    <span className="text-2xl lg:text-3xl font-bold text-gray-900">
                                        RM {product_info[0]?.product_price}
                                    </span>
                                    {product_info[0]?.original_price && (
                                        <>
                                            <span className="text-lg lg:text-xl text-gray-400 line-through">
                                                RM{" "}
                                                {
                                                    product_info[0]
                                                        ?.original_price
                                                }
                                            </span>
                                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                                                {Math.round(
                                                    (1 -
                                                        product_info[0]
                                                            ?.product_price /
                                                            product_info[0]
                                                                ?.original_price) *
                                                        100
                                                )}
                                                % OFF
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Stock Status */}
                            <div className="mb-4 lg:mb-6">
                                <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        availableStock > 0
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                    }`}
                                >
                                    {availableStock > 0
                                        ? "In Stock"
                                        : "Out of Stock"}{" "}
                                    • {availableStock} available
                                </span>
                            </div>

                            {/* Product Options Summary - Mobile */}
                            <div className="lg:hidden mb-4">
                                <button
                                    onClick={() => setShowMobileVariants(true)}
                                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-left hover:border-gray-400 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                Variant Selected
                                            </p>
                                            <p
                                                className={`text-sm font-bold mt-1 ${
                                                    selectedVariant
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                }`}
                                            >
                                                {selectedVariant
                                                    ? getVariantCombinationText(
                                                          selectedVariant
                                                      )
                                                    : "No variant selected"}
                                            </p>
                                            {!selectedVariant &&
                                                hasVariants && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        Please select a variant
                                                    </p>
                                                )}
                                        </div>
                                        <ChevronRight
                                            size={20}
                                            className="text-gray-400"
                                        />
                                    </div>
                                </button>
                            </div>

                            {/* Product variant - Desktop */}
                            <div className="hidden lg:block space-y-4">
                                {hasVariants && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="font-semibold text-gray-900">
                                                Available Variants
                                                <span className="text-red-500 ml-1">
                                                    *
                                                </span>
                                            </label>
                                            {!selectedVariant && (
                                                <span className="text-xs text-red-500">
                                                    Required
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {variants.map((variant) => (
                                                <button
                                                    key={variant.variant_id}
                                                    onClick={() =>
                                                        handleVariantSelect(
                                                            variant
                                                        )
                                                    }
                                                    disabled={
                                                        variant.quantity <= 0
                                                    }
                                                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                                                        selectedVariant?.variant_id ===
                                                        variant.variant_id
                                                            ? "border-blue-500 bg-blue-50 text-blue-700"
                                                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                                                    } ${
                                                        variant.quantity <= 0
                                                            ? "opacity-50 cursor-not-allowed"
                                                            : ""
                                                    }`}
                                                >
                                                    <div className="font-medium">
                                                        {getVariantCombinationText(
                                                            variant
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-sm font-semibold">
                                                            RM {variant.price}
                                                        </span>
                                                        <span
                                                            className={`text-xs ${
                                                                variant.quantity >
                                                                0
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                            }`}
                                                        >
                                                            {variant.quantity >
                                                            0
                                                                ? `${variant.quantity} available`
                                                                : "Out of stock"}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Quantity and Actions */}
                            <div className="mt-4 lg:mt-6 space-y-4">
                                <div className="flex items-center gap-4">
                                    <label className="font-semibold text-gray-900">
                                        Quantity:
                                    </label>
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={decreaseQty}
                                            disabled={quantity <= 1}
                                            className="p-2 lg:p-3 hover:bg-gray-100 transition-colors text-black"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="px-3 lg:px-4 py-2 min-w-[40px] lg:min-w-[50px] text-center text-black font-medium border-x">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={increaseQty}
                                            disabled={
                                                quantity >= availableStock
                                            }
                                            className="p-2 lg:p-3 hover:bg-gray-100 transition-colors text-black"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                                            (hasVariants && !selectedVariant) ||
                                            availableStock === 0
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                        onClick={handleAddToCart}
                                        disabled={
                                            loadingStates.addToCart ||
                                            (hasVariants && !selectedVariant) ||
                                            availableStock === 0
                                        }
                                        title={
                                            hasVariants && !selectedVariant
                                                ? "Please select a variant first"
                                                : availableStock === 0
                                                ? "Out of stock"
                                                : ""
                                        }
                                    >
                                        {loadingStates.addToCart ? (
                                            <>
                                                <Loader2
                                                    size={18}
                                                    className="animate-spin"
                                                />
                                                Adding...
                                            </>
                                        ) : actionSuccess.addToCart ? (
                                            <>
                                                <CheckCircle size={18} />
                                                Added to Cart!
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart size={18} />
                                                Add to Cart
                                            </>
                                        )}
                                    </button>

                                    {/* UPDATED: Buy Now button - never disabled, uses SweetAlert for validation */}
                                    <button
                                        onClick={handleBuyNow}
                                        className="flex-1 py-3 rounded-lg font-semibold bg-orange-400 text-white hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                                        title="Proceed to checkout - Fast & Secure"
                                    >
                                        {loadingStates.buyNow ? (
                                            <>
                                                <Loader2
                                                    size={18}
                                                    className="animate-spin"
                                                />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart size={18} />
                                                <span>Buy Now</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Enhanced Disabled State Messages */}
                                {hasVariants && !selectedVariant && (
                                    <div className="text-center">
                                        <p className="text-sm text-red-500 font-medium">
                                            Please select a variant to continue
                                        </p>
                                    </div>
                                )}

                                {/* Stock limitation note */}
                                {availableStock === 0 && (
                                    <div className="text-center">
                                        <p className="text-sm text-red-500 font-medium">
                                            This product is currently out of
                                            stock
                                        </p>
                                    </div>
                                )}

                                {/* NEW: Address limitation note */}
                                {auth.user && !hasValidAddress && (
                                    <div className="text-center">
                                        <p className="text-sm text-yellow-600 font-medium">
                                            Please update your address in
                                            profile to enable purchases
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Quick Info */}
                            <div className="mt-4 lg:mt-6 grid grid-cols-3 gap-2 lg:gap-4 text-center">
                                <div className="p-2 lg:p-3 bg-gray-50 rounded-lg">
                                    <DollarSign
                                        size={16}
                                        className="text-green-600 mx-auto mb-1"
                                    />
                                    <p className="text-xs text-gray-600">
                                        Price Match
                                    </p>
                                </div>
                                <div className="p-2 lg:p-3 bg-gray-50 rounded-lg">
                                    <RotateCcw
                                        size={16}
                                        className="text-green-600 mx-auto mb-1"
                                    />
                                    <p className="text-xs text-gray-600">
                                        30-Day Return
                                    </p>
                                </div>
                                <div className="p-2 lg:p-3 bg-gray-50 rounded-lg">
                                    <Shield
                                        size={16}
                                        className="text-purple-600 mx-auto mb-1"
                                    />
                                    <p className="text-xs text-gray-600">
                                        Secure Packaging
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Seller Info */}
                        <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 border">
                            <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                                    {product_info[0]?.seller?.seller_store?.store_name?.charAt(
                                        0
                                    ) || "S"}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base">
                                        {product_info[0]?.seller?.seller_store
                                            ?.store_name || "Seller Store"}
                                    </h3>
                                    <p className="text-xs lg:text-sm text-gray-600">
                                        Verified by Relove Market
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        setShowConversationModal(true)
                                    }
                                    disabled={isStartingConversation}
                                    className="px-3 lg:px-4 py-2 border border-gray-300 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isStartingConversation ? (
                                        <>
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />
                                            Starting...
                                        </>
                                    ) : (
                                        "Chat"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <div className="mt-6 lg:mt-8">
                    <div className="bg-white rounded-xl lg:rounded-2xl border overflow-hidden">
                        {/* Tab Headers */}
                        <div className="border-b overflow-x-auto">
                            <div className="flex min-w-max">
                                {[
                                    "description",
                                    "reviews",
                                    "include_items",
                                ].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 lg:px-6 py-3 lg:py-4 font-semibold border-b-2 transition-colors capitalize whitespace-nowrap text-sm lg:text-base ${
                                            activeTab === tab
                                                ? "border-blue-600 text-blue-600"
                                                : "border-transparent text-gray-500 hover:text-gray-700"
                                        }`}
                                    >
                                        {tab === "description"
                                            ? "Description"
                                            : tab === "reviews"
                                            ? "Reviews"
                                            : tab === "include_items"
                                            ? "Included Items"
                                            : ""}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab content remains the same */}
                        <div className="p-4 lg:p-6">
                            {/* Description Tab */}
                            {activeTab === "description" && (
                                <div className="space-y-4 lg:space-y-6">
                                    <div>
                                        <h3 className="text-lg lg:text-xl text-black font-semibold mb-3 lg:mb-4">
                                            Product Description
                                        </h3>
                                        <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
                                            {product_info[0]
                                                ?.product_description ||
                                                "No description provided"}
                                        </p>
                                    </div>

                                    {product_info[0]?.product_feature?.length >
                                        0 && (
                                        <div>
                                            <h4 className="text-base lg:text-lg text-black font-semibold mb-3 lg:mb-4">
                                                Key Features
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-3">
                                                {product_info[0].product_feature.map(
                                                    (feature, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-start gap-2 lg:gap-3 p-2 lg:p-3 bg-gray-50 rounded-lg"
                                                        >
                                                            <Check
                                                                size={16}
                                                                className="text-green-500 mt-0.5 flex-shrink-0"
                                                            />
                                                            <span className="text-gray-700 text-sm lg:text-base">
                                                                {
                                                                    feature.feature_text
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reviews Tab */}
                            {activeTab === "reviews" && (
                                <div className="space-y-4 lg:space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg lg:text-xl text-black font-semibold">
                                            Customer Reviews
                                        </h3>
                                        <button
                                            onClick={() =>
                                                setShowReviewModal(true)
                                            }
                                            className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base"
                                        >
                                            Write Review
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                                        <div className="space-y-4">
                                            <div className="text-center p-4 lg:p-6 bg-gray-50 rounded-lg">
                                                <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                                                    {averageRating.toFixed(1)}
                                                </div>
                                                <div className="flex justify-center mt-1">
                                                    {[...Array(5)].map(
                                                        (_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={18}
                                                                className={
                                                                    i <
                                                                    Math.floor(
                                                                        averageRating
                                                                    )
                                                                        ? "text-yellow-400 fill-current"
                                                                        : "text-gray-300"
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {reviewCount}{" "}
                                                    {reviewCount === 1
                                                        ? "review"
                                                        : "reviews"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                                            {filteredReviews.length > 0 ? (
                                                <>
                                                    {filteredReviews.map(
                                                        (review) => (
                                                            <div
                                                                key={review.id}
                                                                className="border-b pb-4 lg:pb-6 last:border-b-0"
                                                            >
                                                                <div className="flex items-start gap-3 lg:gap-4">
                                                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                                        {review
                                                                            .user
                                                                            ?.profile_image ? (
                                                                            <img
                                                                                src={
                                                                                    review
                                                                                        .user
                                                                                        ?.profile_image
                                                                                        ? `${
                                                                                              import.meta
                                                                                                  .env
                                                                                                  .VITE_BASE_URL +
                                                                                              review
                                                                                                  .user
                                                                                                  .profile_image
                                                                                          }`
                                                                                        : "/image/user.png"
                                                                                }
                                                                                alt={
                                                                                    review
                                                                                        .user
                                                                                        ?.name ||
                                                                                    "User"
                                                                                }
                                                                                className="w-full h-full rounded-lg object-cover"
                                                                            />
                                                                        ) : (
                                                                            <img
                                                                                src="/image/user.png"
                                                                                alt={
                                                                                    review
                                                                                        .user
                                                                                        ?.name ||
                                                                                    "User"
                                                                                }
                                                                                className="w-full h-full rounded-lg object-cover"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                                            <span className="font-semibold text-sm text-black lg:text-base">
                                                                                {review.user_id ===
                                                                                auth
                                                                                    .user
                                                                                    ?.user_id
                                                                                    ? "You"
                                                                                    : review
                                                                                          .user
                                                                                          ?.name ||
                                                                                      "Anonymous"}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex text-yellow-400 mb-2">
                                                                            {[
                                                                                ...Array(
                                                                                    5
                                                                                ),
                                                                            ].map(
                                                                                (
                                                                                    _,
                                                                                    i
                                                                                ) => (
                                                                                    <Star
                                                                                        key={
                                                                                            i
                                                                                        }
                                                                                        size={
                                                                                            14
                                                                                        }
                                                                                        className={
                                                                                            i <
                                                                                            review.rating
                                                                                                ? "fill-current"
                                                                                                : ""
                                                                                        }
                                                                                    />
                                                                                )
                                                                            )}
                                                                        </div>

                                                                        <p className="text-gray-700 text-sm lg:text-base mb-3">
                                                                            {
                                                                                review.comment
                                                                            }
                                                                        </p>

                                                                        <div className="flex items-center gap-3 lg:gap-4 text-xs lg:text-sm text-gray-500">
                                                                            <span>
                                                                                {new Date(
                                                                                    review.created_at ||
                                                                                        Date.now()
                                                                                ).toLocaleString(
                                                                                    "en-MY",
                                                                                    {
                                                                                        timeZone:
                                                                                            "Asia/Kuala_Lumpur",
                                                                                        year: "numeric",
                                                                                        month: "short",
                                                                                        day: "numeric",
                                                                                        hour: "2-digit",
                                                                                        minute: "2-digit",
                                                                                        hour12: true,
                                                                                    }
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}

                                                    {reviewCount > 3 && (
                                                        <div className="text-center pt-4">
                                                            <button
                                                                onClick={
                                                                    handleShowAllReviews
                                                                }
                                                                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                                            >
                                                                View All{" "}
                                                                {reviewCount}{" "}
                                                                Reviews
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-500">
                                                        No reviews yet. Be the
                                                        first to review this
                                                        product!
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "include_items" && (
                                <div className="space-y-4 lg:space-y-6">
                                    <div>
                                        <h3 className="text-lg lg:text-xl text-black font-semibold mb-3 lg:mb-4">
                                            Product Include Item
                                        </h3>
                                        <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
                                            This product package includes the
                                            following items for your
                                            convenience.
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-3 mt-6">
                                            {product_info[0].product_include_item.map(
                                                (include_item) => (
                                                    <div
                                                        key={
                                                            include_item.item_id
                                                        }
                                                        className="flex items-start gap-2 lg:gap-3 p-2 lg:p-3 bg-gray-50 rounded-lg"
                                                    >
                                                        <Check
                                                            size={16}
                                                            className="text-green-500 mt-0.5 flex-shrink-0"
                                                        />
                                                        <span className="text-gray-700 text-sm lg:text-base">
                                                            {
                                                                include_item.item_name
                                                            }
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <ProductCarousel
                    products={recommendations}
                    title={"You Might Also Like"}
                />
            </div>

            {/* Modals */}
            {showMobileVariants && (
                <MobileVariantsPanel
                    product_info={product_info}
                    selectedVariant={selectedVariant}
                    setShowMobileVariants={setShowMobileVariants}
                    handleVariantSelect={handleVariantSelect}
                    getVariantCombinationText={getVariantCombinationText}
                />
            )}

            {showAllReviewsModal && (
                <ShowAllReviewsModal
                    allReviews={allReviews}
                    hasMoreReviews={hasMoreReviews}
                    isLoadingReviews={isLoadingReviews}
                    reviewCount={reviewCount}
                    setShowAllReviewsModal={setShowAllReviewsModal}
                    loadMoreReviews={loadMoreReviews}
                />
            )}

            {showReviewModal && (
                <ShowReviewModal
                    setShowReviewModal={setShowReviewModal}
                    handleAddReview={handleAddReview}
                    setNewReview={setNewReview}
                    newReview={newReview}
                />
            )}

            {showZoomModal && (
                <ShowZoomModal
                    product_info={product_info}
                    setShowZoomModal={setShowZoomModal}
                    selectedImage={selectedImage}
                />
            )}

            {showConversationModal && (
                <ShowConversationModal
                    initialMessage={initialMessage}
                    setInitialMessage={setInitialMessage}
                    setShowConversationModal={setShowConversationModal}
                    startConversation={startConversation}
                />
            )}

            <Footer />
        </div>
    );
}
