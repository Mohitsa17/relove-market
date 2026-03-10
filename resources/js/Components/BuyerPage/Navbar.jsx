import {
    FaBars,
    FaTimes,
    FaUserCircle,
    FaSignOutAlt,
    FaStore,
    FaSnapchat,
    FaShoppingCart,
    FaComment,
} from "react-icons/fa";

import { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { usePage, Link } from "@inertiajs/react";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const { auth } = usePage().props;

    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            setScrolled(isScrolled);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    });

    const sidebarVariants = {
        hidden: { x: "-100%" },
        visible: { x: 0 },
        exit: { x: "-100%" },
    };

    return (
        <>
            {/* Navbar */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled
                        ? "bg-white shadow-md py-2"
                        : "bg-white/95 backdrop-blur-sm py-3"
                }`}
            >
                <div className="container mx-auto px-4 flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        href={route("homepage")}
                        className="flex items-center space-x-2"
                    >
                        <div className="bg-emerald-50 p-2 rounded-lg flex items-center justify-center">
                            <img
                                src="../relove_market.png"
                                alt="Relove Market Icon"
                                className="w-7 h-7"
                            />
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                            Relove{" "}
                            <span className="text-green-600">Market</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-1">
                        <Link
                            href={route("homepage")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                route().current("homepage")
                                    ? "text-green-600 bg-green-50"
                                    : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
                            }`}
                        >
                            Home
                        </Link>
                        <Link
                            href={route("about-us")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                route().current("about-us")
                                    ? "text-green-600 bg-green-50"
                                    : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
                            }`}
                        >
                            About
                        </Link>
                        <Link
                            href={route("shopping")}
                            preserveScroll
                            preserveState
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                route().current("shopping")
                                    ? "text-green-600 bg-green-50"
                                    : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
                            }`}
                        >
                            Shop
                        </Link>
                        <Link
                            href={route("seller-benefit")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                route().current("seller-benefit")
                                    ? "text-green-600 bg-green-50"
                                    : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
                            }`}
                        >
                            Seller Benefit
                        </Link>
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center space-x-4">
                        {/* Auth Section */}
                        {!auth?.user ? (
                            <div className="hidden md:flex items-center space-x-3">
                                <Link
                                    href={route("login")}
                                    className="px-4 py-2 text-gray-700 font-medium hover:text-green-600 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href={route("register")}
                                    className="bg-green-600 text-white px-5 py-2 rounded-full font-medium hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
                                >
                                    Get Started
                                </Link>
                            </div>
                        ) : (
                            <div className="relative hidden md:block">
                                {/* User Avatar */}
                                <button
                                    onClick={() =>
                                        setShowUserMenu(!showUserMenu)
                                    }
                                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                                        showUserMenu
                                            ? "border-green-600 ring-2 ring-green-100"
                                            : "border-gray-200 hover:border-green-300"
                                    }`}
                                    aria-label="User menu"
                                >
                                    <img
                                        src={
                                            auth?.user?.profile_image
                                                ? import.meta.env
                                                      .VITE_BASE_URL +
                                                  auth.user.profile_image
                                                : "../image/user.png"
                                        }
                                        alt="Profile"
                                        className="w-10 max-h-10 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.src = "../image/user.png";
                                        }}
                                    />
                                </button>

                                {/* User Dropdown Menu */}
                                <AnimatePresence>
                                    {showUserMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                                            onMouseLeave={() =>
                                                setShowUserMenu(false)
                                            }
                                        >
                                            {/* User Info */}
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {auth.user.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {auth.user.email}
                                                </p>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-1">
                                                {auth.user.role_id ===
                                                "ReLo-S0001" ? (
                                                    <>
                                                        <Link
                                                            href={route(
                                                                "seller-dashboard"
                                                            )}
                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                                                            onClick={() =>
                                                                setShowUserMenu(
                                                                    false
                                                                )
                                                            }
                                                        >
                                                            <FaStore className="mr-3 text-gray-400" />
                                                            Seller Dashboard
                                                        </Link>
                                                        <Link
                                                            href={route("cart")}
                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                                                            onClick={() =>
                                                                setShowUserMenu(
                                                                    false
                                                                )
                                                            }
                                                        >
                                                            <FaShoppingCart className="mr-3 text-gray-400" />
                                                            Cart
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Link
                                                            href={route(
                                                                "profile"
                                                            )}
                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                                                            onClick={() =>
                                                                setShowUserMenu(
                                                                    false
                                                                )
                                                            }
                                                        >
                                                            <FaUserCircle className="mr-3 text-gray-400" />
                                                            Profile
                                                        </Link>
                                                        <Link
                                                            href={route("cart")}
                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                                                            onClick={() =>
                                                                setShowUserMenu(
                                                                    false
                                                                )
                                                            }
                                                        >
                                                            <FaShoppingCart className="mr-3 text-gray-400" />
                                                            Cart
                                                        </Link>

                                                        <Link
                                                            href={route(
                                                                "buyer-chat"
                                                            )}
                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                                                            onClick={() =>
                                                                setShowUserMenu(
                                                                    false
                                                                )
                                                            }
                                                        >
                                                            <FaComment className="mr-3 text-gray-400" />
                                                            Messaging
                                                        </Link>
                                                    </>
                                                )}
                                            </div>

                                            {/* Logout */}
                                            <div className="border-t border-gray-100 py-1">
                                                <Link
                                                    href={route("logout")}
                                                    method="POST"
                                                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                    onClick={() =>
                                                        setShowUserMenu(false)
                                                    }
                                                >
                                                    <FaSignOutAlt className="mr-3" />
                                                    Sign out
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsOpen(true)}
                            className="lg:hidden p-2 text-gray-600 hover:text-green-600 transition-colors"
                            aria-label="Open menu"
                        >
                            <FaBars className="text-xl" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black z-40 lg:hidden"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Sidebar */}
                        <motion.div
                            className="fixed top-0 left-0 w-80 max-w-full min-h-full bg-white z-50 shadow-xl flex flex-col lg:hidden"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={sidebarVariants}
                            transition={{ type: "tween", duration: 0.3 }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                <Link
                                    href={route("homepage")}
                                    className="flex items-center space-x-2"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="bg-emerald-50 p-2 rounded-lg flex items-center justify-center">
                                        <img
                                            src="../relove_market.png"
                                            alt="Relove Market Icon"
                                            className="w-6 h-6"
                                        />
                                    </div>
                                    <span className="text-xl font-bold text-gray-900">
                                        Relove{" "}
                                        <span className="text-green-600">
                                            Market
                                        </span>
                                    </span>
                                </Link>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                                    aria-label="Close menu"
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>

                            {/* User section if logged in */}
                            {auth?.user && (
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={
                                                auth?.user?.profile_image
                                                    ? import.meta.env
                                                          .VITE_BASE_URL +
                                                      auth.user.profile_image
                                                    : "../image/user.png" // ✅ Direct path to your default image in public folder
                                            }
                                            alt={auth.user.name}
                                            className="w-28 max-h-20 rounded-full object-cover border-2 border-green-200"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {auth.user.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {auth.user.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation */}
                            <nav className="flex-1 p-4">
                                {/* Main Navigation Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <Link
                                        href={route("homepage")}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                            route().current("homepage")
                                                ? "bg-green-50 border-green-200 text-green-600 shadow-sm"
                                                : "border-gray-100 text-gray-700 hover:bg-gray-50 hover:border-gray-200"
                                        }`}
                                    >
                                        <span className="text-xl mb-2">🏠</span>
                                        <span className="text-xs font-medium text-center">
                                            Home
                                        </span>
                                    </Link>

                                    <Link
                                        href={route("about-us")}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                            route().current("about-us")
                                                ? "bg-green-50 border-green-200 text-green-600 shadow-sm"
                                                : "border-gray-100 text-gray-700 hover:bg-gray-50 hover:border-gray-200"
                                        }`}
                                    >
                                        <span className="text-xl mb-2">📄</span>
                                        <span className="text-xs font-medium text-center">
                                            About
                                        </span>
                                    </Link>

                                    <Link
                                        href={route("shopping")}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                            route().current("shopping")
                                                ? "bg-green-50 border-green-200 text-green-600 shadow-sm"
                                                : "border-gray-100 text-gray-700 hover:bg-gray-50 hover:border-gray-200"
                                        }`}
                                    >
                                        <span className="text-xl mb-2">🛍️</span>
                                        <span className="text-xs font-medium text-center">
                                            Shop
                                        </span>
                                    </Link>

                                    <Link
                                        href={route("seller-benefit")}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                            route().current("seller-benefit")
                                                ? "bg-green-50 border-green-200 text-green-600 shadow-sm"
                                                : "border-gray-100 text-gray-700 hover:bg-gray-50 hover:border-gray-200"
                                        }`}
                                    >
                                        <span className="text-xl mb-2">💼</span>
                                        <span className="text-xs font-medium text-center">
                                            Seller Benefit
                                        </span>
                                    </Link>

                                    <Link
                                        href={route("cart")}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                            route().current("cart")
                                                ? "bg-green-50 border-green-200 text-green-600 shadow-sm"
                                                : "border-gray-100 text-gray-700 hover:bg-gray-50 hover:border-gray-200"
                                        }`}
                                    >
                                        <span className="text-xl mb-2">🛒</span>
                                        <span className="text-xs font-medium text-center">
                                            Cart
                                        </span>
                                    </Link>

                                    <Link
                                        href={route("buyer-chat")}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                            route().current("buyer-chat")
                                                ? "bg-green-50 border-green-200 text-green-600 shadow-sm"
                                                : "border-gray-100 text-gray-700 hover:bg-gray-50 hover:border-gray-200"
                                        }`}
                                    >
                                        <span className="text-xl mb-2">💬</span>
                                        <span className="text-xs font-medium text-center">
                                            Chat
                                        </span>
                                    </Link>
                                </div>

                                {/* Additional Links Section */}
                                <div className="mt-6 space-y-2">
                                    {/* Profile Link if logged in */}
                                    {auth?.user && (
                                        <>
                                            <Link
                                                href={route("profile")}
                                                onClick={() => setIsOpen(false)}
                                                className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                                                    route().current("profile")
                                                        ? "bg-blue-50 text-blue-600"
                                                        : "text-gray-700 hover:bg-gray-50"
                                                }`}
                                            >
                                                <span className="w-6 text-center">
                                                    👤
                                                </span>
                                                <span className="text-sm font-medium">
                                                    My Profile
                                                </span>
                                            </Link>

                                            <Link
                                                href={route("logout")}
                                                method="POST"
                                                className="flex items-center space-x-3 p-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <span className="w-6 text-center">
                                                    🚪
                                                </span>
                                                <span className="text-sm font-medium">
                                                    Logout
                                                </span>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </nav>

                            {/* Auth buttons if not logged in */}
                            {!auth?.user && (
                                <div className="p-6 border-t border-gray-100 space-y-3">
                                    <Link
                                        href={route("login")}
                                        onClick={() => setIsOpen(false)}
                                        className="block w-full text-center px-4 py-3 text-gray-700 font-medium border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href={route("register")}
                                        onClick={() => setIsOpen(false)}
                                        className="block w-full text-center px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="p-6 border-t border-gray-100">
                                <p className="text-sm text-gray-500 text-center">
                                    © {new Date().getFullYear()} Relove Market
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Add padding to content to account for fixed navbar */}
            <div className="h-16 lg:h-20"></div>
        </>
    );
}
