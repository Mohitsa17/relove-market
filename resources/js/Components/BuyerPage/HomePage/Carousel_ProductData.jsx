import React, { useRef, useState, useEffect } from "react";
import { Link } from "@inertiajs/react";

import { FaArrowLeft, FaArrowRight, FaFire, FaClock } from "react-icons/fa";
import Carousel from "react-multi-carousel";

import "react-multi-carousel/lib/styles.css";

import { ProductCard } from "../ProductCard";

export function Carousel_ProductData({ productData }) {
    // Fallback if productData is empty
    const products = productData && productData.length > 0 ? productData : [];

    // State to track if we have enough items for arrows to work
    const [showArrows, setShowArrows] = useState(true);

    const responsive = {
        superLargeDesktop: {
            breakpoint: { max: 4000, min: 1280 },
            items: 4,
            partialVisibilityGutter: 40,
        },
        desktop: {
            breakpoint: { max: 1280, min: 1024 },
            items: 3,
            partialVisibilityGutter: 30,
        },
        tablet: {
            breakpoint: { max: 1024, min: 640 },
            items: 2,
            partialVisibilityGutter: 20,
        },
        mobile: {
            breakpoint: { max: 640, min: 0 },
            items: 1,
            partialVisibilityGutter: 10,
        },
    };

    const carouselRef = useRef();

    const goToPrevious = () => {
        if (carouselRef.current && products.length > 1) {
            carouselRef.current.previous();
        }
    };

    const goToNext = () => {
        if (carouselRef.current && products.length > 1) {
            carouselRef.current.next();
        }
    };

    // Check if we have enough products to show arrows
    useEffect(() => {
        if (products.length <= 1) {
            setShowArrows(false);
        } else {
            setShowArrows(true);
        }
    }, [products.length]);

    return (
        <section className="py-4 px-4 relative z-0">
            {" "}
            {/* Added z-0 here */}
            <div className="max-w-7xl mx-auto relative z-0">
                {" "}
                {/* Added z-0 here */}
                {/* Header with countdown timer */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div className="flex items-center">
                        <div className="bg-red-600 text-white p-2 rounded-lg mr-4">
                            <FaFire className="text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Flash Sale
                            </h2>
                            <p className="text-red-600 font-medium">
                                Ending in:
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center mt-4 md:mt-0 bg-white px-4 py-2 rounded-lg shadow-sm">
                        <FaClock className="text-red-600 mr-2" />
                        <span className="text-xl font-mono font-bold text-red-600">
                            02:45:18
                        </span>
                    </div>

                    {showArrows && (
                        <div className="hidden md:flex items-center mt-4 md:mt-0">
                            <button
                                onClick={goToPrevious}
                                className="bg-white text-gray-700 p-3 rounded-full shadow-md hover:bg-gray-50 mr-2 transition-all hover:shadow-lg"
                                aria-label="Previous products"
                            >
                                <FaArrowLeft />
                            </button>
                            <button
                                onClick={goToNext}
                                className="bg-white text-gray-700 p-3 rounded-full shadow-md hover:bg-gray-50 transition-all hover:shadow-lg"
                                aria-label="Next products"
                            >
                                <FaArrowRight />
                            </button>
                        </div>
                    )}
                </div>
                {/* Carousel with z-index fix */}
                <div className="relative z-0">
                    {" "}
                    {/* Added z-0 here */}
                    <Carousel
                        ref={carouselRef}
                        responsive={responsive}
                        infinite={products.length > 1}
                        autoPlay={false}
                        arrows={false}
                        renderButtonGroupOutside={true}
                        itemClass="px-2 relative z-0" // Added z-0 here
                        containerClass="pb-6 relative z-0" // Added z-0 here
                        partialVisible={true}
                        keyBoardControl={true}
                        swipeable={true}
                        draggable={true}
                        shouldResetAutoplay={false}
                    >
                        {products.map((product) => (
                            <div
                                key={product.product_id}
                                className="h-full relative z-0"
                            >
                                {" "}
                                {/* Added z-0 here */}
                                <Link
                                    href={route(
                                        "product-details",
                                        product.product_id
                                    )}
                                >
                                    <ProductCard
                                        key={product.product_id}
                                        product={product}
                                        isFlashSale={true}
                                    />
                                </Link>
                            </div>
                        ))}
                    </Carousel>
                    {/* Mobile navigation buttons */}
                    {showArrows && (
                        <div className="flex justify-center mt-4 md:hidden relative z-10">
                            {" "}
                            {/* Added z-10 for buttons */}
                            <button
                                onClick={goToPrevious}
                                className="bg-white text-gray-700 p-3 rounded-full shadow-md hover:bg-gray-50 mr-2"
                                aria-label="Previous products"
                            >
                                <FaArrowLeft />
                            </button>
                            <button
                                onClick={goToNext}
                                className="bg-white text-gray-700 p-3 rounded-full shadow-md hover:bg-gray-50"
                                aria-label="Next products"
                            >
                                <FaArrowRight />
                            </button>
                        </div>
                    )}
                </div>
                {/* View all button */}
                <div className="text-center mt-8 relative z-0">
                    {" "}
                    {/* Added z-0 here */}
                    <Link href="#">
                        <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-medium transition-colors shadow-md hover:shadow-lg">
                            View All Flash Sale Items
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
