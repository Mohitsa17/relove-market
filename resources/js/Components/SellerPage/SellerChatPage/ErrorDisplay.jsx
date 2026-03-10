import { AlertCircle } from "lucide-react";

export function ErrorDisplay({ error, setError }) {
    if (!error) return null;

    return (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
            </div>
            <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
            >
                <span className="text-lg">×</span>
            </button>
        </div>
    );
}
