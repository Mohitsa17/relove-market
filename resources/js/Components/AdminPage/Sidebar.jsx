import { useState, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaBars,
    FaTimes,
    FaHome,
    FaFileInvoiceDollar,
    FaUserCheck,
    FaSignOutAlt,
    FaBox,
    FaUserCog,
    FaMobile, // Added for smartphone icon
} from "react-icons/fa";

export function Sidebar({ pendingCount = 0 }) {
    const { url } = usePage();
    const { auth } = usePage().props;
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Check screen size on mount and resize
    useEffect(() => {
        const checkIsMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setSidebarOpen(false); // Close sidebar when switching to desktop
            }
        };

        checkIsMobile();
        window.addEventListener("resize", checkIsMobile);

        return () => {
            window.removeEventListener("resize", checkIsMobile);
        };
    }, []);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobile && sidebarOpen) {
                const sidebar = document.querySelector(".mobile-sidebar");
                const hamburger = document.querySelector(".hamburger-button");
                if (
                    sidebar &&
                    !sidebar.contains(event.target) &&
                    hamburger &&
                    !hamburger.contains(event.target)
                ) {
                    setSidebarOpen(false);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isMobile, sidebarOpen]);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isMobile && sidebarOpen) {
            document.body.style.overflow = "hidden";
            document.body.style.touchAction = "none";
        } else {
            document.body.style.overflow = "unset";
            document.body.style.touchAction = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
            document.body.style.touchAction = "unset";
        };
    }, [isMobile, sidebarOpen]);

    // Check if current route matches
    const isActive = (routeName) => {
        return url.startsWith(route(routeName, {}, false));
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Handle navigation click - close sidebar on mobile
    const handleNavClick = () => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    // Get current page title for mobile navbar
    const getCurrentPageTitle = () => {
        if (url.startsWith(route("admin-dashboard", {}, false))) {
            return "Dashboard";
        } else if (url.startsWith(route("list-transaction", {}, false))) {
            return "Transactions";
        } else if (url.startsWith(route("pending-seller-list", {}, false))) {
            return "Seller Registrations";
        } else if (url.startsWith(route("product-moderation", {}, false))) {
            return "Products";
        } else if (url.startsWith(route("user-management", {}, false))) {
            return "Users";
        }
        return "Admin Panel";
    };

    const sidebarVariants = {
        hidden: { x: "-100%", opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 200,
            },
        },
        exit: {
            x: "-100%",
            opacity: 0,
            transition: {
                type: "tween",
                duration: 0.2,
            },
        },
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const sidebarContent = (
        <>
            {/* Header */}
            <div className="p-4 border-b border-indigo-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-indigo-800 font-bold text-sm">
                            A
                        </span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">
                            Admin Panel
                        </h1>
                        <p className="text-indigo-300 text-xs">Administrator</p>
                    </div>
                </div>

                {/* Close button - only show on mobile */}
                {isMobile && (
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 text-white hover:bg-indigo-700 rounded-lg transition-colors"
                        aria-label="Close sidebar"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="p-4 flex-1 overflow-y-auto">
                <ul className="space-y-2">
                    <li>
                        <Link
                            href={route("admin-dashboard")}
                            className={`flex items-center p-3 rounded-lg transition-all group ${
                                isActive("admin-dashboard")
                                    ? "bg-white text-indigo-800 shadow-md"
                                    : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
                            }`}
                            onClick={handleNavClick}
                        >
                            <FaHome className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span className="font-medium">Dashboard</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={route("list-transaction")}
                            className={`flex items-center p-3 rounded-lg transition-all group ${
                                isActive("list-transaction")
                                    ? "bg-white text-indigo-800 shadow-md"
                                    : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
                            }`}
                            onClick={handleNavClick}
                        >
                            <FaFileInvoiceDollar className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span className="font-medium">Transactions</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={route("pending-seller-list")}
                            className={`flex items-center p-3 rounded-lg transition-all group relative ${
                                isActive("pending-seller-list")
                                    ? "bg-white text-indigo-800 shadow-md"
                                    : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
                            }`}
                            onClick={handleNavClick}
                        >
                            <FaUserCheck className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span className="font-medium">
                                Seller Registrations
                            </span>
                            {pendingCount > 0 && (
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-6 flex items-center justify-center">
                                    {pendingCount > 99 ? "99+" : pendingCount}
                                </span>
                            )}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={route("product-moderation")}
                            className={`flex items-center p-3 rounded-lg transition-all group ${
                                isActive("product-moderation")
                                    ? "bg-white text-indigo-800 shadow-md"
                                    : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
                            }`}
                            onClick={handleNavClick}
                        >
                            <FaBox className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span className="font-medium">Products</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={route("user-management")}
                            className={`flex items-center p-3 rounded-lg transition-all group ${
                                isActive("user-management")
                                    ? "bg-white text-indigo-800 shadow-md"
                                    : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
                            }`}
                            onClick={handleNavClick}
                        >
                            <FaUserCog className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span className="font-medium">Users</span>
                        </Link>
                    </li>
                </ul>

                {/* Notification summary - Hidden on mobile to save space */}
                {!isMobile &&
                    pendingCount > 0 &&
                    !url.startsWith(route("pending-seller-list")) && (
                        <Link
                            href={route("pending-seller-list")}
                            onClick={handleNavClick}
                        >
                            <div className="mt-6 p-3 bg-indigo-700 rounded-lg border border-indigo-600 hover:bg-indigo-600 transition-colors">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <span className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {pendingCount > 99
                                                ? "99+"
                                                : pendingCount}
                                        </span>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-white">
                                            Pending approvals
                                        </p>
                                        <p className="text-xs text-indigo-200">
                                            {pendingCount} seller registration
                                            {pendingCount !== 1 ? "s" : ""}{" "}
                                            awaiting review
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )}
            </nav>

            {/* User section and Logout */}
            <div className="p-4 border-t border-indigo-700 bg-indigo-800">
                {auth?.user && (
                    <div className="mb-4 flex items-center space-x-3">
                        <img
                            src="../image/shania_yan_5.jpg"
                            alt={auth.user.name}
                            className="w-14 max-h-12 rounded-full object-cover border-2 border-indigo-200 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">
                                {auth.user.name}
                            </p>
                            <p className="text-xs text-indigo-300 truncate">
                                Administrator
                            </p>
                        </div>
                    </div>
                )}

                <Link
                    href={route("logout")}
                    method="post"
                    as="button"
                    className="w-full flex items-center justify-center p-3 text-indigo-200 hover:text-white hover:bg-indigo-700 rounded-lg transition-colors group"
                    onClick={handleNavClick}
                >
                    <FaSignOutAlt className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="font-medium">Logout</span>
                </Link>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Navigation Bar - Updated Design */}
            {isMobile && (
                <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-40 p-4 safe-top">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg bg-gray-100 hamburger-button"
                            aria-label="Toggle sidebar"
                        >
                            {sidebarOpen ? (
                                <FaTimes className="w-5 h-5 text-gray-700" />
                            ) : (
                                <FaBars className="w-5 h-5 text-gray-700" />
                            )}
                        </button>
                        <h1 className="text-lg font-bold text-gray-800">
                            {getCurrentPageTitle()}
                        </h1>
                        <FaMobile className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar - Always visible on desktop */}
            <div
                style={{ height: "100vh" }}
                className="bg-gradient-to-b from-indigo-800 to-indigo-900 text-white hidden md:flex md:flex-col w-64 flex-shrink-0 fixed left-0 top-0 z-30"
            >
                {sidebarContent}
            </div>

            {/* Mobile Sidebar Modal */}
            <AnimatePresence>
                {isMobile && sidebarOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            variants={backdropVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />

                        {/* Sidebar Modal */}
                        <motion.div
                            variants={sidebarVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-indigo-800 to-indigo-900 text-white z-50 md:hidden overflow-hidden flex flex-col mobile-sidebar shadow-2xl"
                            style={{
                                top: 0,
                                height: "100vh",
                            }}
                        >
                            {sidebarContent}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Add padding for mobile navbar and desktop sidebar */}
            {isMobile ? (
                <div className="h-16 md:hidden"></div> // Adjusted height to match the new navbar
            ) : (
                <div className="w-64 flex-shrink-0"></div>
            )}
        </>
    );
}
