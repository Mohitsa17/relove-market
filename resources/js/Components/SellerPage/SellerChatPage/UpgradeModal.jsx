export function UpgradeModal({
    showUpgradeModal,
    setShowUpgradeModal,
    subscription,
    subscriptionTiers,
    handleUpgrade,
}) {
    if (!showUpgradeModal) return null;

    const currentTier = getCurrentTierInfo();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Crown className="text-yellow-600 w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Upgrade Your Plan
                        </h3>
                        <p className="text-gray-600">
                            You've reached the limit of{" "}
                            {currentTier.maxConversations} active conversations.
                            Upgrade to continue chatting with more customers.
                        </p>
                    </div>

                    <div className="space-y-4 mb-6">
                        {Object.entries(subscriptionTiers).map(
                            ([key, tier]) => {
                                if (key === subscription?.tier) return null;

                                return (
                                    <div
                                        key={key}
                                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                                            key === "professional"
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200"
                                        }`}
                                        onClick={() => handleUpgrade(key)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`text-${tier.color}-600`}
                                                >
                                                    {tier.icon}
                                                </div>
                                                <span className="font-semibold text-gray-900">
                                                    {tier.name}
                                                </span>
                                            </div>
                                            <span
                                                className={`font-bold text-${tier.color}-600`}
                                            >
                                                {tier.price}
                                            </span>
                                        </div>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            {tier.features.map(
                                                (feature, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                        {feature}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                );
                            }
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowUpgradeModal(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Maybe Later
                        </button>
                        <button
                            onClick={() => handleUpgrade("professional")}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
