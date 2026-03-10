import { FaCheck, FaTimes } from "react-icons/fa";

export function PasswordRequirement({ met, text }) {
    return (
        <div
            className={`flex items-center text-sm ${
                met ? "text-green-600" : "text-gray-500"
            }`}
        >
            {met ? (
                <FaCheck className="w-4 h-4 mr-2" />
            ) : (
                <FaTimes className="w-4 h-4 mr-2" />
            )}
            {text}
        </div>
    );
}
