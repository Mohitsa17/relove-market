import { ToggleLeft, ToggleRight } from "lucide-react";

export function ListingToggleButton({
    product,
    toggleProductListing,
    togglingProduct,
}) {
    return (
        <button
            onClick={() => toggleProductListing(product)}
            disabled={togglingProduct === product.product_id}
            className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                product.product_status === "available"
                    ? "bg-green-100 text-green-800 hover:bg-green-200 border border-green-300"
                    : "bg-red-100 text-red-800 hover:bg-red-200 border border-red-300"
            } ${
                togglingProduct === product.product_id
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:scale-105"
            }`}
            title={`Click to ${
                product.product_status === "available" ? "unavailable" : "available"
            } product`}
        >
            {togglingProduct === product.product_id ? (
                <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full mr-1"></div>
            ) : product.product_status === "available" ? (
                <ToggleRight size={14} className="mr-1" />
            ) : (
                <ToggleLeft size={14} className="mr-1" />
            )}
            <span className="font-medium">
                {product.product_status === "available" ? "Available" : "Unavailable"}
            </span>
        </button>
    );
}
