import React, { useEffect, useState, useRef } from "react";
import {
    X,
    Info,
    Plus,
    Minus,
    Sliders,
    Camera,
    Video,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Trash2,
} from "lucide-react";

export function SellerAddProduct_Modal({
    onAdd,
    list_categories,
    onClose,
    errorField,
    onErrorFieldHandled,
}) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Product fields - removed weight, manufacturer, brand, material, status
    const [productName, setProductName] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [productStatus, setProductStatus] = useState("available");
    const [productCondition, setProductCondition] = useState("");
    const [productCategories, setProductCategories] = useState("");

    const [productOptions, setProductOptions] = useState([
        {
            option_name: "",
            option_values: [],
            newValue: "",
        },
    ]);

    const [productVariants, setProductVariants] = useState([]);
    const [productImages, setProductImages] = useState([]);
    const [productVideos, setProductVideos] = useState([]);

    // Features and specifications
    const [keyFeatures, setKeyFeatures] = useState([""]);
    const [includedItems, setIncludedItems] = useState([""]);

    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Refs for error field focusing
    const productNameRef = useRef(null);
    const productDescriptionRef = useRef(null);
    const productPriceRef = useRef(null);
    const productConditionRef = useRef(null);
    const productCategoriesRef = useRef(null);
    const keyFeaturesRefs = useRef([]);
    const includedItemsRefs = useRef([]);

    // Map error field names to refs
    const fieldRefs = {
        product_name: productNameRef,
        product_description: productDescriptionRef,
        product_price: productPriceRef,
        product_condition: productConditionRef,
        category_id: productCategoriesRef,
    };

    useEffect(() => {
        if (errorField) {
            setTimeout(() => {
                const ref = fieldRefs[errorField];
                if (ref && ref.current) {
                    ref.current.focus();
                    ref.current.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }

                if (errorField.startsWith("key_features")) {
                    const index = parseInt(errorField.match(/\[(\d+)\]/)[1]);
                    if (keyFeaturesRefs.current[index]) {
                        keyFeaturesRefs.current[index].focus();
                        keyFeaturesRefs.current[index].scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        });
                    }
                } else if (errorField.startsWith("included_items")) {
                    const index = parseInt(errorField.match(/\[(\d+)\]/)[1]);
                    if (includedItemsRefs.current[index]) {
                        includedItemsRefs.current[index].focus();
                        includedItemsRefs.current[index].scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        });
                    }
                }

                onErrorFieldHandled();
            }, 100);
        }
    }, [errorField, onErrorFieldHandled]);

    // Generate variants when options change
    const generateVariants = (options) => {
        if (options.length === 0) return [];

        const optionGroups = options
            .filter((opt) => opt.option_name && opt.option_values.length > 0)
            .map((opt) => ({
                name: opt.option_name,
                values: opt.option_values.map((v) => v.value),
            }));

        if (optionGroups.length === 0) return [];

        const generateCombinations = (groups, index = 0, current = {}) => {
            if (index === groups.length) {
                return [current];
            }

            const results = [];
            const currentGroup = groups[index];

            for (const value of currentGroup.values) {
                const combination = {
                    ...current,
                    [currentGroup.name]: value,
                };
                results.push(
                    ...generateCombinations(groups, index + 1, combination)
                );
            }

            return results;
        };

        const combinations = generateCombinations(optionGroups);

        return combinations.map((combination) => {
            const variantKey = Object.values(combination).join("|");
            const existingVariant = productVariants.find(
                (v) => v.variant_key === variantKey
            );

            return {
                variant_key: variantKey,
                combination: combination,
                quantity: existingVariant ? existingVariant.quantity : "0",
                price: existingVariant
                    ? existingVariant.price
                    : productPrice || "0",
            };
        });
    };

    useEffect(() => {
        const newVariants = generateVariants(productOptions);
        setProductVariants(newVariants);
    }, [productOptions]);

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            setIsSubmitting(true);

            const formData = new FormData();

            // Basic product info
            formData.append("product_name", productName);
            formData.append("product_description", productDescription);
            formData.append("product_price", productPrice);
            formData.append("product_status", productStatus);
            formData.append("product_condition", productCondition);
            formData.append("category_id", productCategories);
            formData.append("product_status", "available"); // Default status

            // Add key features
            keyFeatures.forEach((feature, index) => {
                if (feature.trim() !== "") {
                    formData.append(`key_features[${index}]`, feature);
                }
            });

            // Add included items
            includedItems.forEach((item, index) => {
                if (item.trim() !== "") {
                    formData.append(`included_items[${index}]`, item);
                }
            });

            if (productVariants.length > 0) {
                productVariants.forEach((variant, index) => {
                    formData.append(
                        `variants[${index}][combination]`,
                        JSON.stringify(variant.combination)
                    );
                    formData.append(
                        `variants[${index}][quantity]`,
                        variant.quantity || "0"
                    );
                    formData.append(
                        `variants[${index}][price]`,
                        variant.price || productPrice
                    );
                    formData.append(
                        `variants[${index}][variant_key]`,
                        variant.variant_key
                    );
                });
            }

            // Calculate total quantity from variants
            const totalQuantity = productVariants.reduce((total, variant) => {
                return total + parseInt(variant.quantity || "0");
            }, 0);

            formData.append("product_quantity", totalQuantity);

            // Append images
            productImages.forEach((img) => {
                if (img.file) {
                    formData.append("product_image[]", img.file);
                }
            });

            // Append videos
            productVideos.forEach((vid) => {
                if (vid.file) {
                    formData.append("product_video[]", vid.file);
                }
            });

            await onAdd(e, formData);
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const conditionOptions = [
        {
            value: "New",
            label: "Brand New",
            description: "Never used, with original tags and packaging",
        },
        {
            value: "Excellent",
            label: "Excellent",
            description: "Lightly used, well maintained",
        },
        {
            value: "Good",
            label: "Good",
            description: "Normal signs of use, fully functional",
        },
        {
            value: "Fair",
            label: "Fair",
            description: "Visible wear but still functional",
        },
    ];

    const statusOptions = [
        { value: "available", label: "Available", color: "green" },
        { value: "reserved", label: "Reserved", color: "yellow" },
        { value: "sold", label: "Sold", color: "red" },
        { value: "draft", label: "Draft", color: "gray" },
    ];

    const steps = [
        { number: 1, title: "Basic", icon: "📝" },
        { number: 2, title: "Details", icon: "🔍" },
        { number: 3, title: "Features", icon: "⭐" },
        { number: 4, title: "Options", icon: "⚙️" },
        { number: 5, title: "Media", icon: "🖼️" },
        { number: 6, title: "Review", icon: "👀" },
    ];

    const addFeature = () => {
        if (keyFeatures.length < 10) {
            setKeyFeatures([...keyFeatures, ""]);
        }
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...keyFeatures];
        newFeatures[index] = value;
        setKeyFeatures(newFeatures);
    };

    const removeFeature = (index) => {
        if (keyFeatures.length > 1) {
            setKeyFeatures(keyFeatures.filter((_, i) => i !== index));
        }
    };

    const addIncludedItem = () => {
        if (includedItems.length < 10) {
            setIncludedItems([...includedItems, ""]);
        }
    };

    const handleIncludedItemChange = (index, value) => {
        const newItems = [...includedItems];
        newItems[index] = value;
        setIncludedItems(newItems);
    };

    const removeIncludedItem = (index) => {
        if (includedItems.length > 1) {
            setIncludedItems(includedItems.filter((_, i) => i !== index));
        }
    };

    const addProductOption = () => {
        if (productOptions.length < 5) {
            setProductOptions([
                ...productOptions,
                {
                    option_name: "",
                    option_values: [],
                    newValue: "",
                },
            ]);
        }
    };

    const updateProductOptionName = (index, value) => {
        const newOptions = [...productOptions];
        newOptions[index].option_name = value;
        setProductOptions(newOptions);
    };

    const addOptionValue = (index) => {
        const newOptions = [...productOptions];
        const value = newOptions[index].newValue.trim();

        if (
            value !== "" &&
            !newOptions[index].option_values.some((v) => v.value === value)
        ) {
            newOptions[index].option_values.push({
                value: value,
            });
            newOptions[index].newValue = "";
        }
        setProductOptions(newOptions);
    };

    const updateVariantQuantity = (variantKey, quantity) => {
        setProductVariants((prev) =>
            prev.map((variant) =>
                variant.variant_key === variantKey
                    ? { ...variant, quantity }
                    : variant
            )
        );
    };

    const updateVariantPrice = (variantKey, price) => {
        setProductVariants((prev) =>
            prev.map((variant) =>
                variant.variant_key === variantKey
                    ? { ...variant, price }
                    : variant
            )
        );
    };

    const removeOptionValue = (optionIndex, valueIndex) => {
        const newOptions = [...productOptions];
        newOptions[optionIndex].option_values = newOptions[
            optionIndex
        ].option_values.filter((_, i) => i !== valueIndex);
        setProductOptions(newOptions);
    };

    const removeProductOption = (index) => {
        if (productOptions.length > 1) {
            setProductOptions(productOptions.filter((_, i) => i !== index));
        }
    };

    const handleOptionValueKeyDown = (e, index) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addOptionValue(index);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setProductImages((prev) => [...prev, ...newImages]);
    };

    const handleVideoChange = (e) => {
        const files = Array.from(e.target.files);

        if (productVideos.length + files.length > 5) {
            alert("Maximum 5 videos allowed");
            return;
        }

        const newVideos = files
            .map((file) => {
                if (file.size > 50 * 1024 * 1024) {
                    alert(
                        `File ${file.name} is too large. Maximum size is 50MB.`
                    );
                    return null;
                }

                return {
                    file,
                    preview: URL.createObjectURL(file),
                    name: file.name,
                    size: file.size,
                };
            })
            .filter((video) => video !== null);

        setProductVideos((prev) => [...prev, ...newVideos]);
    };

    const removeImage = (index) => {
        setProductImages((prev) => prev.filter((_, i) => i !== index));
    };

    const removeVideo = (index) => {
        setProductVideos((prev) => prev.filter((_, i) => i !== index));
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex(
            (prev) => (prev - 1 + productImages.length) % productImages.length
        );
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 z-10 px-4 sm:px-6 py-3 sm:py-4 border-b bg-gradient-to-r from-indigo-600 to-indigo-700">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-lg sm:text-xl font-semibold text-white">
                                    Add New Product
                                </h2>
                                <p className="text-indigo-100 text-xs sm:text-sm mt-1">
                                    Sell your items easily
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white/80 hover:text-white transition p-1 rounded-lg hover:bg-indigo-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Mobile Stepper */}
                        <div className="flex items-center justify-between mt-3 overflow-x-auto">
                            {steps.map((stepItem, i) => (
                                <div
                                    key={i}
                                    className="flex-1 min-w-[60px] text-center"
                                >
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 mx-auto rounded-full border-2 text-sm ${
                                            step === stepItem.number
                                                ? "bg-white border-white text-indigo-600"
                                                : step > stepItem.number
                                                ? "bg-green-500 border-green-500 text-white"
                                                : "bg-white/20 border-white/30 text-white"
                                        }`}
                                    >
                                        {step > stepItem.number ? (
                                            <CheckCircle size={16} />
                                        ) : (
                                            <span>{stepItem.icon}</span>
                                        )}
                                    </div>
                                    <p
                                        className={`text-xs mt-1 ${
                                            step === stepItem.number
                                                ? "text-white font-medium"
                                                : "text-indigo-100"
                                        }`}
                                    >
                                        {stepItem.title}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4 sm:space-y-6"
                        >
                            {/* Step 1: Basic Info */}
                            {step === 1 && (
                                <div className="space-y-4 sm:space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Product Name *
                                        </label>
                                        <input
                                            ref={productNameRef}
                                            type="text"
                                            value={productName}
                                            onChange={(e) =>
                                                setProductName(e.target.value)
                                            }
                                            placeholder="e.g., Vintage Leather Jacket"
                                            className="text-black w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Be specific and descriptive
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Product Description *
                                        </label>
                                        <textarea
                                            ref={productDescriptionRef}
                                            rows={3}
                                            value={productDescription}
                                            onChange={(e) =>
                                                setProductDescription(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Describe your product in detail including condition, features, and any imperfections..."
                                            className="text-black w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Detailed descriptions attract more
                                            buyers
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Product Details */}
                            {step === 2 && (
                                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category *
                                        </label>
                                        <select
                                            ref={productCategoriesRef}
                                            value={productCategories}
                                            onChange={(e) =>
                                                setProductCategories(
                                                    e.target.value
                                                )
                                            }
                                            className="text-black w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                                            required
                                        >
                                            <option value="">
                                                Select category
                                            </option>
                                            {list_categories.map((category) => (
                                                <option
                                                    key={category.category_id}
                                                    value={category.category_id}
                                                >
                                                    {category.category_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Condition *
                                        </label>
                                        <select
                                            ref={productConditionRef}
                                            value={productCondition}
                                            onChange={(e) =>
                                                setProductCondition(
                                                    e.target.value
                                                )
                                            }
                                            className="text-black w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                                            required
                                        >
                                            <option value="">
                                                Select condition
                                            </option>
                                            {conditionOptions.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        {productCondition && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {
                                                    conditionOptions.find(
                                                        (opt) =>
                                                            opt.value ===
                                                            productCondition
                                                    )?.description
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Price (RM) *
                                        </label>
                                        <input
                                            ref={productPriceRef}
                                            type="text"
                                            value={productPrice}
                                            onChange={(e) =>
                                                setProductPrice(e.target.value)
                                            }
                                            placeholder="0.00"
                                            className="text-black w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status *
                                        </label>
                                        <select
                                            value={productStatus}
                                            onChange={(e) =>
                                                setProductStatus(e.target.value)
                                            }
                                            className="text-black w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                                        >
                                            {statusOptions.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Set the availability status of your
                                            product
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Features */}
                            {step === 3 && (
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                                        <div className="flex items-start">
                                            <Info
                                                className="text-blue-500 mt-0.5 mr-2 flex-shrink-0"
                                                size={18}
                                            />
                                            <p className="text-sm text-blue-700">
                                                Add detailed specifications to
                                                help buyers make informed
                                                decisions
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Key Features *
                                        </label>
                                        <div className="space-y-2">
                                            {keyFeatures.map(
                                                (feature, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <div className="w-6 text-sm text-gray-500 font-medium">
                                                            {index + 1}.
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={feature}
                                                            onChange={(e) =>
                                                                handleFeatureChange(
                                                                    index,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder={`Feature ${
                                                                index + 1
                                                            }`}
                                                            className="text-black flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                            ref={(el) =>
                                                                (keyFeaturesRefs.current[
                                                                    index
                                                                ] = el)
                                                            }
                                                        />
                                                        {keyFeatures.length >
                                                            1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeFeature(
                                                                        index
                                                                    )
                                                                }
                                                                className="p-1 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                                                            >
                                                                <Minus
                                                                    size={16}
                                                                />
                                                            </button>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                        {keyFeatures.length < 10 && (
                                            <button
                                                type="button"
                                                onClick={addFeature}
                                                className="mt-3 flex items-center text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                                            >
                                                <Plus
                                                    size={16}
                                                    className="mr-1"
                                                />
                                                Add Feature
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            What's Included
                                        </label>
                                        <div className="space-y-2">
                                            {includedItems.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <div className="w-6 text-sm text-gray-500">
                                                            •
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={item}
                                                            onChange={(e) =>
                                                                handleIncludedItemChange(
                                                                    index,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder={`Included item ${
                                                                index + 1
                                                            }`}
                                                            className="text-black flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                            ref={(el) =>
                                                                (includedItemsRefs.current[
                                                                    index
                                                                ] = el)
                                                            }
                                                        />
                                                        {includedItems.length >
                                                            1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeIncludedItem(
                                                                        index
                                                                    )
                                                                }
                                                                className="p-1 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                                                            >
                                                                <Minus
                                                                    size={16}
                                                                />
                                                            </button>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                        {includedItems.length < 10 && (
                                            <button
                                                type="button"
                                                onClick={addIncludedItem}
                                                className="mt-3 flex items-center text-gray-600 hover:text-gray-700 font-medium text-sm"
                                            >
                                                <Plus
                                                    size={16}
                                                    className="mr-1"
                                                />
                                                Add Item
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Options */}
                            {step === 4 && (
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                                        <div className="flex items-start">
                                            <Sliders
                                                className="text-blue-500 mt-0.5 mr-2 flex-shrink-0"
                                                size={18}
                                            />
                                            <div>
                                                <p className="text-sm text-blue-700 font-medium mb-1">
                                                    Product Variants
                                                </p>
                                                <p className="text-xs text-blue-600">
                                                    Add options like Color,
                                                    Size, etc. Set individual
                                                    quantities and prices for
                                                    each variant.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Options Configuration */}
                                    <div className="space-y-3">
                                        {productOptions.map(
                                            (option, optionIndex) => (
                                                <div
                                                    key={optionIndex}
                                                    className="border rounded-lg p-3 sm:p-4 bg-gray-50"
                                                >
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h4 className="font-semibold text-gray-800 text-sm">
                                                            Option{" "}
                                                            {optionIndex + 1}
                                                        </h4>
                                                        {productOptions.length >
                                                            1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeProductOption(
                                                                        optionIndex
                                                                    )
                                                                }
                                                                className="text-red-600 hover:text-red-800 font-medium text-xs"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Option Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={
                                                                option.option_name
                                                            }
                                                            onChange={(e) =>
                                                                updateProductOptionName(
                                                                    optionIndex,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="e.g., Size, Color"
                                                            className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Option Values *
                                                        </label>

                                                        {/* Display existing option values */}
                                                        <div className="space-y-2 mb-2">
                                                            {option.option_values.map(
                                                                (
                                                                    value,
                                                                    valueIndex
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            valueIndex
                                                                        }
                                                                        className="flex items-center gap-2 bg-white p-2 rounded-lg border text-sm"
                                                                    >
                                                                        <div className="flex-1">
                                                                            <span className="font-medium text-gray-700">
                                                                                {
                                                                                    value.value
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                removeOptionValue(
                                                                                    optionIndex,
                                                                                    valueIndex
                                                                                )
                                                                            }
                                                                            className="text-red-500 hover:text-red-700 p-1"
                                                                        >
                                                                            <Trash2
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>

                                                        {/* Add new option value */}
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={
                                                                    option.newValue
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const newOptions =
                                                                        [
                                                                            ...productOptions,
                                                                        ];
                                                                    newOptions[
                                                                        optionIndex
                                                                    ].newValue =
                                                                        e.target.value;
                                                                    setProductOptions(
                                                                        newOptions
                                                                    );
                                                                }}
                                                                onKeyDown={(
                                                                    e
                                                                ) =>
                                                                    handleOptionValueKeyDown(
                                                                        e,
                                                                        optionIndex
                                                                    )
                                                                }
                                                                placeholder="Option value"
                                                                className="text-black flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    addOptionValue(
                                                                        optionIndex
                                                                    )
                                                                }
                                                                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm"
                                                            >
                                                                Add
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    {productOptions.length < 5 && (
                                        <button
                                            type="button"
                                            onClick={addProductOption}
                                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-indigo-600 hover:border-indigo-400 flex items-center justify-center text-sm"
                                        >
                                            <Plus size={16} className="mr-2" />
                                            Add Another Option
                                        </button>
                                    )}

                                    {/* Variants Display */}
                                    {productVariants.length > 0 && (
                                        <div className="mt-6">
                                            <h3 className="text-base font-semibold text-gray-800 mb-3">
                                                Product Variants (
                                                {productVariants.length})
                                            </h3>

                                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                                {productVariants.map(
                                                    (variant, index) => (
                                                        <div
                                                            key={
                                                                variant.variant_key
                                                            }
                                                            className="border rounded-lg p-3 bg-white"
                                                        >
                                                            <div className="mb-2">
                                                                <span className="font-medium text-gray-700 text-sm">
                                                                    Variant{" "}
                                                                    {index + 1}:
                                                                </span>
                                                                <span className="ml-1 text-gray-600 text-sm">
                                                                    {Object.entries(
                                                                        variant.combination
                                                                    )
                                                                        .map(
                                                                            ([
                                                                                key,
                                                                                value,
                                                                            ]) =>
                                                                                `${key}: ${value}`
                                                                        )
                                                                        .join(
                                                                            ", "
                                                                        )}
                                                                </span>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                        Quantity
                                                                        *
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={
                                                                            variant.quantity
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            updateVariantQuantity(
                                                                                variant.variant_key,
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        className="text-black w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                                        placeholder="0"
                                                                        required
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                        Price
                                                                        (RM) *
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={
                                                                            variant.price
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            updateVariantPrice(
                                                                                variant.variant_key,
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        className="text-black w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                                        placeholder="0.00"
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>

                                            <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                                                <p className="text-gray-600">
                                                    Total Stock:{" "}
                                                    {productVariants.reduce(
                                                        (sum, variant) =>
                                                            sum +
                                                            parseInt(
                                                                variant.quantity ||
                                                                    0
                                                            ),
                                                        0
                                                    )}{" "}
                                                    units
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 5: Media */}
                            {step === 5 && (
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                                        <div className="flex items-start">
                                            <Camera
                                                className="text-blue-500 mt-0.5 mr-2 flex-shrink-0"
                                                size={18}
                                            />
                                            <div>
                                                <p className="text-sm text-blue-700 font-medium mb-1">
                                                    Photo Guidelines
                                                </p>
                                                <p className="text-xs text-blue-600">
                                                    Upload clear photos from all
                                                    angles. Include any
                                                    imperfections.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Product Images *
                                        </label>
                                        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
                                            {productImages.map((img, index) => (
                                                <div
                                                    key={index}
                                                    className="relative group aspect-square"
                                                >
                                                    <img
                                                        src={img.preview}
                                                        alt=""
                                                        className="w-full h-full object-cover rounded border cursor-pointer"
                                                        onClick={() => {
                                                            setCurrentImageIndex(
                                                                index
                                                            );
                                                            setIsImagePreviewOpen(
                                                                true
                                                            );
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeImage(index)
                                                        }
                                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition text-xs"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                    {index === 0 && (
                                                        <span className="absolute top-1 left-1 bg-green-500 text-white px-1 py-0.5 rounded text-xs">
                                                            Main
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                            {productImages.length < 12 && (
                                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded hover:border-indigo-400 cursor-pointer p-2 aspect-square">
                                                    <Camera
                                                        className="text-gray-400 mb-1"
                                                        size={20}
                                                    />
                                                    <span className="text-xs text-gray-600 text-center">
                                                        Add Photos
                                                    </span>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={
                                                            handleImageChange
                                                        }
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {productImages.length}/12 photos •
                                            PNG, JPG up to 10MB
                                        </p>
                                    </div>

                                    {/* Video Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Product Videos (Optional)
                                        </label>

                                        {productVideos.length === 0 ? (
                                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded hover:border-indigo-400 cursor-pointer p-4">
                                                <Video
                                                    className="text-gray-400 mb-1"
                                                    size={24}
                                                />
                                                <span className="text-sm text-gray-600 mb-1">
                                                    Add Videos
                                                </span>
                                                <span className="text-xs text-gray-500 text-center">
                                                    Up to 50MB each
                                                </span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="video/*"
                                                    onChange={handleVideoChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-1 gap-3">
                                                    {productVideos.map(
                                                        (video, index) => (
                                                            <div
                                                                key={index}
                                                                className="relative group border rounded overflow-hidden bg-black"
                                                            >
                                                                <video
                                                                    src={
                                                                        video.preview
                                                                    }
                                                                    className="w-full h-32 object-cover"
                                                                    controls
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeVideo(
                                                                            index
                                                                        )
                                                                    }
                                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                                                >
                                                                    <X
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                </button>
                                                            </div>
                                                        )
                                                    )}
                                                </div>

                                                {productVideos.length < 5 && (
                                                    <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded hover:border-indigo-400 cursor-pointer p-3">
                                                        <Plus
                                                            size={16}
                                                            className="text-gray-400 mr-2"
                                                        />
                                                        <span className="text-sm text-gray-600">
                                                            Add More Videos (
                                                            {
                                                                productVideos.length
                                                            }
                                                            /5)
                                                        </span>
                                                        <input
                                                            type="file"
                                                            multiple
                                                            accept="video/*"
                                                            onChange={
                                                                handleVideoChange
                                                            }
                                                            className="hidden"
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 6: Review */}
                            {step === 6 && (
                                <div className="space-y-4 sm:space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                                        Review Your Product
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                                        <div className="space-y-3">
                                            <div>
                                                <h4 className="font-medium text-gray-700 mb-1 text-sm">
                                                    Basic Information
                                                </h4>
                                                <div className="space-y-1 text-sm">
                                                    <p className="text-black">
                                                        <span className="text-gray-500">
                                                            Name:
                                                        </span>{" "}
                                                        {productName}
                                                    </p>
                                                    <p className="text-black">
                                                        <span className="text-gray-500">
                                                            Category:
                                                        </span>{" "}
                                                        {list_categories.find(
                                                            (cat) =>
                                                                cat.category_id ==
                                                                productCategories
                                                        )?.category_name ||
                                                            "Not selected"}
                                                    </p>
                                                    <p className="text-black">
                                                        <span className="text-gray-500">
                                                            Condition:
                                                        </span>{" "}
                                                        {conditionOptions.find(
                                                            (opt) =>
                                                                opt.value ===
                                                                productCondition
                                                        )?.label ||
                                                            "Not selected"}
                                                    </p>
                                                    <p className="text-black">
                                                        <span className="text-gray-500">
                                                            Price:
                                                        </span>{" "}
                                                        RM {productPrice}
                                                    </p>
                                                    <p className="text-black">
                                                        <span className="text-gray-500">
                                                            Status:
                                                        </span>{" "}
                                                        <span
                                                            className={`font-medium ${
                                                                productStatus ===
                                                                "available"
                                                                    ? "text-green-600"
                                                                    : productStatus ===
                                                                      "reserved"
                                                                    ? "text-yellow-600"
                                                                    : productStatus ===
                                                                      "sold"
                                                                    ? "text-red-600"
                                                                    : "text-gray-600"
                                                            }`}
                                                        >
                                                            {
                                                                statusOptions.find(
                                                                    (s) =>
                                                                        s.value ===
                                                                        productStatus
                                                                )?.label
                                                            }
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            {keyFeatures.some(
                                                (f) => f.trim() !== ""
                                            ) && (
                                                <div>
                                                    <h4 className="font-medium text-gray-700 mb-1 text-sm">
                                                        Key Features
                                                    </h4>
                                                    <ul className="list-disc list-inside text-sm space-y-1">
                                                        {keyFeatures
                                                            .filter(
                                                                (f) =>
                                                                    f.trim() !==
                                                                    ""
                                                            )
                                                            .map(
                                                                (
                                                                    feature,
                                                                    i
                                                                ) => (
                                                                    <li
                                                                        key={i}
                                                                        className="text-black"
                                                                    >
                                                                        {
                                                                            feature
                                                                        }
                                                                    </li>
                                                                )
                                                            )}
                                                    </ul>
                                                </div>
                                            )}

                                            {productImages.length > 0 && (
                                                <div>
                                                    <h4 className="font-medium text-gray-700 mb-1 text-sm">
                                                        Media (
                                                        {productImages.length}{" "}
                                                        photos)
                                                    </h4>
                                                    <div className="flex gap-1">
                                                        {productImages
                                                            .slice(0, 3)
                                                            .map((img, i) => (
                                                                <img
                                                                    key={i}
                                                                    src={
                                                                        img.preview
                                                                    }
                                                                    alt=""
                                                                    className="w-12 h-12 object-cover rounded border"
                                                                />
                                                            ))}
                                                        {productImages.length >
                                                            3 && (
                                                            <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                                                                +
                                                                {productImages.length -
                                                                    3}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-green-50 p-3 rounded border border-green-200">
                                        <div className="flex items-start">
                                            <CheckCircle
                                                className="text-green-500 mt-0.5 mr-2 flex-shrink-0"
                                                size={16}
                                            />
                                            <p className="text-sm text-green-700">
                                                Your product is ready to be
                                                listed! Review all information
                                                and click "Publish Product" to
                                                make it live.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Navigation */}
                    <div className="sticky bottom-0 bg-white border-t p-3">
                        <div className="flex justify-between items-center">
                            <div>
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setStep((prev) => prev - 1)
                                        }
                                        className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium text-sm"
                                    >
                                        <ChevronLeft
                                            size={16}
                                            className="inline mr-1"
                                        />
                                        Back
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {step < 6 ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setStep((prev) => prev + 1)
                                        }
                                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium text-sm"
                                    >
                                        Continue
                                        <ChevronRight
                                            size={16}
                                            className="inline ml-1"
                                        />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-medium text-sm"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white inline-block mr-1"></div>
                                                Publishing...
                                            </>
                                        ) : (
                                            "Publish Product"
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Preview Modal */}
            {isImagePreviewOpen && productImages.length > 0 && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-2">
                    <div className="relative w-full max-w-md">
                        <button
                            onClick={() => setIsImagePreviewOpen(false)}
                            className="absolute top-2 right-2 z-10 bg-white/20 text-white p-1 rounded-full hover:bg-white/30"
                        >
                            <X size={20} />
                        </button>

                        <div className="relative">
                            <img
                                src={productImages[currentImageIndex].preview}
                                alt=""
                                className="w-full h-auto max-h-[70vh] object-contain rounded"
                            />

                            {productImages.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/20 text-white p-1 rounded-full hover:bg-white/30"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/20 text-white p-1 rounded-full hover:bg-white/30"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="mt-3 text-center text-white text-sm">
                            Image {currentImageIndex + 1} of{" "}
                            {productImages.length}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
