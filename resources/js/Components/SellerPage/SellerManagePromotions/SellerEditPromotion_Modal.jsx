import React, { useEffect, useState } from "react";

import { X, Percent, Calendar, Tag } from "lucide-react";

export function SellerEditPromotion_Modal({ promotion, onEdit, onClose }) {
    const promo = promotion;

    const [promotionName, setPromotionName] = useState("");
    const [promotionDiscount, setPromotionDiscount] = useState("");
    const [promotionType, setPromotionType] = useState("");
    const [promotionStartDate, setPromotionStartDate] = useState("");
    const [promotionEndDate, setPromotionEndDate] = useState("");
    const [promotionStatus, setPromotionStatus] = useState("");
    const [promotionUsage, setPromotionUsage] = useState("");
    const [promotionBadge, setPromotionBadge] = useState("");

    useEffect(() => {
        if (promotion) {
            setPromotionName(promo.promotion_name);
            setPromotionDiscount(promo.promotion_discount);
            setPromotionType(promo.promotion_type);
            setPromotionStartDate(promo.promotion_startDate);
            setPromotionEndDate(promo.promotion_endDate);
            setPromotionStatus(promo.promotion_status);
            setPromotionUsage(promo.promotion_limit);
            setPromotionBadge(promo.promotion_badge);
        }
    }, [promotion]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
                <button
                    onClick={() => {
                        onClose();
                    }}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                    <X size={20} />
                </button>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black px-6 py-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Edit Promotion
                    </h2>

                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-600">
                            Promotion Name
                        </label>
                        <input
                            className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            value={promotionName}
                            onChange={(e) => setPromotionName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 flex items-center gap-2">
                            <Percent size={14} /> Discount
                        </label>
                        <input
                            className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g. 20% or BOGO"
                            value={promotionDiscount}
                            onChange={(e) =>
                                setPromotionDiscount(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">Type</label>
                        <select
                            className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            value={promotionType}
                            onChange={(e) => setPromotionType(e.target.value)}
                        >
                            <option>Flash Sale</option>
                            <option>Voucher</option>
                            <option>Free Shipping</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 flex items-center gap-2">
                            <Calendar size={14} /> Start
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            value={promotionStartDate?.slice(0, 16)}
                            onChange={(e) =>
                                setPromotionStartDate(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 flex items-center gap-2">
                            <Calendar size={14} /> End
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            value={promotionEndDate?.slice(0, 16)}
                            onChange={(e) =>
                                setPromotionEndDate(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">Status</label>
                        <select
                            className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            value={promotionStatus}
                            onChange={(e) => setPromotionStatus(e.target.value)}
                        >
                            <option>Active</option>
                            <option>Paused</option>
                            <option>Expired</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">
                            Usage Limit
                        </label>
                        <input
                            type="text"
                            min={1}
                            className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            value={promotionUsage}
                            onChange={(e) => setPromotionUsage(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 flex items-center gap-2">
                            <Tag size={14} /> Badge
                        </label>
                        <input
                            className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g. 🔥 Hot Deal"
                            value={promotionBadge}
                            onChange={(e) => setPromotionBadge(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                            }}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const formData = new FormData();
                                formData.append(
                                    "promotion_name",
                                    promotionName
                                );
                                formData.append(
                                    "promotion_discount",
                                    promotionDiscount
                                );
                                formData.append(
                                    "promotion_type",
                                    promotionType
                                );
                                v;
                                formData.append(
                                    "promotion_startDate",
                                    promotionStartDate
                                );
                                formData.append(
                                    "promotion_endDate",
                                    promotionEndDate
                                );
                                formData.append(
                                    "promotion_status",
                                    promotionStatus
                                );
                                formData.append(
                                    "promotion_usage",
                                    promotionUsage
                                );
                                formData.append(
                                    "promotion_badge",
                                    promotionBadge
                                );

                                onEdit(e, formData);
                                onClose();
                            }}
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            Update Promotion
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
