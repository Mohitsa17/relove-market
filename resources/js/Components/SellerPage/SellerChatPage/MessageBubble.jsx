import { Clock } from "lucide-react";

import { usePage } from "@inertiajs/react";
import { UserAvatar } from "./UserAvatar";

export function MessageBubble({
    message,
    formatConversationTimeForDisplay,
    imageLoading,
    handleImageLoad,
    handleImageError,
}) {
    const isBuyer = message.sender_type === "seller";
    const isOptimistic = message.isOptimistic;

    const { auth } = usePage().props;

    return (
        <div
            className={`flex gap-2 mb-4 ${
                isBuyer ? "justify-end" : "justify-start"
            }`}
        >
            {!isBuyer && (
                <UserAvatar
                    user={message}
                    size={8}
                    className="flex-shrink-0"
                    imageLoading={imageLoading}
                    handleImageLoad={handleImageLoad}
                    handleImageError={handleImageError}
                />
            )}

            <div
                className={`max-w-[70%] flex flex-col ${
                    isBuyer ? "items-end" : "items-start"
                }`}
            >
                {!isBuyer && (
                    <span className="text-xs text-gray-500 mb-1 ml-1">
                        {message.sender?.name}
                    </span>
                )}
                {message.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {message.unread_count}
                    </span>
                )}
                <div
                    className={`px-4 py-3 rounded-2xl ${
                        isBuyer
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-md"
                            : "bg-gray-100 text-gray-900 rounded-bl-md"
                    } ${isOptimistic ? "opacity-80" : ""} shadow-sm`}
                >
                    <p className="text-sm leading-relaxed">{message.message}</p>
                </div>
                <div
                    className={`flex items-center gap-2 mt-1 ${
                        isBuyer ? "flex-row-reverse" : ""
                    }`}
                >
                    <span
                        className={`text-xs ${
                            isBuyer ? "text-gray-500" : "text-gray-400"
                        }`}
                    >
                        {formatConversationTimeForDisplay(message.created_at)}
                    </span>
                    {isBuyer && (
                        <span className="text-xs">
                            {isOptimistic ? (
                                <Clock size={12} className="inline" />
                            ) : message.read ? (
                                "✓✓"
                            ) : (
                                "✓"
                            )}
                        </span>
                    )}
                    {/* Show read status for seller messages */}
                    {!isBuyer && message.read && (
                        <span className="text-xs text-gray-400">Read</span>
                    )}
                </div>
            </div>

            {isBuyer && (
                <UserAvatar
                    user={auth.user}
                    size={8}
                    className="flex-shrink-0"
                    imageLoading={imageLoading}
                    handleImageLoad={handleImageLoad}
                    handleImageError={handleImageError}
                />
            )}
        </div>
    );
}
