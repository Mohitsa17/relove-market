import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import {
    Search,
    Star,
    ShoppingBag,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Clock,
    Shield,
    Truck,
    Heart,
    MessageCircle,
    Filter,
    Eye,
    Users,
    Calendar,
    Award,
    CheckCircle,
    ArrowRight,
    ChevronDown,
    Phone,
    Mail,
    Share2,
    Flag,
} from "lucide-react";
import { Navbar } from "@/Components/BuyerPage/Navbar";
import { Footer } from "@/Components/BuyerPage/Footer";

export default function SellerShop() {
    // Mock data (replace with server data)
    const seller = {
        profileImage: "https://via.placeholder.com/150",
        bannerImage: "image/shopping_banner.jpg",
        shopName: "Gemilang Store",
        shopDescription:
            "Your one-stop store for fashion, electronics & more! Premium quality products with guaranteed satisfaction.",
        address: "12 Jalan Bukit, Kuala Lumpur, Malaysia",
        totalSales: 342,
        rating: 4.6,
        joinDate: "Jan 2024",
        responseRate: "98%",
        responseTime: "Within hours",
        followers: 1250,
        following: 342,
        productsCount: 89,
        categories: ["Electronics", "Fashion", "Home", "Books", "Accessories"],
        promotions: [
            {
                id: 1,
                title: "Flash Sale",
                discount: "Up to 50% Off",
                image: "https://via.placeholder.com/300x150",
                endsIn: "02:15:33",
                bgColor: "bg-gradient-to-r from-red-500 to-orange-500",
            },
            {
                id: 2,
                title: "New Arrivals",
                discount: "Latest Trends In Store",
                image: "https://via.placeholder.com/300x150",
                bgColor: "bg-gradient-to-r from-blue-500 to-purple-500",
            },
            {
                id: 3,
                title: "Free Shipping",
                discount: "On orders above RM100",
                image: "https://via.placeholder.com/300x150",
                bgColor: "bg-gradient-to-r from-green-500 to-teal-500",
            },
        ],
        products: [
            {
                id: 1,
                name: "Wireless Noise Cancelling Headphones",
                price: 129.99,
                originalPrice: 159.99,
                image: "https://via.placeholder.com/300",
                stock: 10,
                status: "In Stock",
                category: "Electronics",
                rating: 4.5,
                reviews: 120,
                sold: 120,
                discount: 19,
            },
            {
                id: 2,
                name: "Premium Cotton T-Shirt",
                price: 49.99,
                image: "https://via.placeholder.com/300",
                stock: 0,
                status: "Out of Stock",
                category: "Fashion",
                rating: 4.2,
                reviews: 80,
                sold: 80,
            },
            {
                id: 3,
                name: "Smart Watch Series 5",
                price: 229.99,
                originalPrice: 279.99,
                image: "https://via.placeholder.com/300",
                stock: 5,
                status: "In Stock",
                category: "Electronics",
                rating: 4.7,
                reviews: 210,
                sold: 210,
                discount: 18,
            },
            {
                id: 4,
                name: "Designer Denim Jacket",
                price: 159.0,
                image: "https://via.placeholder.com/300",
                stock: 3,
                status: "In Stock",
                category: "Fashion",
                rating: 4.4,
                reviews: 64,
                sold: 64,
            },
            {
                id: 5,
                name: "Modern Table Lamp",
                price: 79.5,
                image: "https://via.placeholder.com/300",
                stock: 14,
                status: "In Stock",
                category: "Home",
                rating: 4.1,
                reviews: 33,
                sold: 33,
            },
            {
                id: 6,
                name: "Bluetooth Speaker",
                price: 99.0,
                originalPrice: 129.0,
                image: "https://via.placeholder.com/300",
                stock: 8,
                status: "In Stock",
                category: "Electronics",
                rating: 4.6,
                reviews: 152,
                sold: 152,
                discount: 23,
            },
            {
                id: 7,
                name: "Bestseller Novel",
                price: 19.9,
                image: "https://via.placeholder.com/300",
                stock: 20,
                status: "In Stock",
                category: "Books",
                rating: 4.0,
                reviews: 41,
                sold: 41,
            },
            {
                id: 8,
                name: "Abstract Wall Painting",
                price: 129.0,
                image: "https://via.placeholder.com/300",
                stock: 1,
                status: "In Stock",
                category: "Home",
                rating: 4.3,
                reviews: 12,
                sold: 12,
            },
            {
                id: 9,
                name: "Premium Sneakers",
                price: 199.0,
                image: "https://via.placeholder.com/300",
                stock: 0,
                status: "Out of Stock",
                category: "Fashion",
                rating: 4.5,
                reviews: 88,
                sold: 88,
            },
        ],
        reviews: [
            {
                id: 1,
                user: "Alice Johnson",
                rating: 5,
                comment:
                    "Great products and fast shipping! Will definitely buy again.",
                date: "2 days ago",
                verified: true,
            },
            {
                id: 2,
                user: "Bob Smith",
                rating: 4,
                comment: "Good quality items. Reasonable prices.",
                date: "1 week ago",
                verified: true,
            },
            {
                id: 3,
                user: "Charlie Brown",
                rating: 5,
                comment:
                    "Excellent customer service. Highly recommend this shop!",
                date: "3 weeks ago",
                verified: false,
            },
        ],
    };

    // UI State
    const categories = [
        "All",
        "Electronics",
        "Fashion",
        "Home",
        "Books",
        "Accessories",
    ];
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("latest");
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState("products");
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 500]);
    const [ratingFilter, setRatingFilter] = useState(0);
    const pageSize = 9;

    // Filter and sort products
    const filteredProducts = seller.products
        .filter((product) => {
            const matchesCategory =
                selectedCategory === "All" ||
                product.category === selectedCategory;
            const matchesSearch =
                query === "" ||
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.category.toLowerCase().includes(query.toLowerCase());
            const matchesRating =
                ratingFilter === 0 || product.rating >= ratingFilter;
            const matchesPrice =
                product.price >= priceRange[0] &&
                product.price <= priceRange[1];

            return (
                matchesCategory &&
                matchesSearch &&
                matchesRating &&
                matchesPrice
            );
        })
        .sort((a, b) => {
            switch (sort) {
                case "price-asc":
                    return a.price - b.price;
                case "price-desc":
                    return b.price - a.price;
                case "rating":
                    return b.rating - a.rating;
                case "popular":
                    return b.sold - a.sold;
                default:
                    return 0; // latest - keep original order
            }
        });

    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const currentProducts = filteredProducts.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [selectedCategory, query, sort, ratingFilter, priceRange]);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />

            {/* Shop Banner */}
            <div className="relative h-64 w-full mt-20">
                <img
                    src={seller.bannerImage}
                    alt="Shop banner"
                    className="w-full max-h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>

                {/* Shop Info Card */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-full max-w-6xl px-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <img
                                src={seller.profileImage}
                                alt={seller.shopName}
                                className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-1">
                                <Shield size={16} />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {seller.shopName}
                                </h1>
                                <div className="flex items-center justify-center gap-4">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        <MessageCircle size={16} />
                                        Contact
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                                        <Heart size={16} />
                                        Follow
                                    </button>
                                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                                        <Share2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <p className="mt-2 text-gray-600">
                                {seller.shopDescription}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    {seller.address}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star
                                        className="text-yellow-400 fill-current"
                                        size={14}
                                    />
                                    {seller.rating} • {seller.totalSales} sales
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    Joined {seller.joinDate}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 mt-32 max-w-6xl mx-auto w-full px-4 pb-12">
                {/* Navigation Tabs */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab("products")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "products"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            Products ({seller.productsCount})
                        </button>
                        <button
                            onClick={() => setActiveTab("about")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "about"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            About
                        </button>
                        <button
                            onClick={() => setActiveTab("reviews")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "reviews"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            Reviews ({seller.reviews.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("policies")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "policies"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            Policies
                        </button>
                    </nav>
                </div>

                {/* Promotional Banners */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {seller.promotions.map((promo) => (
                        <div
                            key={promo.id}
                            className={`${promo.bgColor} rounded-xl text-white p-5 flex flex-col justify-between h-40`}
                        >
                            <div>
                                <h3 className="font-bold text-lg">
                                    {promo.title}
                                </h3>
                                <p className="text-sm mt-1">{promo.discount}</p>
                            </div>
                            {promo.endsIn && (
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-sm">Ends in</span>
                                    <span className="font-mono font-bold">
                                        {promo.endsIn}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Products Tab */}
                {activeTab === "products" && (
                    <>
                        {/* Filters and Search */}
                        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1 relative">
                                    <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                        size={20}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={query}
                                        onChange={(e) =>
                                            setQuery(e.target.value)
                                        }
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() =>
                                            setShowFilters(!showFilters)
                                        }
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        <Filter size={18} />
                                        Filters
                                    </button>

                                    <select
                                        value={sort}
                                        onChange={(e) =>
                                            setSort(e.target.value)
                                        }
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="latest">Latest</option>
                                        <option value="price-asc">
                                            Price: Low to High
                                        </option>
                                        <option value="price-desc">
                                            Price: High to Low
                                        </option>
                                        <option value="rating">
                                            Top Rated
                                        </option>
                                        <option value="popular">
                                            Most Popular
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {/* Expanded Filters */}
                            {showFilters && (
                                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Price Range
                                        </label>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-500">
                                                RM {priceRange[0]}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                RM {priceRange[1]}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="500"
                                            value={priceRange[1]}
                                            onChange={(e) =>
                                                setPriceRange([
                                                    priceRange[0],
                                                    parseInt(e.target.value),
                                                ])
                                            }
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rating
                                        </label>
                                        <div className="space-y-2">
                                            {[4, 3, 2, 1].map((rating) => (
                                                <label
                                                    key={rating}
                                                    className="flex items-center"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="rating"
                                                        checked={
                                                            ratingFilter ===
                                                            rating
                                                        }
                                                        onChange={() =>
                                                            setRatingFilter(
                                                                ratingFilter ===
                                                                    rating
                                                                    ? 0
                                                                    : rating
                                                            )
                                                        }
                                                        className="text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">
                                                        {rating}+ Stars
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {categories.map((category) => (
                                                <label
                                                    key={category}
                                                    className="flex items-center"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="category"
                                                        checked={
                                                            selectedCategory ===
                                                            category
                                                        }
                                                        onChange={() =>
                                                            setSelectedCategory(
                                                                category
                                                            )
                                                        }
                                                        className="text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">
                                                        {category}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Category Pills */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() =>
                                        setSelectedCategory(category)
                                    }
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        selectedCategory === category
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* Products Grid */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {selectedCategory === "All"
                                        ? "All Products"
                                        : selectedCategory}
                                </h2>
                                <span className="text-sm text-gray-500">
                                    {filteredProducts.length} products found
                                </span>
                            </div>

                            {currentProducts.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                    <Search
                                        size={48}
                                        className="mx-auto text-gray-300 mb-4"
                                    />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        No products found
                                    </h3>
                                    <p className="text-gray-500">
                                        Try adjusting your search or filter
                                        criteria
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {currentProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition"
                                        >
                                            <div className="relative overflow-hidden">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute top-3 left-3">
                                                    {product.status ===
                                                    "In Stock" ? (
                                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                            In Stock
                                                        </span>
                                                    ) : (
                                                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                                            Out of Stock
                                                        </span>
                                                    )}
                                                </div>
                                                {product.discount && (
                                                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                        -{product.discount}%
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300"></div>
                                            </div>

                                            <div className="p-4">
                                                <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                                                    {product.name}
                                                </h3>

                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex items-center">
                                                        {[...Array(5)].map(
                                                            (_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={14}
                                                                    className={`${
                                                                        i <
                                                                        Math.floor(
                                                                            product.rating
                                                                        )
                                                                            ? "text-yellow-400 fill-current"
                                                                            : "text-gray-300"
                                                                    }`}
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        ({product.reviews})
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between mt-3">
                                                    <div>
                                                        <p className="text-lg font-bold text-blue-600">
                                                            RM{" "}
                                                            {product.price.toFixed(
                                                                2
                                                            )}
                                                        </p>
                                                        {product.originalPrice && (
                                                            <p className="text-sm text-gray-400 line-through">
                                                                RM{" "}
                                                                {product.originalPrice.toFixed(
                                                                    2
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {product.sold} sold
                                                    </span>
                                                </div>

                                                <div className="mt-4 flex gap-2">
                                                    <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                                        Add to Cart
                                                    </button>
                                                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                                                        <Heart size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-8">
                                    <button
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                        className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        <ChevronLeft size={16} />
                                        Previous
                                    </button>

                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => i + 1
                                    ).map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-10 h-10 rounded-lg text-sm ${
                                                page === pageNum
                                                    ? "bg-blue-600 text-white"
                                                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === totalPages}
                                        className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Next
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* About Tab */}
                {activeTab === "about" && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-6">
                            About {seller.shopName}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-medium mb-4">
                                    Shop Information
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <MapPin
                                            className="text-gray-400"
                                            size={20}
                                        />
                                        <div>
                                            <p className="font-medium">
                                                Address
                                            </p>
                                            <p className="text-gray-600">
                                                {seller.address}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Clock
                                            className="text-gray-400"
                                            size={20}
                                        />
                                        <div>
                                            <p className="font-medium">
                                                Business Hours
                                            </p>
                                            <p className="text-gray-600">
                                                Mon-Sat: 9AM-6PM
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Users
                                            className="text-gray-400"
                                            size={20}
                                        />
                                        <div>
                                            <p className="font-medium">
                                                Followers
                                            </p>
                                            <p className="text-gray-600">
                                                {seller.followers.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium mb-4">
                                    Performance
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span>Response Rate</span>
                                        <span className="font-semibold text-green-600">
                                            {seller.responseRate}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span>Response Time</span>
                                        <span className="font-semibold">
                                            {seller.responseTime}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span>Joined Date</span>
                                        <span className="font-semibold">
                                            {seller.joinDate}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="font-medium mb-4">
                                Shop Categories
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {seller.categories.map((category) => (
                                    <span
                                        key={category}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                    >
                                        {category}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-6">
                            Customer Reviews
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            <div className="text-center p-6 bg-gray-50 rounded-lg">
                                <div className="text-4xl font-bold text-blue-600">
                                    {seller.rating}
                                </div>
                                <div className="flex justify-center mt-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={20}
                                            className={`${
                                                i < Math.floor(seller.rating)
                                                    ? "text-yellow-400 fill-current"
                                                    : "text-gray-300"
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-gray-600 mt-2">
                                    Based on {seller.reviews.length} reviews
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <h3 className="font-medium mb-4">
                                    Rating Distribution
                                </h3>
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <div
                                        key={rating}
                                        className="flex items-center gap-3 mb-2"
                                    >
                                        <span className="w-8 text-sm text-gray-600">
                                            {rating} star
                                        </span>
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-400"
                                                style={{
                                                    width: `${
                                                        (rating / 5) * 100
                                                    }%`,
                                                }}
                                            ></div>
                                        </div>
                                        <span className="w-8 text-sm text-gray-600">
                                            {((rating / 5) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {seller.reviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="border-b pb-6 last:border-b-0 last:pb-0"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {review.user.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <h4 className="font-medium">
                                                    {review.user}
                                                </h4>
                                                {review.verified && (
                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                        Verified Purchase
                                                    </span>
                                                )}
                                                <span className="text-sm text-gray-500">
                                                    {review.date}
                                                </span>
                                            </div>
                                            <div className="flex text-yellow-400 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={16}
                                                        className={`${
                                                            i < review.rating
                                                                ? "fill-current"
                                                                : ""
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-gray-700">
                                                {review.comment}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Policies Tab */}
                {activeTab === "policies" && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-6">
                            Shop Policies
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border border-gray-200 rounded-lg p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <Truck
                                        className="text-blue-600"
                                        size={24}
                                    />
                                    <h3 className="font-medium">
                                        Shipping Policy
                                    </h3>
                                </div>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li>
                                        • Free shipping for orders above RM100
                                    </li>
                                    <li>
                                        • Processing time: 1-2 business days
                                    </li>
                                    <li>• Delivery time: 3-5 business days</li>
                                    <li>
                                        • Track your order with provided
                                        tracking number
                                    </li>
                                </ul>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <RotateCcw
                                        className="text-blue-600"
                                        size={24}
                                    />
                                    <h3 className="font-medium">
                                        Return Policy
                                    </h3>
                                </div>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li>• 7 days return policy</li>
                                    <li>
                                        • Items must be unused and in original
                                        packaging
                                    </li>
                                    <li>
                                        • Return shipping fee borne by buyer
                                    </li>
                                    <li>
                                        • Refund processed within 3 business
                                        days
                                    </li>
                                </ul>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <Shield
                                        className="text-blue-600"
                                        size={24}
                                    />
                                    <h3 className="font-medium">
                                        Warranty Policy
                                    </h3>
                                </div>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li>
                                        • 1 year manufacturer warranty for
                                        electronics
                                    </li>
                                    <li>
                                        • 30 days warranty for other products
                                    </li>
                                    <li>
                                        • Warranty covers manufacturing defects
                                        only
                                    </li>
                                    <li>• Contact us for warranty claims</li>
                                </ul>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <Phone
                                        className="text-blue-600"
                                        size={24}
                                    />
                                    <h3 className="font-medium">
                                        Contact Information
                                    </h3>
                                </div>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li>• Email: support@gemilangstore.com</li>
                                    <li>• Phone: +60 12 345 6789</li>
                                    <li>• Response time: Within 24 hours</li>
                                    <li>• Business hours: Mon-Sat, 9AM-6PM</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Trust Badges */}
                <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
                    <h2 className="text-lg font-semibold mb-6 text-center">
                        Why Shop With Us
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Shield className="text-blue-600" size={24} />
                            </div>
                            <h3 className="font-medium text-sm">
                                Secure Payment
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                                100% secure payment
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CheckCircle
                                    className="text-green-600"
                                    size={24}
                                />
                            </div>
                            <h3 className="font-medium text-sm">
                                Quality Products
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                                Premium quality guarantee
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Truck className="text-purple-600" size={24} />
                            </div>
                            <h3 className="font-medium text-sm">
                                Fast Shipping
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                                Free shipping over RM100
                            </p>
                        </div>

                        <div className="text-center">
                            {/* <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Headphones
                                    className="text-orange-600"
                                    size={24}
                                />
                            </div> */}
                            <h3 className="font-medium text-sm">
                                24/7 Support
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                                Dedicated customer support
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
