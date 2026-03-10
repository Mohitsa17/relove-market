import React from "react";
import { X } from "lucide-react";

export function MobileFilterModal({
    setMobileFiltersOpen,
    list_categoryItem,
    priceRange,
    selectedCategories,
    selectedConditions,
    handlePriceInputChange,
    toggleCategory,
    toggleCondition,
    resetFilters,
    applyFilters,
}) {
    const handleApply = () => {
        applyFilters();
    };

    const handleClose = () => {
        setMobileFiltersOpen(false);
    };

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={handleClose}
            />

            {/* Bottom Sheet */}
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Filters
                    </h3>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="p-2 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {/* Categories */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">
                            Categories
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {list_categoryItem?.map((category) => (
                                <button
                                    key={category.category_id}
                                    type="button"
                                    onClick={() =>
                                        toggleCategory(category.category_name)
                                    }
                                    className={`px-3 py-2 rounded-full text-xs font-medium border ${
                                        selectedCategories.includes(
                                            category.category_name
                                        )
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-gray-100 text-gray-700 border-gray-200"
                                    }`}
                                >
                                    {category.category_name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">
                            Price Range (RM)
                        </h4>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">
                                    Min
                                </label>
                                <input
                                    type="number"
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={priceRange[0]}
                                    onChange={(e) =>
                                        handlePriceInputChange(
                                            0,
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">
                                    Max
                                </label>
                                <input
                                    type="number"
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue500"
                                    value={priceRange[1]}
                                    onChange={(e) =>
                                        handlePriceInputChange(
                                            1,
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* Condition */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">
                            Condition
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {["New", "Like New", "Good", "Fair"].map(
                                (condition) => (
                                    <button
                                        key={condition}
                                        type="button"
                                        onClick={() =>
                                            toggleCondition(condition)
                                        }
                                        className={`px-3 py-2 rounded-full text-xs font-medium border ${
                                            selectedConditions.includes(
                                                condition
                                            )
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-gray-100 text-gray-700 border-gray-200"
                                        }`}
                                    >
                                        {condition}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 bg-white"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleApply}
                        className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}

