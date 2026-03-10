import { useState, useEffect, useCallback, useMemo } from "react";
import {
    FaTimes,
    FaCamera,
    FaSearch,
    FaSpinner,
    FaExclamationTriangle,
} from "react-icons/fa";

import { ProductCard } from "@/Components/BuyerPage/ProductCard";

export function CameraSearchModal({
    isOpen,
    onClose,
    searchResults,
    isLoading,
    searchImage,
    save_wishlist,
}) {
    const [displayedResults, setDisplayedResults] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const resultsPerPage = 8;

    const safeSearchResults = useMemo(() => {
        // Handle the actual response structure from your backend
        const results = searchResults?.recommendations;

        // Check if we have recommendations array
        const recommendations = results;

        if (!recommendations || !Array.isArray(recommendations)) {
            return [];
        }

        // Transform the data to match ProductCard expectations
        const processedResults = recommendations
            .map((item, index) => {
                // Check similarity score - only include if above threshold
                const similarity = item.similarity || 0;
                const similarityThreshold = results.similarity_threshold || 0.7;

                if (similarity < similarityThreshold) {
                    return null;
                }

                // Use the actual product data from the response
                const productData = item || {};

                return {
                    product_id: productData.product_id || `ai-${index}`,
                    product_name:
                        item.name ||
                        productData.product_name ||
                        "Unnamed Product",
                    product_price: productData.product_price || item.price || 0,
                    product_quantity: productData.product_quantity || 1,
                    category: productData.category || "No Category",
                    product_status: productData.product_status || "available",
                    product_variant: productData.product_variant || [],
                    product_image: productData.main_image,
                    product_total_ratings: productData.total_ratings || 0,
                    seller: productData.seller || {
                        seller_store: {
                            store_name:
                                productData.seller?.store_name ||
                                "AI Recommended",
                        },
                    },
                    ratings: productData.ratings.length || 0,
                };
            })
            .filter(Boolean); // Remove null items (those below threshold)

        return processedResults;
    }, [searchResults]);

    // Reset when modal opens/closes or new search results come in
    useEffect(() => {
        if (isOpen && safeSearchResults.length > 0) {
            setDisplayedResults(safeSearchResults.slice(0, resultsPerPage));
            setPage(1);
            setHasMore(safeSearchResults.length > resultsPerPage);
        } else {
            setDisplayedResults([]);
            setPage(1);
            setHasMore(true);
        }
    }, [isOpen, safeSearchResults]);

    // Infinite scroll handler
    const loadMore = useCallback(() => {
        if (!hasMore || isLoading) return;

        const nextPage = page + 1;
        const endIndex = nextPage * resultsPerPage;
        const newResults = safeSearchResults.slice(0, endIndex);

        setDisplayedResults(newResults);
        setPage(nextPage);
        setHasMore(endIndex < safeSearchResults.length);
    }, [page, hasMore, safeSearchResults, isLoading, resultsPerPage]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (!hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        const sentinel = document.getElementById("scroll-sentinel");
        if (sentinel) {
            observer.observe(sentinel);
        }

        return () => {
            if (sentinel) {
                observer.unobserve(sentinel);
            }
        };
    }, [loadMore, hasMore]);

    // Get search metrics for display
    const searchMetrics = searchResults?.data?.search_metrics || {};
    const detectedCategory = searchResults?.data?.detected_category;
    const categoryConfidence = searchResults?.data?.category_confidence;
    const topSimilarity = searchResults?.data?.top_similarity;
    const similarityThreshold =
        searchResults?.data?.similarity_threshold || 0.7;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-green-50 to-blue-50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <FaCamera className="text-green-600 text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                AI Visual Search
                            </h2>
                            <p className="text-sm text-gray-600">
                                {safeSearchResults.length > 0
                                    ? `Found ${safeSearchResults.length} similar items`
                                    : searchResults?.data?.error
                                    ? "No similar products found"
                                    : isLoading
                                    ? "Searching for similar products..."
                                    : "No results found"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FaTimes className="text-gray-500 text-lg" />
                    </button>
                </div>

                {/* Search Image Preview */}
                {searchImage && (
                    <div className="p-4 border-b border-gray-100 bg-white">
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <img
                                    src={URL.createObjectURL(searchImage)}
                                    alt="Search reference"
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-600">
                                    {searchResults?.data?.error
                                        ? searchResults.data.error
                                        : "Searching for items similar to your image..."}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                    <FaSearch className="text-green-500 text-xs" />
                                    <span className="text-xs text-gray-500">
                                        AI-powered visual search
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Metrics */}
                {searchResults && !isLoading && !searchResults.data?.error && (
                    <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
                        <div className="flex flex-wrap gap-4 text-xs text-blue-700">
                            {detectedCategory && (
                                <span>
                                    Detected:{" "}
                                    <strong>{detectedCategory}</strong>
                                    {categoryConfidence && (
                                        <span className="ml-1">
                                            (
                                            {Math.round(
                                                categoryConfidence * 100
                                            )}
                                            % confidence)
                                        </span>
                                    )}
                                </span>
                            )}
                            {topSimilarity && (
                                <span>
                                    Best Match:{" "}
                                    <strong>
                                        {Math.round(topSimilarity * 100)}%
                                    </strong>
                                </span>
                            )}
                            {searchMetrics.total_products_searched && (
                                <span>
                                    Searched:{" "}
                                    <strong>
                                        {searchMetrics.total_products_searched}{" "}
                                        products
                                    </strong>
                                </span>
                            )}
                            {safeSearchResults.length > 0 && (
                                <span>
                                    Matches Found:{" "}
                                    <strong>
                                        {safeSearchResults.length} items
                                    </strong>
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        // Loading State
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                            <p className="text-gray-600 mb-2">
                                Analyzing your image...
                            </p>
                            <p className="text-sm text-gray-500 text-center max-w-md">
                                Our AI is searching through thousands of
                                products to find the best matches for you.
                            </p>
                        </div>
                    ) : searchResults?.data?.error ? (
                        // No Results State (below similarity threshold)
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <div className="bg-yellow-100 p-4 rounded-full mb-4">
                                <FaExclamationTriangle className="text-yellow-600 text-2xl" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No Similar Items Found
                            </h3>
                            <p className="text-gray-600 text-center max-w-md mb-4">
                                {searchResults.data.error}
                            </p>
                            {searchResults.data.closest_match_similarity && (
                                <p className="text-sm text-gray-500 mb-6">
                                    Closest match:{" "}
                                    {Math.round(
                                        searchResults.data
                                            .closest_match_similarity * 100
                                    )}
                                    % similarity (needs{" "}
                                    {Math.round(similarityThreshold * 100)}% to
                                    show results)
                                </p>
                            )}
                            <div className="flex space-x-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Try Different Image
                                </button>
                                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                    Use Text Search
                                </button>
                            </div>
                        </div>
                    ) : safeSearchResults.length === 0 ? (
                        // No results but no error
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <div className="bg-gray-100 p-4 rounded-full mb-4">
                                <FaSearch className="text-gray-500 text-2xl" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No Matching Products Found
                            </h3>
                            <p className="text-gray-600 text-center max-w-md mb-6">
                                We found products but none met the{" "}
                                {Math.round(similarityThreshold * 100)}%
                                similarity threshold. Try uploading a clearer
                                image.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Try Different Image
                                </button>
                                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                    Use Text Search
                                </button>
                            </div>
                        </div>
                    ) : (
                        // ✅ RESULTS GRID - This should now display your products
                        <div className="p-6">
                            {/* Results Info */}
                            <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-y-3">
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <FaSearch className="text-xs" />
                                    <span>Sorted by AI similarity</span>
                                </div>
                            </div>

                            {/* Products Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {displayedResults.map((product) => {
                                    return (
                                        <ProductCard
                                            key={product.product_id}
                                            product={product}
                                            isFlashSale={false}
                                            save_wishlist={save_wishlist}
                                        />
                                    );
                                })}
                            </div>

                            {/* Loading More Indicator */}
                            {hasMore &&
                                safeSearchResults.length >
                                    displayedResults.length && (
                                    <div className="flex justify-center py-8">
                                        <div className="flex items-center space-x-3 text-gray-500">
                                            <FaSpinner className="animate-spin" />
                                            <span>
                                                Loading more products...
                                            </span>
                                        </div>
                                    </div>
                                )}

                            {/* Scroll Sentinel for Infinite Scroll */}
                            <div id="scroll-sentinel" className="h-1" />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-center items-center text-sm text-gray-600">
                        <span>Powered by AI Visual Search</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
