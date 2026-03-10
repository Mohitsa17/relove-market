import { Percent, Calendar, Tag, X } from "lucide-react";

import React, { useState } from "react";

export function SellerAddPromotion_Modal({ onAdd, onClose }) {
    const [promotionName, setPromotionName] = useState("");
    const [promotionDiscount, setPromotionDiscount] = useState("");
    const [promotionType, setPromotionType] = useState("");
    const [promotionStartDate, setPromotionStartDate] = useState("");
    const [promotionEndDate, setPromotionEndDate] = useState("");
    const [promotionStatus, setPromotionStatus] = useState("");
    const [promotionUsage, setPromotionUsage] = useState("");
    const [promotionBadge, setPromotionBadge] = useState("");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                    <X size={20} />
                </button>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black px-6 py-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Create Promotion
                    </h2>

                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-600">
                            Promotion Name
                        </label>
                        <input
                            className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            name="promotion_name"
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
                            name="promotion_discount"
                            value={promotionDiscount}
                            onChange={(e) =>
                                setPromotionDiscount(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">
                            Promotion Type
                        </label>
                        <select
                            name="promotion_type"
                            className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            value={promotionType}
                            onChange={(e) => setPromotionType(e.target.value)}
                            required
                        >
                            <option value="">-- Select Type --</option>
                            <option value="Flash Sale">Flash Sale</option>
                            <option value="Voucher">Voucher</option>
                            <option value="Free Shipping">Free Shipping</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 flex items-center gap-2">
                            <Calendar size={14} /> Start
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            name="promotion_startDate"
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
                            name="promotion_endDate"
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
                            name="promotion_status"
                            className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            value={promotionStatus}
                            onChange={(e) => setPromotionStatus(e.target.value)}
                            required
                        >
                            <option value="">-- Select Status --</option>
                            <option value="Active">Active</option>
                            <option value="Paused">Paused</option>
                            <option value="Expired">Expired</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">
                            Promotion Usage Limit
                        </label>
                        <input
                            type="text"
                            min={1}
                            className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            name="promotion_usage"
                            value={promotionUsage}
                            onChange={(e) => setPromotionUsage(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 flex items-center gap-2">
                            <Tag size={14} /> Promotion Badge
                        </label>
                        <input
                            className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g. 🔥 Hot Deal"
                            name="promotion_badge"
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
                            onClick={(e) => {
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

                                onAdd(e, formData);
                                onClose();
                            }}
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            Create Promotion
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
