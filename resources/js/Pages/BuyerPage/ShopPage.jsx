import {
    Search,
    ChevronLeft,
    ChevronRight,
    X,
    SlidersHorizontal,
} from "lucide-react";

import { useState, useEffect, useCallback, useRef } from "react";

import axios from "axios";
import Swal from "sweetalert2";

import { Footer } from "@/Components/BuyerPage/Footer";
import { Navbar } from "@/Components/BuyerPage/Navbar";
import { ShopProductCard } from "@/Components/BuyerPage/HomePage/ShopProductCard";
import { MobileProductCard } from "@/Components/BuyerPage/HomePage/MobileProductCard";
import { MobileSortModal } from "@/Components/BuyerPage/ShopPage/MobileSortModal";
import { MobileFilterModal } from "@/Components/BuyerPage/ShopPage/MobileFilterModal";
import { FilterModal } from "@/Components/BuyerPage/ShopPage/FilterModal";
import { usePage } from "@inertiajs/react";

export default function ShopPage({ list_shoppingItem, list_categoryItem }) {
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedConditions, setSelectedConditions] = useState([]);
    const [sortBy, setSortBy] = useState("recommended");
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedFilters, setExpandedFilters] = useState({
        categories: true,
        price: true,
        condition: true,
        rating: false,
        shipping: false,
    });

    // New mobile-specific states
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [mobileViewMode, setMobileViewMode] = useState("list");
    const [isMobile, setIsMobile] = useState(false);

    const [showSortOptions, setShowSortOptions] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // State for products and pagination - Initialize with props
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [from, setFrom] = useState(0);
    const [to, setTo] = useState(0);
    const [loading, setLoading] = useState(false);

    const [categoryCounts, setCategoryCounts] = useState([]);

    // Refs for debounce
    const debounceTimeoutRef = useRef(null);
    const isInitialMount = useRef(true);

    const { auth } = usePage().props;

    const fetchCategoryCounts = async () => {
        try {
            const response = await fetch(
                `/api/shopping/category-counts?search=${searchQuery}`
            );
            const data = await response.json();
            setCategoryCounts(data.categoryCounts || {});
        } catch (error) {
            console.error("Error fetching category counts:", error);
        }
    };

    // Fixed fetchProducts function
    const fetchProducts = useCallback(
        async (page = 1, filters = {}) => {
            setLoading(true);

            // Build URL with proper array parameters
            const params = new URLSearchParams();
            params.append("page", page.toString());

            if (searchQuery) params.append("search", searchQuery);
            if (sortBy) params.append("sort_by", sortBy);

            // PROPERLY handle arrays - use categories[] for each item
            if (selectedCategories.length > 0) {
                selectedCategories.forEach((category) => {
                    params.append("categories[]", category);
                });
            }

            if (selectedConditions.length > 0) {
                selectedConditions.forEach((condition) => {
                    params.append("conditions[]", condition);
                });
            }

            if (priceRange && priceRange.length === 2) {
                params.append("price_range[]", priceRange[0].toString());
                params.append("price_range[]", priceRange[1].toString());
            }

            // Filter condition
            try {
                const response = await fetch(
                    `/api/shopping?${new URLSearchParams(params)}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                            "X-CSRF-TOKEN":
                                document
                                    .querySelector('meta[name="csrf-token"]')
                                    ?.getAttribute("content") || "",
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();

                    console.log(data.list_shoppingItem);

                    if (data.success) {
                        setProducts(data.list_shoppingItem.data || []);
                        setCurrentPage(
                            data.list_shoppingItem.current_page || 1
                        );
                        setLastPage(data.list_shoppingItem.last_page || 1);
                        setTotalProducts(data.list_shoppingItem.total || 0);
                        setFrom(data.list_shoppingItem.from || 0);
                        setTo(data.list_shoppingItem.to || 0);
                    }
                } else {
                    console.error("❌ HTTP error:", response.status);
                }
            } catch (error) {
                console.error("❌ Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        },
        [
            searchQuery,
            sortBy,
            selectedCategories,
            selectedConditions,
            priceRange,
        ]
    );

    // Proper debounced search function
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query); // Update UI immediately

        // Clear previous timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            if (query.trim() === "") {
                // 👉 If search cleared, fetch all products
                fetchProducts(1, {});
            } else {
                // 👉 Normal search request
                fetchProducts(1, { search: query });
            }
        }, 500);
    };

    // Function to get wishlist status
    const get_wishlist = async (product_id) => {
        try {
            const response = await axios.get(route("get-wishlist", product_id));
            return response.data;
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            return null;
        }
    };

    // Function to save to wishlist
    const save_wishlist = async (productId, selectedVariant = null) => {
        try {
            if (!auth.user) {
                Swal.fire({
                    title: "Login Required",
                    text: "You need to log in to add items to your wishlist.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Go to Login",
                    cancelButtonText: "Cancel",
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Redirect to login page
                        window.location.href = route("login");
                    }
                });
                return false;
            }

            // Prepare the request data with proper structure
            const requestData = {
                product_id: productId,
            };

            if (selectedVariant) {
                // Parse variant_combination if it's a string
                let variantCombination = selectedVariant.variant_combination;
                if (typeof variantCombination === "string") {
                    try {
                        variantCombination = JSON.parse(variantCombination);
                    } catch (error) {
                        console.error(
                            "Error parsing variant combination:",
                            error
                        );
                        // If parsing fails, create a basic structure
                        variantCombination = {
                            Colors: selectedVariant.variant_key,
                        };
                    }
                }

                // Format the selected variant data to match the desired structure
                requestData.selected_variant = {
                    variant_id: selectedVariant.variant_id,
                    variant_combination: variantCombination,
                    price:
                        selectedVariant.price || selectedVariant.variant_price,
                    quantity:
                        selectedVariant.quantity ||
                        selectedVariant.stock_quantity,
                };
            }

            const response = await axios.post(
                route("store-wishlist"),
                requestData
            );

            if (response.status === 200) {
                // popup on success
                Swal.fire({
                    title: "Added to Wishlist!",
                    text: "This item has been successfully added to your wishlist.",
                    icon: "success",
                    confirmButtonText: "OK",
                    timer: 4000,
                    timerProgressBar: true,
                });

                await get_wishlist(productId); // Refresh wishlist status

                return true;
            }
        } catch (error) {
            console.error("💥 Error in save_wishlist:", error);

            // Check if error is due to authentication
            if (error.response?.status === 401) {
                Swal.fire({
                    title: "Session Expired",
                    text: "Your session has expired. Please log in again.",
                    icon: "warning",
                    confirmButtonText: "Login",
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = route("login");
                    }
                });
                return false;
            }

            // Show error message to user
            Swal.fire({
                title: "Error",
                text: "Failed to add product to wishlist. Please try again.",
                icon: "error",
                confirmButtonText: "OK",
            });

            return false;
        }
    };

    // Toggle category filter
    const toggleCategory = (category) => {
        const newCategories = selectedCategories.includes(category)
            ? selectedCategories.filter((c) => c !== category)
            : [...selectedCategories, category];
        setSelectedCategories(newCategories);
    };

    // Toggle condition filter
    const toggleCondition = (condition) => {
        const newConditions = selectedConditions.includes(condition)
            ? selectedConditions.filter((c) => c !== condition)
            : [...selectedConditions, condition];
        setSelectedConditions(newConditions);
    };

    // Apply filters (for mobile)
    const applyFilters = () => {
        setMobileFiltersOpen(false);
        fetchProducts(1);
    };

    // Reset all filters
    const resetFilters = () => {
        setPriceRange([0, 1000]);
        setSelectedCategories([]);
        setSelectedConditions([]);
        setSortBy("recommended");
        setSearchQuery("");
    };

    // Toggle filter sections
    const toggleFilterSection = (section) => {
        setExpandedFilters((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Update page change handler
    const handlePageChange = (page) => {
        if (page >= 1 && page <= lastPage) {
            fetchProducts(page);
            scrollToTop();
        }
    };

    // Handle sort changes
    const handleSortChange = (sort) => {
        setSortBy(sort);
        setShowSortOptions(false);
    };

    // FIXED: Handle price range input changes
    const handlePriceInputChange = (index, value) => {
        const newPriceRange = [...priceRange];
        const numValue = value === "" ? 0 : parseInt(value) || 0;
        newPriceRange[index] = numValue;
        setPriceRange(newPriceRange);
    };

    // Determine if there are products to show
    const hasProducts = products && products.length > 0;

    // Generate page numbers for pagination
    const generatePageNumbers = () => {
        const pages = [];
        const maxVisiblePages = isMobile ? 3 : 5;

        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxVisiblePages / 2)
        );
        let endPage = Math.min(lastPage, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    useEffect(() => {
        fetchCategoryCounts();
    }, [searchQuery, selectedCategories]);

    // Initialize with props data on component mount
    useEffect(() => {
        if (list_shoppingItem?.data) {
            setProducts(list_shoppingItem.data || []);
            setCurrentPage(list_shoppingItem.current_page || 1);
            setLastPage(list_shoppingItem.last_page || 1);
            setTotalProducts(list_shoppingItem.total || 0);
            setFrom(list_shoppingItem.from || 0);
            setTo(list_shoppingItem.to || 0);
        }
    }, [list_shoppingItem]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Clear any pending search timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Fetch products with current filters
        fetchProducts(1);
    }, [
        selectedCategories,
        selectedConditions,
        priceRange,
        sortBy,
        fetchProducts,
    ]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            {/* Search Icon Button */}
            <button
                onClick={() => setIsSearchFocused(true)}
                className="fixed bottom-6 right-6 z-30 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors lg:hidden"
            >
                <Search className="w-5 h-5" />
            </button>

            {/* Search Modal - Bottom Sheet Style */}
            {isSearchFocused && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={() => setIsSearchFocused(false)}
                    />

                    {/* Bottom Sheet */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[70vh] flex flex-col">
                        {/* Drag Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                        </div>

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Search
                                </h3>
                                <button
                                    onClick={() => setIsSearchFocused(false)}
                                    className="p-2 text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="What are you looking for?"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    autoFocus
                                    className="text-black w-full px-4 py-3 pl-12 rounded-2xl bg-gray-100 border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                />
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            </div>
                        </div>

                        {/* Content Area - Scrollable */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Quick Filters */}
                            <div className="px-6 py-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-gray-900">
                                        Quick Filters
                                    </h4>
                                    <button
                                        onClick={() => {
                                            setIsSearchFocused(false);
                                            setMobileFiltersOpen(true);
                                        }}
                                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                                    >
                                        <SlidersHorizontal className="w-4 h-4" />
                                        <span>All Filters</span>
                                    </button>
                                </div>

                                {/* Popular Categories */}
                                <div className="mb-6">
                                    <h5 className="text-sm font-medium text-gray-700 mb-3">
                                        Popular Categories
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                        {list_categoryItem
                                            ?.slice(0, 6)
                                            .map((category, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        toggleCategory(
                                                            category.category_name
                                                        );
                                                        setIsSearchFocused(
                                                            false
                                                        );
                                                    }}
                                                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                                        selectedCategories.includes(
                                                            category.category_name
                                                        )
                                                            ? "bg-blue-500 text-white"
                                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    }`}
                                                >
                                                    {category.category_name}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Promotional Banner */}
            <div
                className="relative text-white py-16 mt-10 md:mt-16 lg:mt-0 bg-fixed bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url(../image/shopping_bg.jpg)",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    backgroundPositionY: "center",
                }}
            >
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="container mx-auto md:mt-10 px-4 text-center relative z-10">
                    <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                        ReLove Your Shopping Experience
                    </h1>
                    <p className="text-lg lg:text-xl opacity-90 mb-6">
                        Discover items shared, loved, and ready for you
                    </p>
                    {/* Search Bar - Desktop ONLY */}
                    <div className="max-w-2xl mx-auto relative hidden lg:block">
                        <input
                            type="text"
                            placeholder="Search for products, brands, or categories..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="text-black w-full px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg"
                        />
                        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 lg:px-24 py-4 lg:py-8">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
                    {/* Filters Sidebar - Desktop */}
                    <aside className="hidden lg:block w-80 flex-shrink-0">
                        <FilterModal
                            expandedFilters={expandedFilters}
                            fetchProducts={fetchProducts}
                            handlePriceInputChange={handlePriceInputChange}
                            list_categoryItem={list_categoryItem}
                            priceRange={priceRange}
                            categoryCounts={categoryCounts}
                            resetFilters={resetFilters}
                            selectedCategories={selectedCategories}
                            selectedConditions={selectedConditions}
                            toggleCategory={toggleCategory}
                            toggleCondition={toggleCondition}
                            toggleFilterSection={toggleFilterSection}
                        />
                    </aside>

                    {/* Products Section */}
                    <section className="flex-1">
                        {/* Results Header - Desktop */}
                        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                                        {searchQuery
                                            ? `Results for "${searchQuery}"`
                                            : "All Products"}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Showing {from}-{to} of {totalProducts}{" "}
                                        products
                                        {selectedCategories.length > 0 &&
                                            ` in ${
                                                selectedCategories.length
                                            } categor${
                                                selectedCategories.length === 1
                                                    ? "y"
                                                    : "ies"
                                            }`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Results Info */}
                        <div className="lg:hidden bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
                            <p className="text-sm text-gray-600 text-center">
                                Showing {from}-{to} of {totalProducts} products
                            </p>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        )}

                        {/* Product Grid/List */}
                        {!loading && hasProducts ? (
                            <div
                                className={
                                    mobileViewMode === "grid"
                                        ? "grid grid-cols-2 gap-3 lg:grid-cols-2 xl:grid-cols-3 lg:gap-6"
                                        : "space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-6"
                                }
                            >
                                {products.map((product) =>
                                    isMobile && mobileViewMode === "list" ? (
                                        <MobileProductCard
                                            key={product.product_id}
                                            product={product}
                                            save_wishlist={save_wishlist}
                                            get_wishlist={get_wishlist}
                                        />
                                    ) : (
                                        <ShopProductCard
                                            key={product.product_id}
                                            product={product}
                                            isFlashSale={false}
                                            save_wishlist={save_wishlist}
                                            get_wishlist={get_wishlist}
                                        />
                                    )
                                )}
                            </div>
                        ) : (
                            !loading && (
                                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
                                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        No products found
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Try adjusting your search or filter
                                        criteria
                                    </p>
                                    <button
                                        onClick={resetFilters}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            )
                        )}

                        {/* Pagination - Mobile Optimized */}
                        {!loading && hasProducts && lastPage > 1 && (
                            <div className="flex justify-center mt-8">
                                <div className="flex items-center gap-1 lg:gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() =>
                                            handlePageChange(currentPage - 1)
                                        }
                                        className="flex text-black items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4 text-blue-600" />
                                        <span className="hidden lg:inline">
                                            Previous
                                        </span>
                                    </button>

                                    {generatePageNumbers().map((page) => (
                                        <button
                                            key={page}
                                            onClick={() =>
                                                handlePageChange(page)
                                            }
                                            className={`w-8 h-8 lg:w-10 lg:h-10 rounded-xl text-sm text-black font-medium transition-colors ${
                                                currentPage === page
                                                    ? "bg-blue-600 text-white"
                                                    : "border border-gray-300 hover:bg-gray-50"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        disabled={currentPage === lastPage}
                                        onClick={() =>
                                            handlePageChange(currentPage + 1)
                                        }
                                        className="flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                    >
                                        <span className="hidden lg:inline text-black">
                                            Next
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-blue-600" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* Mobile Filters Modal */}
            {mobileFiltersOpen && (
                <MobileFilterModal
                    applyFilters={applyFilters}
                    fetchProducts={fetchProducts}
                    handlePriceInputChange={handlePriceInputChange}
                    list_categoryItem={list_categoryItem}
                    priceRange={priceRange}
                    products={products}
                    resetFilters={resetFilters}
                    selectedCategories={selectedCategories}
                    selectedConditions={selectedConditions}
                    setMobileFiltersOpen={setMobileFiltersOpen}
                />
            )}

            {/* Mobile Sort Modal */}
            {showSortOptions && (
                <MobileSortModal
                    setShowSortOptions={setShowSortOptions}
                    sortBy={sortBy}
                    handleSortChange={handleSortChange}
                />
            )}

            <Footer />
        </div>
    );
}
