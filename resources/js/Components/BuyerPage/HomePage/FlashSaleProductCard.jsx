// Components/BuyerPage/FlashSaleProductCard.jsx
import { FaStar, FaHeart, FaShoppingCart, FaClock } from "react-icons/fa";
import { useState } from "react";
import { Link } from "@inertiajs/react";

export function FlashSaleProductCard({ product, save_wishlist, timeLeft }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    if (!product) return null;

    const { category, discount } = product;
    const currentPrice = product.product_price;
    const originalPrice = product.originalPrice;
    const rating = product.ratings[0]?.rating || 0;
    const isInStock = product.product_quantity > 0;
    const savedAmount = originalPrice
        ? (originalPrice - currentPrice).toFixed(2)
        : null;

    const handleWishlistClick = (e) => {
        e.preventDefault();
        save_wishlist(product.product_id);
        setIsLiked(true);
    };

    return (
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
                        className="absolute top-3 right-3 bg-white hover:bg-gray-50 p-2 rounded-full shadow-md transition-colors duration-200"
                    >
                        <FaHeart
                            className={`w-4 h-4 ${
                                isLiked ? "text-red-500" : "text-gray-600"
                            }`}
                        />
                    </button>

                    {/* Flash Sale Badges */}
                    <div className="absolute top-3 left-3 flex flex-col space-y-2">
                        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            {discount}% OFF
                        </div>
                        <div className="bg-white bg-opacity-95 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded">
                            {category.category_name}
                        </div>
                    </div>

                    {/* Countdown Timer */}
                    {timeLeft && (
                        <div className="absolute bottom-3 left-3 right-3">
                            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center text-red-600 font-semibold">
                                        <FaClock className="mr-1.5" />
                                        <span>Ends in</span>
                                    </div>
                                    <span className="font-mono text-gray-900 font-bold">
                                        {timeLeft}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Info Section */}
            <div className="p-5 flex-grow flex flex-col">
                {/* Product Name */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm md:text-base leading-tight">
                    {product.product_name}
                </h3>

                {/* Rating */}
                <div className="flex items-center mb-3">
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
                    <span className="text-xs text-gray-600 font-medium ml-2">
                        {rating.toFixed(1)}
                    </span>
                </div>

                {/* Price Section */}
                <div className="mb-4">
                    <div className="flex items-baseline space-x-2">
                        <span className="text-xl font-bold text-gray-900">
                            RM {currentPrice}
                        </span>
                        {originalPrice && (
                            <>
                                <span className="text-sm text-gray-500 line-through">
                                    RM {originalPrice}
                                </span>
                                <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                    Save RM {savedAmount}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-2 font-medium">
                        <span>Sold: 72%</span>
                        <span>Available: 12/50</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: "72%" }}
                        ></div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-auto">
                    <Link href={route("product-details", product.product_id)}>
                        <button
                            className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                                !isInStock
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            }`}
                            disabled={!isInStock}
                        >
                            <FaShoppingCart className="w-4 h-4" />
                            <span>
                                {!isInStock ? "Out of Stock" : "Buy Now"}
                            </span>
                        </button>
                    </Link>
                </div>

                {/* Seller Info */}
                <div className="mt-3 text-xs text-gray-500">
                    {product.seller?.seller_store?.store_name || "Seller"}
                </div>
            </div>
        </div>
    );
}
