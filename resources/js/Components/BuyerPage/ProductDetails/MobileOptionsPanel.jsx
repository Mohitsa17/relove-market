import { ChevronLeft, Check } from "lucide-react";

export function MobileOptionsPanel({
    product_info,
    selectedOptions,
    selectedOptionValues,
    setShowMobileOptions,
    handleOptionSelect,
}) {
    return (
        <div className="fixed inset-0 bg-white z-50 lg:hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <button
                    onClick={() => setShowMobileOptions(false)}
                    className="p-2"
                >
                    <ChevronLeft size={24} className="text-black" />
                </button>
                <h2 className="text-lg text-black font-semibold">
                    Select Options
                </h2>
                <div className="w-10"></div>
            </div>

            {/* Options Content */}
            <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-140px)]">
                {product_info[0].product_option.map((optionGroup, index) => (
                    <div key={index} className="space-y-3">
                        <label className="block text-lg text-black font-semibold capitalize">
                            {optionGroup.option_name}
                        </label>

                        <div className="space-y-2">
                            {optionGroup.product_option_value.map((option) => (
                                <button
                                    key={option.value_id}
                                    onClick={() =>
                                        handleOptionSelect(
                                            optionGroup.option_name,
                                            option.value_id,
                                            option.option_value
                                        )
                                    }
                                    disabled={option.quantity < 1}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                        selectedOptions[
                                            optionGroup.option_name
                                        ] === option.value_id
                                            ? "border-blue-500 bg-blue-50 text-blue-700"
                                            : "border-gray-200 text-gray-700"
                                    } ${
                                        option.quantity < 1
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium text-black">
                                                {option.option_value}
                                            </span>
                                            {option.quantity > 0 && (
                                                <span className="text-xs text-gray-500">
                                                    ({option.quantity}{" "}
                                                    available)
                                                </span>
                                            )}
                                        </div>

                                        {selectedOptions[
                                            optionGroup.option_name
                                        ] === option.value_id && (
                                            <Check
                                                size={20}
                                                className="text-blue-500"
                                            />
                                        )}
                                    </div>

                                    {option.quantity < 1 && (
                                        <div className="text-red-500 text-sm mt-1">
                                            Out of stock
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Selected Options Summary */}
                {Object.keys(selectedOptionValues).length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-800 mb-2">
                            Currently Selected:
                        </h3>
                        <div className="space-y-1">
                            {Object.entries(selectedOptionValues).map(
                                ([optionType, value]) => (
                                    <div
                                        key={optionType}
                                        className="flex justify-between"
                                    >
                                        <span className="text-blue-700 font-medium capitalize">
                                            {optionType}:
                                        </span>
                                        <span className="text-blue-600">
                                            {value}
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
                <button
                    onClick={() => setShowMobileOptions(false)}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold"
                >
                    Confirm Selection
                </button>
            </div>
        </div>
    );
}
