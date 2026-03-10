import React from "react";

export function FilterModal({
    expandedFilters,
    list_categoryItem,
    priceRange,
    categoryCounts,
    selectedCategories,
    selectedConditions,
    handlePriceInputChange,
    toggleCategory,
    toggleCondition,
    toggleFilterSection,
    resetFilters,
    fetchProducts,
}) {
    const applyFilters = () => {
        fetchProducts(1);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                    Filters
                </h2>
                <button
                    type="button"
                    onClick={resetFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    Reset
                </button>
            </div>

            {/* Categories */}
            <div>
                <button
                    type="button"
                    onClick={() => toggleFilterSection("categories")}
                    className="w-full flex items-center justify-between text-left mb-2"
                >
                    <span className="font-medium text-gray-800">
                        Categories
                    </span>
                    <span className="text-xs text-gray-500">
                        {expandedFilters.categories ? "Hide" : "Show"}
                    </span>
                </button>
                {expandedFilters.categories && (
                    <div className="space-y-2 max-h-52 overflow-y-auto">
                        {list_categoryItem?.map((category) => (
                            <label
                                key={category.category_id}
                                className="flex items-center justify-between text-sm text-gray-700"
                            >
                                <span className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedCategories.includes(
                                            category.category_name
                                        )}
                                        onChange={() =>
                                            toggleCategory(
                                                category.category_name
                                            )
                                        }
                                    />
                                    {category.category_name}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {categoryCounts?.[category.category_name] ??
                                        0}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Price Range */}
            <div>
                <button
                    type="button"
                    onClick={() => toggleFilterSection("price")}
                    className="w-full flex items-center justify-between text-left mb-2"
                >
                    <span className="font-medium text-gray-800">
                        Price Range (RM)
                    </span>
                    <span className="text-xs text-gray-500">
                        {expandedFilters.price ? "Hide" : "Show"}
                    </span>
                </button>
                {expandedFilters.price && (
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <input
                                type="number"
                                className="w-1/2 rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                value={priceRange[0]}
                                onChange={(e) =>
                                    handlePriceInputChange(0, e.target.value)
                                }
                                placeholder="Min"
                            />
                            <input
                                type="number"
                                className="w-1/2 rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                value={priceRange[1]}
                                onChange={(e) =>
                                    handlePriceInputChange(1, e.target.value)
                                }
                                placeholder="Max"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Condition */}
            <div>
                <button
                    type="button"
                    onClick={() => toggleFilterSection("condition")}
                    className="w-full flex items-center justify-between text-left mb-2"
                >
                    <span className="font-medium text-gray-800">
                        Condition
                    </span>
                    <span className="text-xs text-gray-500">
                        {expandedFilters.condition ? "Hide" : "Show"}
                    </span>
                </button>
                {expandedFilters.condition && (
                    <div className="space-y-2">
                        {["New", "Like New", "Good", "Fair"].map(
                            (condition) => (
                                <label
                                    key={condition}
                                    className="flex items-center gap-2 text-sm text-gray-700"
                                >
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedConditions.includes(
                                            condition
                                        )}
                                        onChange={() =>
                                            toggleCondition(condition)
                                        }
                                    />
                                    {condition}
                                </label>
                            )
                        )}
                    </div>
                )}
            </div>

            <div className="pt-2">
                <button
                    type="button"
                    onClick={applyFilters}
                    className="w-full px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
}

