import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaBars,
    FaTimes,
    FaTachometerAlt,
    FaBox,
    FaShoppingCart,
    FaMoneyBill,
    FaUserCircle,
    FaSignOutAlt,
    FaStore,
    FaUser,
    FaChevronDown,
    FaChevronUp,
    FaComments,
    FaHeadset,
    FaBell,
    FaLeaf,
} from "react-icons/fa";

import { Link, usePage } from "@inertiajs/react";

export function SellerSidebar({ notificationCount = 0 }) {
    const [profileOpen, setProfileOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const { auth } = usePage().props;
    const { url } = usePage();

    const firstRender = useRef(true);

    // Check if the screen is mobile size
    useEffect(() => {
        const checkIsMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setSidebarOpen(!mobile);
        };

        checkIsMobile();
        window.addEventListener("resize", checkIsMobile);

        return () => {
            window.removeEventListener("resize", checkIsMobile);
        };
    }, []);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        if (isMobile && sidebarOpen) {
            setSidebarOpen(false);
        }
    }, [url]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Check if current route matches
    const isActive = (routeName) => {
        const routeUrl = route(routeName, {}, false);
        return url ? url.startsWith(routeUrl) : false;
    };

    const sidebarContent = (
        <>
            {/* Shop Header */}
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="bg-white text-indigo-600 p-2 rounded-lg mr-3">
                            <FaStore className="text-xl" />
                        </div>
                        <div>
                            <div className="text-lg font-bold truncate max-w-[160px]">
                                {auth.user.seller_store_name}
                            </div>
                            <div className="text-xs text-indigo-100 opacity-90">
                                Seller Dashboard
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1 text-indigo-200 hover:text-white rounded-lg md:hidden"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 flex-1 space-y-1 overflow-y-auto">
                {/* Dashboard Section */}
                <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                        Main
                    </div>
                    <Link
                        href={route("seller-dashboard")}
                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                            isActive("seller-dashboard")
                                ? "bg-indigo-50 text-indigo-600 shadow-sm border-l-4 border-indigo-600"
                                : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        <FaTachometerAlt className="text-lg text-indigo-500" />
                        <span className="text-sm font-medium">Dashboard</span>
                    </Link>
                </div>

                {/* Business Section */}
                <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                        Business
                    </div>
                    <Link
                        href={route("seller-manage-product")}
                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                            isActive("seller-manage-product")
                                ? "bg-indigo-50 text-indigo-600 shadow-sm border-l-4 border-indigo-600"
                                : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        <FaBox className="text-lg text-blue-500" />
                        <span className="text-sm font-medium">Products</span>
                        {/* <span className="ml-auto bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                            15
                        </span> */}
                    </Link>

                    <Link
                        href={route("seller-manage-order")}
                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                            isActive("seller-manage-order")
                                ? "bg-indigo-50 text-indigo-600 shadow-sm border-l-4 border-indigo-600"
                                : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        <FaShoppingCart className="text-lg text-green-500" />
                        <span className="text-sm font-medium">Orders</span>
                        {/* <span className="ml-auto bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                            24
                        </span> */}
                    </Link>

                    <Link
                        href={route("seller-manage-earning")}
                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                            isActive("seller-manage-earning")
                                ? "bg-indigo-50 text-indigo-600 shadow-sm border-l-4 border-indigo-600"
                                : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        <FaMoneyBill className="text-lg text-amber-500" />
                        <span className="text-sm font-medium">Earnings</span>
                    </Link>
                </div>

                {/* Support Section */}
                <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                        Support
                    </div>
                    <Link
                        href={route("seller-chat")}
                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                            isActive("seller-chat")
                                ? "bg-indigo-50 text-indigo-600 shadow-sm border-l-4 border-indigo-600"
                                : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        <FaComments className="text-lg text-cyan-500" />
                        <span className="text-sm font-medium">Chat</span>
                    </Link>

                    <Link
                        href={route("seller-help-support")}
                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                            isActive("seller-help-support")
                                ? "bg-indigo-50 text-indigo-600 shadow-sm border-l-4 border-indigo-600"
                                : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        <FaHeadset className="text-lg text-gray-500" />
                        <span className="text-sm font-medium">
                            Help & Support
                        </span>
                    </Link>
                </div>
            </nav>

            {/* User Profile Section */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white transition-all border border-gray-200 bg-white shadow-sm"
                >
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            {auth.user?.profile_image ? (
                                <img
                                    src={
                                        import.meta.env.VITE_BASE_URL +
                                        auth.user?.profile_image
                                    }
                                    alt="User Profile"
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                            ) : (
                                <FaUserCircle className="h-10 w-10 text-indigo-600" />
                            )}

                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {notificationCount}
                                </span>
                            )}
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-medium text-gray-800">
                                {auth.user?.name || "Account"}
                            </div>
                            <div className="text-xs text-gray-500">Seller</div>
                        </div>
                    </div>
                    {profileOpen ? (
                        <FaChevronUp className="text-xs text-gray-400" />
                    ) : (
                        <FaChevronDown className="text-xs text-gray-400" />
                    )}
                </button>

                <AnimatePresence>
                    {profileOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden mt-2 space-y-1"
                        >
                            <Link
                                href={route("homepage")}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                                onClick={() => setProfileOpen(false)}
                            >
                                <FaLeaf className="w-4 h-4 mr-2 text-green-500" />
                                <span>Relove Market</span>
                            </Link>
                            <Link
                                href={route("seller-manage-profile")}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                <FaUser className="w-4 h-4 mr-2" />
                                Profile
                            </Link>
                            <Link
                                href={route("logout")}
                                method="post"
                                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                <FaSignOutAlt className="w-4 h-4 mr-2" />
                                Logout
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );

    const sidebarVariants = {
        hidden: { x: "-100%", opacity: 0 },
        visible: { x: 0, opacity: 1 },
        exit: { x: "-100%", opacity: 0 },
    };

    return (
        <>
            {/* Mobile Navigation Bar */}
            {isMobile && (
                <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-60 flex items-center justify-between p-4 md:hidden border-b border-gray-200">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                        {sidebarOpen ? (
                            <FaTimes className="text-xl" />
                        ) : (
                            <FaBars className="text-xl" />
                        )}
                    </button>

                    <div className="flex items-center">
                        <div className="text-lg font-bold text-gray-800 truncate max-w-[140px]">
                            {auth.user.seller_store_name}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {notificationCount > 0 && (
                            <Link
                                href={route("seller-notifications")}
                                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 relative"
                            >
                                <FaBell className="text-xl" />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                    {notificationCount > 9
                                        ? "9+"
                                        : notificationCount}
                                </span>
                            </Link>
                        )}
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
                        >
                            {auth.user?.profile_image ? (
                                <img
                                    src={
                                        import.meta.env.VITE_BASE_URL +
                                        auth.user.profile_image
                                    }
                                    alt="User"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <FaUserCircle className="text-2xl text-indigo-600" />
                            )}
                        </button>
                    </div>
                </nav>
            )}

            {/* Desktop Sidebar - FIXED: Changed to use flex layout without fixed height constraints */}
            {!isMobile && (
                <div className="w-64 bg-white border-r border-gray-200 shadow-sm hidden md:flex md:flex-col fixed left-0 top-0 bottom-0 z-30">
                    {sidebarContent}
                </div>
            )}

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobile && sidebarOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black z-40 md:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />

                        {/* Sidebar */}
                        <motion.div
                            variants={sidebarVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ type: "tween", duration: 0.3 }}
                            className="fixed top-0 left-0 h-full w-64 bg-white z-50 md:hidden overflow-y-auto flex flex-col shadow-xl"
                        >
                            {sidebarContent}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Mobile Profile Menu Overlay */}
            <AnimatePresence>
                {isMobile && profileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black z-40 md:hidden"
                            onClick={() => setProfileOpen(false)}
                        />

                        {/* Profile Menu */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="fixed top-16 right-4 bg-white shadow-lg rounded-lg z-50 p-2 w-48 md:hidden border border-gray-200"
                        >
                            <div className="p-2 border-b border-gray-100 text-sm text-gray-500">
                                My Account
                            </div>
                            <ul className="py-1">
                                <li>
                                    <Link
                                        href={route("homepage")}
                                        className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm"
                                        onClick={() => setProfileOpen(false)}
                                    >
                                        <FaLeaf className="text-sm text-green-500" />
                                        <span>Relove Market</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={route("seller-manage-profile")}
                                        className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm"
                                        onClick={() => setProfileOpen(false)}
                                    >
                                        <FaUser className="text-sm" />
                                        <span>Profile</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                        className="flex items-center space-x-2 p-2 text-red-600 hover:bg-red-50 rounded-md w-full text-left text-sm"
                                        onClick={() => setProfileOpen(false)}
                                    >
                                        <FaSignOutAlt className="text-sm" />
                                        <span>Logout</span>
                                    </Link>
                                </li>
                            </ul>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Add padding for mobile navbar */}
            {isMobile && <div className="h-16 md:hidden"></div>}

            {/* Add margin for desktop sidebar */}
            {!isMobile && <div className="md:ml-64"></div>}
        </>
    );
}
