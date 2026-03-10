import { Lock, Crown, Zap } from "lucide-react";

import { Link } from "@inertiajs/react";

export function SubscriptionStatus({
    subscription,
    subscriptionLoading,
    hasReachedProductLimit,
    pagination,
    setIsUpgradeModalOpen, // Added this prop
    realTimeProducts, // Added this prop to get current product count
}) {
    if (subscriptionLoading || !subscription) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                        <span className="text-blue-700 text-sm">
                            Checking subscription status...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    const { limits, subscription_plan_id } = subscription;
    const productLimitReached = hasReachedProductLimit();
    const canFeature = limits.featured_listing === true;
    const isTrialUser = subscription_plan_id === "PLAN-TRIAL";

    // ✅ FREE TRIAL STYLING
    if (isTrialUser) {
        return (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <Zap className="text-green-600" size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-green-900">
                                    {subscription.plan_name}
                                </p>
                                <span className="px-2 py-0.5 bg-green-200 text-green-800 text-xs rounded-full font-medium">
                                    Free Trial
                                </span>
                            </div>
                            <p className="text-sm text-green-700 mt-1">
                                ✅ Unlimited products •{" "}
                                {realTimeProducts?.length || 0} listed
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                                🎉 All features available during trial period
                            </p>
                        </div>
                    </div>
                    <Link href={route("seller-manage-subscription")}>
                        <button
                            onClick={() => setIsUpgradeModalOpen?.(true)}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap font-medium flex items-center gap-2"
                        >
                            <Crown size={16} />
                            Upgrade to Premium
                        </button>
                    </Link>
                </div>

                {/* Trial progress or time remaining */}
                {subscription.end_date && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-green-700">
                                Trial ends:{" "}
                                {new Date(
                                    subscription.end_date
                                ).toLocaleDateString()}
                            </span>
                            <span className="text-green-600 font-medium">
                                {calculateDaysLeft(subscription.end_date)} days
                                left
                            </span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ✅ REGULAR SUBSCRIPTION STYLING (your existing code with improvements)
    return (
        <div
            className={`border rounded-lg p-4 mb-4 ${
                productLimitReached
                    ? "bg-orange-50 border-orange-200"
                    : "bg-blue-50 border-blue-200"
            }`}
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-3">
                    {productLimitReached ? (
                        <div className="bg-orange-100 p-2 rounded-lg">
                            <Lock className="text-orange-600" size={20} />
                        </div>
                    ) : (
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Crown className="text-blue-600" size={20} />
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-gray-900">
                            {subscription.plan_name}
                        </p>
                        <p className="text-sm text-gray-600">
                            {limits.max_products === -1 ||
                            limits.max_products === null
                                ? `Unlimited products • ${
                                      realTimeProducts?.length || 0
                                  } listed`
                                : `${realTimeProducts?.length || 0}/${
                                      limits.max_products
                                  } products`}
                            {canFeature && " • Featured listings available"}
                        </p>
                    </div>
                </div>
                {productLimitReached && (
                    <Link href={route("seller-manage-subscription")}>
                        <button
                            onClick={() => setIsUpgradeModalOpen?.(true)}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap font-medium flex items-center gap-2"
                        >
                            <Crown size={16} />
                            Upgrade Plan
                        </button>
                    </Link>
                )}
            </div>
            {productLimitReached && (
                <div className="mt-3 p-3 bg-orange-100 rounded-lg text-orange-800 text-sm">
                    <div className="flex items-center gap-2">
                        <Lock size={16} />
                        <div>
                            <strong>Product limit reached:</strong> You cannot
                            add more products with your current plan. Upgrade to
                            continue growing your store.
                        </div>
                    </div>
                </div>
            )}

            {/* Usage progress bar for limited plans */}
            {limits.max_products > 0 && !productLimitReached && (
                <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Product usage</span>
                        <span>
                            {realTimeProducts?.length || 0} /{" "}
                            {limits.max_products}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                                width: `${Math.min(
                                    100,
                                    ((realTimeProducts?.length || 0) /
                                        limits.max_products) *
                                        100
                                )}%`,
                            }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper function to calculate days left in trial
function calculateDaysLeft(endDate) {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}
