import { X, Check } from "lucide-react";

export function MobileVariantsPanel({
    product_info,
    selectedVariant,
    setShowMobileVariants,
    handleVariantSelect,
    getVariantCombinationText,
}) {
    const variants = product_info[0]?.product_variant || [];
    const hasVariants = variants.length > 0;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Select Variant
                    </h2>
                    <button
                        onClick={() => setShowMobileVariants(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Variants List */}
                <div className="p-4 overflow-y-auto">
                    {hasVariants ? (
                        <div className="space-y-3">
                            {variants.map((variant) => (
                                <button
                                    key={variant.variant_id}
                                    onClick={() => {
                                        handleVariantSelect(variant);
                                        setShowMobileVariants(false);
                                    }}
                                    disabled={variant.quantity <= 0}
                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                                        selectedVariant?.variant_id ===
                                        variant.variant_id
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-300 hover:border-gray-400"
                                    } ${
                                        variant.quantity <= 0
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">
                                                {getVariantCombinationText(
                                                    variant
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-sm font-semibold text-gray-700">
                                                    RM {variant.price}
                                                </span>
                                                <span
                                                    className={`text-xs ${
                                                        variant.quantity > 0
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                    }`}
                                                >
                                                    {variant.quantity > 0
                                                        ? `${variant.quantity} available`
                                                        : "Out of stock"}
                                                </span>
                                            </div>
                                        </div>
                                        {selectedVariant?.variant_id ===
                                            variant.variant_id && (
                                            <Check
                                                size={20}
                                                className="text-blue-500 ml-2 flex-shrink-0"
                                            />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                No variants available
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
