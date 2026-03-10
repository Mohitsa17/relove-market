import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTriangleExclamation,
    faClock,
} from "@fortawesome/free-solid-svg-icons";

import { Link } from "@inertiajs/react";

export function TrialBanner({ seller, trialDaysLeft }) {
    const banner = useMemo(() => {
        if (!seller) return null;
        if (seller?.subscription?.plan_name !== "PLAN-TRIAL") return null;

        if (trialDaysLeft <= 0) {
            return (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-700">
                        <FontAwesomeIcon icon={faTriangleExclamation} />
                        <span className="font-medium">
                            Your trial has expired. Some features are limited.
                        </span>
                    </div>
                    <Link
                        href={route("seller-manage-subscription")}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm"
                    >
                        Subscribe Now
                    </Link>
                </div>
            );
        }

        return (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-yellow-800">
                    <FontAwesomeIcon icon={faClock} />
                    <span>
                        You have{" "}
                        <span className="font-semibold">
                            {trialDaysLeft} day(s)
                        </span>{" "}
                        left in your free trial.
                    </span>
                </div>
                <Link
                    href={route("seller-manage-subscription")}
                    className="px-3 py-1.5 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 text-sm"
                >
                    Upgrade
                </Link>
            </div>
        );
    }, [seller, trialDaysLeft]);

    return banner;
}
