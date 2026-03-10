// Enhanced NotificationModal component
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTimes,
    faBell,
    faShoppingCart,
    faExclamationTriangle,
    faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

export const NotificationModal = ({
    notifications,
    showNotificationModal,
    setShowNotificationModal,
    setNotifications,
    removeNotification,
}) => {
    const getNotificationIcon = (type) => {
        switch (type) {
            case "success":
                return faShoppingCart;
            case "warning":
                return faExclamationTriangle;
            case "info":
            default:
                return faInfoCircle;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case "success":
                return "text-green-600 bg-green-50 border-green-200";
            case "warning":
                return "text-yellow-600 bg-yellow-50 border-yellow-200";
            case "info":
            default:
                return "text-blue-600 bg-blue-50 border-blue-200";
        }
    };

    const handleClearAll = () => {
        setNotifications([]);
    };

    const formatTime = (timestamp) => {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInMinutes = Math.floor(
            (now - notificationTime) / (1000 * 60)
        );

        if (diffInMinutes < 1) return "Just now";
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440)
            return `${Math.floor(diffInMinutes / 60)}h ago`;
        return notificationTime.toLocaleDateString();
    };

    return (
        <AnimatePresence>
            {showNotificationModal && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50"
                        onClick={() => setShowNotificationModal(false)}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-4 right-4 md:top-16 md:right-16 w-80 md:w-96 bg-white rounded-xl shadow-2xl z-50 border border-gray-200 max-h-96 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon
                                    icon={faBell}
                                    className="text-indigo-600 h-5 w-5"
                                />
                                <h3 className="font-semibold text-gray-800">
                                    Notifications
                                </h3>
                                {notifications.length > 0 && (
                                    <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                                        {notifications.length}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {notifications.length > 0 && (
                                    <button
                                        onClick={handleClearAll}
                                        className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                                    >
                                        Clear All
                                    </button>
                                )}
                                <button
                                    onClick={() =>
                                        setShowNotificationModal(false)
                                    }
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FontAwesomeIcon
                                        icon={faTimes}
                                        className="text-gray-400 h-4 w-4"
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto max-h-80">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {notifications.map((notification) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className={`p-4 border-l-4 ${
                                                notification.read
                                                    ? "bg-gray-50 border-gray-300"
                                                    : "bg-white border-indigo-500"
                                            } transition-colors`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div
                                                        className={`p-2 rounded-lg ${getNotificationColor(
                                                            notification.type
                                                        )}`}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={getNotificationIcon(
                                                                notification.type
                                                            )}
                                                            className="h-4 w-4"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-800 whitespace-pre-line">
                                                            {
                                                                notification.message
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {formatTime(
                                                                notification.timestamp
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        removeNotification(
                                                            notification.id
                                                        )
                                                    }
                                                    className="p-1 hover:bg-gray-200 rounded transition-colors ml-2 flex-shrink-0"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faTimes}
                                                        className="text-gray-400 h-3 w-3"
                                                    />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                    <FontAwesomeIcon
                                        icon={faBell}
                                        className="h-12 w-12 text-gray-300 mb-3"
                                    />
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                        No notifications
                                    </p>
                                    <p className="text-xs">
                                        New alerts will appear here
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
