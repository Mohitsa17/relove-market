import { FaArrowRight, FaExclamationTriangle } from "react-icons/fa";

import { Link } from "@inertiajs/react";

export function NoFeaturedProducts() {
    return (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
            <div className="flex justify-center mb-4">
                <FaExclamationTriangle className="text-4xl text-yellow-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Featured Products Available
            </h3>
            <p className="text-gray-600 mb-4">
                There are currently no featured products. Check back later for
                amazing recommendations!
            </p>
            <Link
                href={route("shopping")}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
            >
                Browse All Products
                <FaArrowRight className="ml-2 text-sm" />
            </Link>
        </div>
    );
}
