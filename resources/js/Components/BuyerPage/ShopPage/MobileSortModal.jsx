import { X } from "lucide-react";

export function MobileSortModal({
    setShowSortOptions,
    sortBy,
    handleSortChange,
}) {
    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={() => setShowSortOptions(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Sort By
                    </h3>
                    <button onClick={() => setShowSortOptions(false)}>
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
                <div className="space-y-4">
                    {[
                        { value: "recommended", label: "Recommended" },
                        { value: "newest", label: "Newest First" },
                        { value: "price-low", label: "Price: Low to High" },
                        { value: "price-high", label: "Price: High to Low" },
                        { value: "rating", label: "Highest Rated" },
                    ].map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSortChange(option.value)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                                sortBy === option.value
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            <span className="font-medium">{option.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
