import { X } from "lucide-react";

export function SellerViewPromotion_Modal({ promotion, onClose }) {
    console.log(promotion);

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
                    {/* Header */}
                    <div className="border-b bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 ">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-white">
                                View Promotion
                            </h2>
                            <button
                                onClick={() => {
                                    onClose();
                                }}
                                className="text-white/80 hover:text-white transition"
                            >
                                <X size={22} />
                            </button>
                        </div>
                    </div>
                    <div className="px-6 py-4 space-y-3 text-black">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                                {promotion.name}
                            </h3>
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    promotion.status === "Active"
                                        ? "bg-green-100 text-green-700"
                                        : promotion.status === "Paused"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                {promotion.status}
                            </span>
                        </div>
                        {promotion.badge && (
                            <p className="text-sm">
                                <span className="font-medium">Badge:</span>{" "}
                                {promotion.badge}
                            </p>
                        )}
                        <p className="text-sm">
                            <span className="font-medium">Type:</span>{" "}
                            {promotion.type}
                        </p>
                        <p className="text-sm">
                            <span className="font-medium">Discount:</span>{" "}
                            {promotion.discount}
                        </p>
                        <p className="text-sm">
                            <span className="font-medium">Period:</span>{" "}
                            {new Date(promotion.startDate).toLocaleString()} →{" "}
                            {new Date(promotion.endDate).toLocaleString()}
                        </p>
                        <div>
                            <p className="text-sm font-medium mb-1">Usage</p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-indigo-600 h-2 rounded-full"
                                    style={{
                                        width: `${Math.min(
                                            100,
                                            (promotion.claimed /
                                                Math.max(
                                                    1,
                                                    promotion.usageLimit
                                                )) *
                                                100
                                        )}%`,
                                    }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {promotion.claimed}/{promotion.usageLimit}{" "}
                                claimed
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
