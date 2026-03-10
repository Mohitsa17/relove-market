import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash, Search, Eye } from "lucide-react";

import { SellerSidebar } from "@/Components/SellerPage/SellerSidebar";
import { SellerAddProduct_Modal } from "@/Components/SellerPage/SellerManageProduct/SellerAddProduct_Modal";
import { SellerDeleteProduct_Modal } from "@/Components/SellerPage/SellerManageProduct/SellerDeleteProduct_Modal";
import { SellerEditProduct_Modal } from "@/Components/SellerPage/SellerManageProduct/SellerEditProduct_Modal";
import { SellerViewProduct_Modal } from "@/Components/SellerPage/SellerManageProduct/SellerViewProduct_Modal";

import { ListingToggleButton } from "@/Components/SellerPage/SellerManageProduct/ListingToggleButton";
import { FeaturedToggleButton } from "@/Components/SellerPage/SellerManageProduct/FeaturedToggleButton";

import { LoadingProgress } from "@/Components/AdminPage/LoadingProgress";

import axios from "axios";

import Swal from "sweetalert2";

export default function SellerManageProduct({ list_categories }) {
    const [realTimeProducts, setRealTimeProducts] = useState([]);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Loading Progress
    const [loadingProgress, setLoadingProgress] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalType, setModalType] = useState("");

    const [productToView, setProductToView] = useState(null);
    const [productToEdit, setProductToEdit] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");

    const [errorField, setErrorField] = useState(null);
    const [modalToReopen, setModalToReopen] = useState(null); // 'add' or 'edit'

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [pagination, setPagination] = useState({});

    const [loading, setLoading] = useState(false);
    const [metricsLoading, setMetricsLoading] = useState(false);

    // Featured products state
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [togglingProduct, setTogglingProduct] = useState(null);

    const [metrics, setMetrics] = useState({
        totalProducts: 0,
        availableProducts: 0,
        unavailableProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        blockedProducts: 0,
    });

    const fetchMetrics = async (filters = {}) => {
        setMetricsLoading(true);
        try {
            const params = new URLSearchParams({
                ...filters,
                metrics_only: "true",
            });

            const response = await axios.get(`/api/products/metrics?${params}`);

            if (response.data.success) {
                setMetrics(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching metrics:", error);
        } finally {
            setMetricsLoading(false);
        }
    };

    // Fetch featured products
    const fetchFeaturedProducts = async () => {
        try {
            const response = await axios.get(route("featured-products"));
            setFeaturedProducts(response.data.featured_products || []);
        } catch (error) {
            console.error("Error fetching featured products:", error);
        }
    };

    // Add this function after your other handlers
    const handlePageChange = (page) => {
        const searchParams = {};

        if (searchTerm.trim() !== "") searchParams.search = searchTerm;
        if (statusFilter !== "all") searchParams.status = statusFilter;
        if (categoryFilter !== "all") searchParams.category = categoryFilter;
        if (sortBy !== "name") searchParams.sort = sortBy;

        setCurrentPage(page);
        get_ListProducts(page, searchParams);
    };

    // Check if product is featured
    const isProductFeatured = (productId) => {
        const isFeatured = featuredProducts.some(
            (fp) => fp.product_id === productId
        );
        return isFeatured;
    };

    const isProductBlocked = (product) => {
        return (
            product.product_status === "blocked" ||
            product.is_blocked === true ||
            product.admin_status === "blocked"
        );
    };

    // Add this function to get block reason
    const getBlockReason = (product) => {
        return (
            product.block_reason ||
            product.admin_notes ||
            product.moderation_reason ||
            "Violation of platform policies"
        );
    };

    // Auto update product status when stock reaches 0
    const checkAndUpdateProductStatus = async (product) => {
        if (
            product.product_quantity === 0 &&
            product.product_status === "available"
        ) {
            try {
                const response = await axios.post(route("product-listing"), {
                    product_id: product.product_id,
                    status: "unavailable",
                });

                if (response.data.success) {
                    console.log(
                        `Auto-updated product ${product.product_id} to unavailable due to zero stock`
                    );

                    // Update local state
                    setRealTimeProducts((prevProducts) =>
                        prevProducts.map((p) =>
                            p.product_id === product.product_id
                                ? { ...p, product_status: "unavailable" }
                                : p
                        )
                    );

                    // Refresh metrics
                    await fetchMetrics();
                }
            } catch (error) {
                console.error("Error auto-updating product status:", error);
            }
        }
    };

    // Toggle product listing status
    const toggleProductListing = async (product) => {
        try {
            setTogglingProduct(product.product_id);

            const newStatus =
                product.product_status === "available"
                    ? "unavailable"
                    : "available";

            const response = await axios.post(route("product-listing"), {
                product_id: product.product_id,
                status: newStatus,
            });

            if (response.data.success) {
                // Update local state immediately for better UX
                setRealTimeProducts((prevProducts) =>
                    prevProducts.map((p) =>
                        p.product_id === product.product_id
                            ? { ...p, product_status: newStatus }
                            : p
                    )
                );

                setModalMessage(
                    `Product ${
                        newStatus === "available" ? "active" : "unactive"
                    } successfully`
                );
                setModalType("success");
                setLoadingProgress(true);

                setTimeout(() => {
                    setLoadingProgress(false);
                }, 2000);
            }
        } catch (error) {
            console.error("Error toggling product listing:", error);
            setModalMessage("Failed to update product status");
            setModalType("error");
            setLoadingProgress(true);

            setTimeout(() => {
                setLoadingProgress(false);
            }, 2000);
        } finally {
            setTogglingProduct(null);
        }
    };

    // Toggle product featured status
    const toggleProductFeatured = async (product) => {
        try {
            setTogglingProduct(product.product_id);

            const currentFeaturedStatus = isProductFeatured(product.product_id);
            const newFeaturedStatus = !currentFeaturedStatus;

            // Calculate tax if enabling featured status
            const taxAmount = newFeaturedStatus
                ? (parseFloat(product.product_price) * 0.1).toFixed(2)
                : 0;

            const response = await axios.post(route("product-featured"), {
                product_id: product.product_id,
                featured: newFeaturedStatus,
                tax_amount: taxAmount, // Send tax amount to backend
            });

            if (response.data.success) {
                // Update featured products list immediately
                if (newFeaturedStatus) {
                    setFeaturedProducts((prev) => [
                        ...prev,
                        { product_id: product.product_id },
                    ]);
                } else {
                    setFeaturedProducts((prev) =>
                        prev.filter(
                            (fp) => fp.product_id !== product.product_id
                        )
                    );
                }

                // Update realTimeProducts
                setRealTimeProducts((prevProducts) =>
                    prevProducts.map((p) =>
                        p.product_id === product.product_id
                            ? { ...p, is_featured: newFeaturedStatus }
                            : p
                    )
                );

                // Show appropriate success message
                if (newFeaturedStatus) {
                    setModalMessage(`Product featured successfully!`);
                } else {
                    setModalMessage(
                        `Product removed from featured status successfully`
                    );
                }

                setModalType("success");
                setLoadingProgress(true);

                setTimeout(() => {
                    setLoadingProgress(false);
                }, 3000);
            }
        } catch (error) {
            console.error("Error toggling product featured:", error);

            // Handle specific error cases
            if (error.response?.data?.error === "insufficient_balance") {
                setModalMessage(
                    "Insufficient balance to pay the featured product tax"
                );
            } else {
                setModalMessage("Failed to update featured status");
            }

            setModalType("error");
            setLoadingProgress(true);

            setTimeout(() => {
                setLoadingProgress(false);
            }, 3000);
        } finally {
            setTogglingProduct(null);
        }
    };

    // Handle add product
    const handleAddProductClick = () => {
        setIsAddOpen(true);
    };

    // Handle edit product
    const handleEditProductClick = (product) => {
        setProductToEdit(product);
        setIsEditOpen(true);
    };

    // Handle delete product
    const handleDeleteProductClick = (product) => {
        setProductToDelete(product);
        setIsDeleteOpen(true);
    };

    // Code for adding the new product
    const add_Product = async (e, formData) => {
        e.preventDefault();

        try {
            setIsAddOpen(false);
            setModalMessage("Processing your request...");
            setModalType("loading");
            setLoadingProgress(true);

            const response = await axios.post(route("add-product"), formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setModalMessage(response.data.successMessage);
            setModalType("success");

            await get_ListProducts(currentPage);
            await fetchMetrics();

            setTimeout(() => {
                setLoadingProgress(false);
            }, 3000);
        } catch (error) {
            const errors = error.response?.data?.errors;
            let errorMessages = "";

            if (errors) {
                // Get the first error message only
                const firstErrorKey = Object.keys(errors)[0]; // first field with error
                const firstErrorMessage = errors[firstErrorKey][0]; // first message for that field

                errorMessages = firstErrorMessage;

                // Optionally store the field for focus
                setErrorField(firstErrorKey);
            } else {
                errorMessages =
                    error.response?.data?.errorMessage || "Unknown error";
            }

            setModalMessage("Error adding new product:\n" + errorMessages);
            setModalType("error");

            setTimeout(() => {
                setLoadingProgress(false);
                setModalToReopen("add");
            }, 7000);
        }
    };

    // Code for updating the product
    const edit_Product = async (e, formData) => {
        e.preventDefault();

        try {
            setIsEditOpen(false);
            setModalMessage("Processing your request...");
            setModalType("loading");
            setLoadingProgress(true);

            const response = await axios.post(route("edit-product"), formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setModalMessage(response.data.successMessage);
            setModalType("success");

            setTimeout(() => {
                setLoadingProgress(false);
                setIsEditOpen(false);
            }, 3000);
        } catch (error) {
            setLoadingProgress(true);

            if (error.response) {
                setModalMessage(
                    error.response.data.errorMessage ||
                        "Something went wrong...Please try again"
                );
            } else {
                setModalMessage("Network error. Please try again.");
            }

            setModalType("error");

            setTimeout(() => {
                setLoadingProgress(false);
            }, 7000);
        }
    };

    // Code for deleteing the product
    const delete_product = async (e, product) => {
        e.preventDefault();

        try {
            setModalMessage("Processing your request...");
            setModalType("loading");
            setLoadingProgress(true);

            const response = await axios.post(
                route("delete-product"),
                { product_id: product },
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            setModalMessage(response.data.successMessage);
            setModalType("success");

            // Immediately update local state
            setRealTimeProducts((prevProducts) =>
                prevProducts.filter((p) => p.product_id !== product)
            );

            const searchParams = {};
            if (searchTerm.trim() !== "") searchParams.search = searchTerm;
            if (statusFilter !== "all") searchParams.status = statusFilter;
            if (categoryFilter !== "all")
                searchParams.category = categoryFilter;
            if (sortBy !== "name") searchParams.sort = sortBy;

            const shouldGoToPrevPage =
                currentPage > 1 && realTimeProducts.length === 1;
            const newPage = shouldGoToPrevPage ? currentPage - 1 : currentPage;

            setCurrentPage(newPage);

            await get_ListProducts(currentPage, searchParams);
            await fetchMetrics();

            setTimeout(() => {
                setLoadingProgress(false);
                setIsDeleteOpen(false);
            }, 3000);
        } catch (error) {
            setModalMessage(error.response.data.errorMessage);
            setModalType("error");

            setTimeout(() => {
                setLoadingProgress(false);
            }, 7000);
        }
    };

    // Get the product of the seller
    const get_ListProducts = async (page = 1, searchParams = {}) => {
        setLoading(true);
        try {
            // Use proper parameter format for axios
            const params = {
                page: page,
                ...searchParams,
            };

            const response = await axios.get(route("product-data"), { params });
            const data = response.data;

            setRealTimeProducts(data.list_product.data || data.list_product);

            setCurrentPage(data.list_product.current_page);
            setLastPage(data.list_product.last_page);

            setPagination({
                from: data.list_product.from,
                to: data.list_product.to,
                total: data.list_product.total,
                current_page: data.list_product.current_page,
                last_page: data.list_product.last_page,
            });

            // Fetch featured products after loading products
            await fetchFeaturedProducts();
        } catch (error) {
            console.error("❌ Error fetching products:", error);
            if (error.response) {
                console.error("Error response:", error.response.data);
            }
        }
        setLoading(false);
    };

    // Load both metrics and products with filters
    const loadDataWithFilters = async (page = 1) => {
        const searchParams = {};
        if (searchTerm.trim() !== "") searchParams.search = searchTerm;
        if (statusFilter !== "all") searchParams.status = statusFilter;
        if (categoryFilter !== "all") searchParams.category = categoryFilter;
        if (sortBy !== "name") searchParams.sort = sortBy;

        // Fetch both metrics and products in parallel
        await Promise.all([
            fetchMetrics(searchParams),
            get_ListProducts(page, searchParams),
        ]);
    };

    // Add this function to handle contacting admin
    const contactAdmin = (product) => {
        Swal.fire({
            title: "Contact Admin",
            html: `
            <div class="text-left">
                <p class="text-sm text-gray-600 mb-4">
                    Your product "<strong>${
                        product.product_name
                    }</strong>" has been blocked. 
                    Please contact admin for more information or to appeal this decision.
                </p>
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p class="text-xs text-yellow-800 font-medium mb-1">Block Reason:</p>
                    <p class="text-xs text-yellow-700">${getBlockReason(
                        product
                    )}</p>
                </div>
                <div class="space-y-2">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span class="text-sm text-gray-700">Email: admin@relovemarket.com</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span class="text-sm text-gray-700">Phone: +1 (555) 123-4567</span>
                    </div>
                </div>
            </div>
        `,
            icon: "info",
            confirmButtonText: "Copy Product Details",
            confirmButtonColor: "#3b82f6",
            showCancelButton: true,
            cancelButtonText: "Close",
            customClass: {
                popup: "rounded-2xl",
                confirmButton: "px-6 py-3 rounded-lg font-medium",
                cancelButton:
                    "px-6 py-3 rounded-lg font-medium border border-gray-300 text-white",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                // Copy product details to clipboard
                const productDetails = `Product: ${product.product_name}\nID: ${
                    product.product_id
                }\nBlock Reason: ${getBlockReason(product)}`;
                navigator.clipboard.writeText(productDetails).then(() => {
                    Swal.fire({
                        title: "Copied!",
                        text: "Product details copied to clipboard",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                });
            }
        });
    };

    // Real time update for product listing with Echo
    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.channel("products");

        const productUpdatedListener = (e) => {
            const updatedProduct = e.product;
            if (e.action === "updated") {
                setRealTimeProducts((prevProducts) =>
                    prevProducts.map((p) =>
                        p.product_id === updatedProduct.product_id
                            ? updatedProduct
                            : p
                    )
                );
            }

            // Check if we need to auto-update status for zero stock
            checkAndUpdateProductStatus(updatedProduct);

            if (e.action === "deleted") {
                setRealTimeProducts((prevProducts) =>
                    prevProducts.filter((p) => p.product_id !== e.product_id)
                );
            }

            if (e.action === "created") {
                setRealTimeProducts((prevProducts) => [
                    e.product,
                    ...prevProducts,
                ]);
            }

            fetchMetrics();
        };

        channel.listen(".product.updated", productUpdatedListener);

        channel.subscribed(() =>
            console.log("✅ Subscribed to products channel")
        );
        channel.error((error) => console.error("❌ Channel error:", error));

        return () => {
            channel.stopListening(".product.updated");
            window.Echo.leaveChannel("products");
        };
    }, []);

    // Reset page to 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, []);

    // Fetch users whenever page or filters change
    useEffect(() => {
        loadDataWithFilters(currentPage);
    }, [currentPage]);

    // code for display the error field
    useEffect(() => {
        if (errorField && modalToReopen) {
            setTimeout(() => {
                if (modalToReopen === "add") {
                    setIsAddOpen(true);
                } else if (modalToReopen === "edit") {
                    setIsEditOpen(true);
                }
                setModalToReopen(null);
            }, 100);
        }
    }, [errorField, modalToReopen]);

    // Update your debounced search useEffect:
    useEffect(() => {
        // Debounced search - wait 500ms after user stops typing
        const timeoutId = setTimeout(() => {
            const searchParams = {};

            if (searchTerm.trim() !== "") searchParams.search = searchTerm;
            if (statusFilter !== "all") searchParams.status = statusFilter;
            if (categoryFilter !== "all")
                searchParams.category = categoryFilter;
            if (sortBy !== "name") searchParams.sort = sortBy;

            // Always reset to page 1 when filters change
            setCurrentPage(1);
            loadDataWithFilters(1);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter, categoryFilter, sortBy]);

    useEffect(() => {
        realTimeProducts.forEach((product) => {
            checkAndUpdateProductStatus(product);
        });
    }, [realTimeProducts]);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Modal for view the product */}
            {isViewOpen && (
                <SellerViewProduct_Modal
                    product={productToView}
                    onClose={() => setIsViewOpen(false)}
                />
            )}

            {/* Modal for add new product */}
            {isAddOpen && (
                <SellerAddProduct_Modal
                    onAdd={(e, formData) => {
                        add_Product(e, formData);
                    }}
                    list_categories={list_categories}
                    onClose={() => {
                        setIsAddOpen(false);
                        setErrorField(null);
                    }}
                    errorField={errorField}
                    onErrorFieldHandled={() => setErrorField(null)}
                />
            )}

            {/* Modal for edit the product */}
            {isEditOpen && (
                <SellerEditProduct_Modal
                    onEdit={(e, formData) => {
                        edit_Product(e, formData);
                    }}
                    onClose={() => setIsEditOpen(false)}
                    product={productToEdit}
                    list_categories={list_categories}
                />
            )}

            {/* Modal for delete the product */}
            {isDeleteOpen && (
                <SellerDeleteProduct_Modal
                    product={productToDelete}
                    onDelete={(e, product) => {
                        delete_product(e, product);
                    }}
                    onClose={() => setIsDeleteOpen(false)}
                />
            )}

            {/* Loading Progress */}
            {loadingProgress && (
                <LoadingProgress
                    modalType={modalType}
                    modalMessage={modalMessage}
                />
            )}

            {/* Sidebar */}
            <SellerSidebar />

            {/* Main content */}
            <main className="flex-1 p-3 md:p-6">
                {/* Page header */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                                Product Management
                            </h1>
                            <p className="text-xs md:text-sm text-gray-600 mt-1">
                                Manage your product inventory and listings
                            </p>
                        </div>
                        <button
                            onClick={handleAddProductClick}
                            className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 mt-3 md:mt-0 rounded-lg transition-colors shadow-sm text-sm md:text-base bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            <Plus size={16} />
                            <span>Add Product</span>
                        </button>
                    </div>

                    {/* Stats summary - Improved responsiveness */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
                        <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center">
                                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                                    <svg
                                        className="w-4 h-4 md:w-5 md:h-5 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-gray-600">
                                        Total Products
                                    </p>
                                    <p className="text-base md:text-lg font-semibold text-gray-900">
                                        {metricsLoading ? (
                                            <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                                        ) : (
                                            metrics.totalProducts
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-2 rounded-lg mr-3">
                                    <svg
                                        className="w-4 h-4 md:w-5 md:h-5 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-gray-600">
                                        Available
                                    </p>
                                    <p className="text-base md:text-lg font-semibold text-gray-900">
                                        {metricsLoading ? (
                                            <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                                        ) : (
                                            metrics.availableProducts
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center">
                                <div className="bg-red-100 p-2 rounded-lg mr-3">
                                    <svg
                                        className="w-4 h-4 md:w-5 md:h-5 text-red-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-gray-600">
                                        Unavailable
                                    </p>
                                    <p className="text-base md:text-lg font-semibold text-gray-900">
                                        {metricsLoading ? (
                                            <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                                        ) : (
                                            metrics.unavailableProducts
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center">
                                <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                                    <svg
                                        className="w-4 h-4 md:w-5 md:h-5 text-yellow-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-gray-600">
                                        Low Stock
                                    </p>
                                    <p className="text-base md:text-lg font-semibold text-gray-900">
                                        {metricsLoading ? (
                                            <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                                        ) : (
                                            metrics.lowStockProducts
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center">
                                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                                    <svg
                                        className="w-4 h-4 md:w-5 md:h-5 text-orange-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4h.01M6 12a6 6 0 1112 0 6 6 0 01-12 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-gray-600">
                                        Out of Stock
                                    </p>
                                    <p className="text-base md:text-lg font-semibold text-gray-900">
                                        {metricsLoading ? (
                                            <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                                        ) : (
                                            metrics.outOfStockProducts
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center">
                                <div className="bg-red-100 p-2 rounded-lg mr-3">
                                    <svg
                                        className="w-4 h-4 md:w-5 md:h-5 text-red-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-gray-600">
                                        Blocked
                                    </p>
                                    <p className="text-base md:text-lg font-semibold text-gray-900">
                                        {metricsLoading ? (
                                            <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                                        ) : (
                                            metrics.blockedProducts || 0
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and filters */}
                    <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                            {/* Search Bar */}
                            <div className="flex-1 relative">
                                <Search
                                    className="absolute left-3 top-3 text-gray-400"
                                    size={18}
                                />
                                <input
                                    type="text"
                                    placeholder="Search products by name..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3 md:ml-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                    className="text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                                >
                                    <option value="all">All Status</option>
                                    <option value="available">Available</option>
                                    <option value="unavailable">
                                        Unavailable
                                    </option>
                                </select>

                                <select
                                    value={categoryFilter}
                                    onChange={(e) =>
                                        setCategoryFilter(e.target.value)
                                    }
                                    className="text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                                >
                                    <option value="all">All Categories</option>
                                    {list_categories.map((category) => (
                                        <option
                                            key={category.category_id}
                                            value={category.category_id}
                                        >
                                            {category.category_name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                                >
                                    <option value="name">Sort by Name</option>
                                    <option value="price-high">
                                        Price: High to Low
                                    </option>
                                    <option value="price-low">
                                        Price: Low to High
                                    </option>
                                    <option value="stock-high">
                                        Stock: High to Low
                                    </option>
                                    <option value="stock-low">
                                        Stock: Low to High
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product table (desktop) */}
                <div className="hidden lg:block bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <LoadingProgress
                            modalType={"success"}
                            modalMessage={"Loading..."}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Featured
                                        </th>
                                        <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {realTimeProducts.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="px-6 py-8 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <svg
                                                        className="w-12 h-12 mb-4 text-gray-300"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16"
                                                        />
                                                    </svg>
                                                    <p className="text-lg font-medium mb-1">
                                                        No products found
                                                    </p>
                                                    <p className="text-sm">
                                                        Try adjusting your
                                                        search or filters
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        realTimeProducts.map((product) => (
                                            <tr
                                                key={product.product_id}
                                                className={`hover:bg-gray-50 ${
                                                    isProductBlocked(product)
                                                        ? "bg-red-50 border-l-4 border-l-red-500 hover:bg-red-100"
                                                        : ""
                                                }`}
                                            >
                                                <td className="px-4 md:px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                                                            {product.product_image ? (
                                                                <img
                                                                    src={
                                                                        import.meta
                                                                            .env
                                                                            .VITE_BASE_URL +
                                                                        product
                                                                            .product_image[0]
                                                                            ?.image_path
                                                                    }
                                                                    alt={
                                                                        product.product_name
                                                                    }
                                                                    className="h-10 w-10 rounded-lg object-cover"
                                                                />
                                                            ) : (
                                                                <svg
                                                                    className="h-6 w-6 text-gray-400"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                    />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900 text-sm md:text-base truncate">
                                                                {
                                                                    product.product_name
                                                                }
                                                            </div>
                                                            <div className="text-xs md:text-sm text-gray-500">
                                                                ID:{" "}
                                                                {
                                                                    product.product_id
                                                                }
                                                            </div>
                                                            {isProductBlocked(
                                                                product
                                                            ) && (
                                                                <div className="text-xs text-red-600 mt-1">
                                                                    Reason:{" "}
                                                                    {getBlockReason(
                                                                        product
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <div className="text-gray-900 font-medium text-sm md:text-base">
                                                        RM{" "}
                                                        {product.product_price}
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <div className="flex items-center">
                                                        <span className="text-gray-900 text-sm md:text-base">
                                                            {
                                                                product.product_quantity
                                                            }
                                                        </span>
                                                        {product.product_quantity <
                                                            10 && (
                                                            <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                                                Low stock
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    {isProductBlocked(
                                                        product
                                                    ) ? (
                                                        <span className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">
                                                            BLOCKED
                                                        </span>
                                                    ) : (
                                                        <ListingToggleButton
                                                            product={product}
                                                            toggleProductListing={
                                                                toggleProductListing
                                                            }
                                                            togglingProduct={
                                                                togglingProduct
                                                            }
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                        {
                                                            product.category
                                                                .category_name
                                                        }
                                                    </span>
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    {isProductBlocked(
                                                        product
                                                    ) ? (
                                                        <span className="text-xs text-gray-500">
                                                            N/A
                                                        </span>
                                                    ) : (
                                                        <FeaturedToggleButton
                                                            product={product}
                                                            isProductFeatured={
                                                                isProductFeatured
                                                            }
                                                            toggleProductFeatured={
                                                                toggleProductFeatured
                                                            }
                                                            togglingProduct={
                                                                togglingProduct
                                                            }
                                                        />
                                                    )}
                                                </td>

                                                <td className="px-4 md:px-6 py-4 text-right">
                                                    {isProductBlocked(
                                                        product
                                                    ) ? (
                                                        <div className="flex justify-end space-x-1 md:space-x-2">
                                                            <button
                                                                onClick={() => {
                                                                    // Function to contact admin
                                                                    contactAdmin(
                                                                        product
                                                                    );
                                                                }}
                                                                className="p-1.5 md:p-2 text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 rounded-lg"
                                                                title="Contact Admin about this product"
                                                            >
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end space-x-1 md:space-x-2">
                                                            <button
                                                                onClick={() => {
                                                                    setProductToView(
                                                                        product
                                                                    );
                                                                    setIsViewOpen(
                                                                        true
                                                                    );
                                                                }}
                                                                className="p-1.5 md:p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                                title="View product"
                                                            >
                                                                <Eye
                                                                    size={16}
                                                                />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleEditProductClick(
                                                                        product
                                                                    )
                                                                }
                                                                className="p-1.5 md:p-2 text-gray-400 hover:text-green-600 transition-colors"
                                                                title="Edit product"
                                                            >
                                                                <Edit
                                                                    size={16}
                                                                />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteProductClick(
                                                                        product
                                                                    )
                                                                }
                                                                className="p-1.5 md:p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                                title="Delete product"
                                                            >
                                                                <Trash
                                                                    size={16}
                                                                />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Product cards (tablet and mobile) */}
                <div className="lg:hidden space-y-3">
                    {realTimeProducts.length === 0 ? (
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
                            <svg
                                className="w-12 h-12 mx-auto mb-4 text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16"
                                />
                            </svg>
                            <p className="text-gray-500">
                                No products found. Try adjusting your search or
                                filters.
                            </p>
                        </div>
                    ) : (
                        realTimeProducts.map((product) => (
                            <div
                                key={product.product_id}
                                className={`bg-white p-3 md:p-4 rounded-lg border shadow-sm ${
                                    isProductBlocked(product)
                                        ? "border-red-300 bg-red-50 border-l-4 border-l-red-500"
                                        : "border-gray-200"
                                }`}
                            >
                                {/* Product Header */}
                                <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-3 gap-3">
                                    {/* Product Image */}
                                    <div className="flex-shrink-0 self-center sm:self-start">
                                        <div
                                            className={`h-20 w-20 rounded-lg flex items-center justify-center overflow-hidden ${
                                                isProductBlocked(product)
                                                    ? "bg-red-100"
                                                    : "bg-gray-200"
                                            }`}
                                        >
                                            {product.product_image?.[0]
                                                ?.image_path ? (
                                                <img
                                                    src={`${
                                                        import.meta.env
                                                            .VITE_BASE_URL
                                                    }${
                                                        product.product_image[0]
                                                            .image_path
                                                    }`}
                                                    alt={product.product_name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <svg
                                                    className="h-10 w-10 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 truncate text-sm md:text-base">
                                            {product.product_name}
                                        </h3>

                                        <p className="text-xs md:text-sm text-gray-500">
                                            ID: {product.product_id}
                                        </p>

                                        <div className="flex flex-wrap items-center mt-1 text-sm md:text-base">
                                            <span className="text-gray-900 font-medium">
                                                RM {product.product_price}
                                            </span>
                                            <span className="mx-2 text-gray-300">
                                                •
                                            </span>
                                            <span className="text-gray-600">
                                                {product.product_quantity} in
                                                stock
                                            </span>
                                        </div>

                                        {isProductBlocked(product) && (
                                            <div className="mt-2 p-2 bg-red-100 rounded-lg">
                                                <p className="text-xs text-red-700 font-medium">
                                                    Block Reason:
                                                </p>
                                                <p className="text-xs text-red-600">
                                                    {getBlockReason(product)}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap items-center mt-2 gap-2">
                                            {isProductBlocked(product) ? (
                                                <span className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">
                                                    PRODUCT BLOCKED
                                                </span>
                                            ) : (
                                                <>
                                                    <ListingToggleButton
                                                        product={product}
                                                        toggleProductListing={
                                                            toggleProductListing
                                                        }
                                                        togglingProduct={
                                                            togglingProduct
                                                        }
                                                    />
                                                    <FeaturedToggleButton
                                                        product={product}
                                                        isProductFeatured={
                                                            isProductFeatured
                                                        }
                                                        toggleProductFeatured={
                                                            toggleProductFeatured
                                                        }
                                                        togglingProduct={
                                                            togglingProduct
                                                        }
                                                    />
                                                </>
                                            )}
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                {product.category.category_name}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Footer */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 pt-3 border-t border-gray-100 gap-2">
                                    <div>
                                        {!isProductBlocked(product) &&
                                            product.product_quantity < 10 && (
                                                <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                                    Low stock
                                                </span>
                                            )}
                                    </div>

                                    <div className="flex justify-end w-full sm:w-auto space-x-3">
                                        {isProductBlocked(product) ? (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        contactAdmin(product)
                                                    }
                                                    className="p-1.5 text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1"
                                                    title="Contact Admin about this product"
                                                >
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                                        />
                                                    </svg>
                                                    <span className="text-xs">
                                                        Contact Admin
                                                    </span>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setProductToView(
                                                            product
                                                        );
                                                        setIsViewOpen(true);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="View product"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleEditProductClick(
                                                            product
                                                        )
                                                    }
                                                    className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                                                    title="Edit product"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteProductClick(
                                                            product
                                                        )
                                                    }
                                                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Delete product"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Enhanced Pagination */}
                {pagination.total > 0 && (
                    <div className="px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-200 mt-6">
                        <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
                            <div className="text-xs md:text-sm text-gray-700">
                                Showing{" "}
                                <span className="text-black font-medium">
                                    {pagination.from}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium">
                                    {pagination.to}
                                </span>{" "}
                                of{" "}
                                <span className="text-black font-medium">
                                    {pagination.total}
                                </span>{" "}
                                results
                                <span className="text-primary font-bold mx-1 md:mx-2">
                                    (Page {currentPage} of {lastPage})
                                </span>
                            </div>

                            <div className="flex items-center space-x-1">
                                {/* Previous Button */}
                                {currentPage > 1 && (
                                    <button
                                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() =>
                                            handlePageChange(currentPage - 1)
                                        }
                                        disabled={loading}
                                    >
                                        <svg
                                            className="w-4 h-4 mr-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                        Previous
                                    </button>
                                )}

                                {/* Page Numbers */}
                                <div className="flex items-center space-x-1 mx-2">
                                    {/* First Page */}
                                    {currentPage > 2 && (
                                        <button
                                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                1 === currentPage
                                                    ? "bg-indigo-600 text-white border border-indigo-600"
                                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                            } ${
                                                loading
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                            onClick={() => handlePageChange(1)}
                                            disabled={loading}
                                        >
                                            1
                                        </button>
                                    )}

                                    {/* Ellipsis */}
                                    {currentPage > 3 && (
                                        <span className="px-2 text-gray-500">
                                            ...
                                        </span>
                                    )}

                                    {/* Previous Page */}
                                    {currentPage > 1 && (
                                        <button
                                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                currentPage - 1 === currentPage
                                                    ? "bg-indigo-600 text-white border border-indigo-600"
                                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                            } ${
                                                loading
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handlePageChange(
                                                    currentPage - 1
                                                )
                                            }
                                            disabled={loading}
                                        >
                                            {currentPage - 1}
                                        </button>
                                    )}

                                    {/* Current Page */}
                                    <button
                                        className="px-3 py-2 text-sm font-medium bg-indigo-600 text-white border border-indigo-600 rounded-lg transition-colors"
                                        disabled
                                    >
                                        {currentPage}
                                    </button>

                                    {/* Next Page */}
                                    {currentPage < lastPage && (
                                        <button
                                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                currentPage + 1 === currentPage
                                                    ? "bg-indigo-600 text-white border border-indigo-600"
                                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                            } ${
                                                loading
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handlePageChange(
                                                    currentPage + 1
                                                )
                                            }
                                            disabled={loading}
                                        >
                                            {currentPage + 1}
                                        </button>
                                    )}

                                    {/* Ellipsis */}
                                    {currentPage < lastPage - 2 && (
                                        <span className="px-2 text-gray-500">
                                            ...
                                        </span>
                                    )}

                                    {/* Last Page */}
                                    {currentPage < lastPage - 1 && (
                                        <button
                                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                lastPage === currentPage
                                                    ? "bg-indigo-600 text-white border border-indigo-600"
                                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                            } ${
                                                loading
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handlePageChange(lastPage)
                                            }
                                            disabled={loading}
                                        >
                                            {lastPage}
                                        </button>
                                    )}
                                </div>

                                {/* Next Button */}
                                {currentPage < lastPage && (
                                    <button
                                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() =>
                                            handlePageChange(currentPage + 1)
                                        }
                                        disabled={loading}
                                    >
                                        Next
                                        <svg
                                            className="w-4 h-4 ml-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Loading indicator for pagination */}
                        {loading && (
                            <div className="mt-3 flex justify-center">
                                <div className="flex items-center space-x-2 text-sm text-indigo-600">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
                                    <span>Loading products...</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
