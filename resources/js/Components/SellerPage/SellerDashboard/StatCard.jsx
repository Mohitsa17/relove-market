import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function StatCard({ icon, title, value, sub }) {
    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5 border border-gray-100">
            <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <FontAwesomeIcon icon={icon} className="text-indigo-600" />
                </div>
                <div>
                    <div className="text-sm text-gray-500">{title}</div>
                    <div className="text-2xl font-semibold text-gray-800">
                        {value}
                    </div>
                    {sub ? (
                        <div className="text-xs text-gray-500 mt-0.5">
                            {sub}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
