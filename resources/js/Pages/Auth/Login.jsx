import { Link, useForm, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
    FaEye,
    FaEyeSlash,
    FaEnvelope,
    FaLock,
    FaCheckCircle,
} from "react-icons/fa";

import Swal from "sweetalert2";

import { ForgetPasswordModal } from "@/Components/Auth/Login/ForgetPasswordModal";
import { ResetPasswordModal } from "@/Components/Auth/Login/ResetPasswordModal";
import { Footer } from "@/Components/BuyerPage/Footer";
import { Navbar } from "@/Components/BuyerPage/Navbar";
import TextInput from "@/Components/TextInput";

// SweetAlert configuration
const showAlert = (icon, title, text, confirmButtonText = "OK") => {
    return Swal.fire({
        icon,
        title,
        text,
        confirmButtonText,
        confirmButtonColor: "#3085d6",
        customClass: {
            popup: "rounded-2xl",
            confirmButton: "px-4 py-2 rounded-lg font-medium",
        },
    });
};

const showLoadingAlert = (title, text = "") => {
    return Swal.fire({
        title,
        text,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });
};

export default function Login() {
    const { flash, token, email } = usePage().props;

    const [showResetModal, setShowResetModal] = useState(false);
    const [showForgetModal, setShowForgetModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // login account
    const {
        data: loginData,
        setData: setLoginData,
        post: postLogin,
        processing: processingLogin,
        reset,
    } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    // forget password
    const {
        data: forgetData,
        setData: setForgetData,
        post: postForget,
        processing: processingForget,
    } = useForm({
        email: "",
    });

    // reset password
    const {
        data: resetData,
        setData: setResetData,
        post: postReset,
        processing: processingReset,
    } = useForm({
        token: token,
        email: email,
        password: "",
        password_confirmation: "",
    });

    useEffect(() => {
        // Show success message if exists
        if (flash?.successMessage) {
            showAlert("success", "Success!", flash.successMessage);
        }

        // Show error message if exists
        if (flash?.errorMessage) {
            showAlert("error", "Error!", flash.errorMessage);
        }

        // Handle reset password modal
        if (resetData.token && resetData.email) {
            setShowResetModal(true);
        }

        // Handle reset password URL
        if (window.location.pathname.includes("/reset-password/")) {
            const pathSegments = window.location.pathname.split("/");
            const tokenFromPath = pathSegments[pathSegments.length - 1];
            const emailFromURL = new URL(window.location.href).searchParams.get(
                "email"
            );

            if (tokenFromPath && emailFromURL) {
                setResetData("token", tokenFromPath);
                setResetData("email", emailFromURL);
            }
        }

        if (flash.cleanUrl) {
            window.history.replaceState({}, "", "/reset-password");
        }
    }, [flash, resetData.token, resetData.email, flash?.cleanUrl]);

    const loginAccount_submit = async (e) => {
        e.preventDefault();

        if (!loginData.email || !loginData.password) {
            showAlert(
                "warning",
                "Missing Information",
                "Please fill in all fields"
            );
            return;
        }

        const loadingAlert = showLoadingAlert(
            "Signing In",
            "Please wait while we sign you in..."
        );

        try {
            const response = await fetch(route("login"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]'
                    ).content,
                    "X-Requested-With": "XMLHttpRequest",
                    "X-Inertia": "true",
                },
                credentials: "include", // Important for session cookies
                body: JSON.stringify(loginData),
            });

            const data = await response.json();
            loadingAlert.close();

            if (response.ok && data.success) {
                // Update CSRF token in meta tag
                if (data.csrf_token) {
                    const metaTag = document.querySelector(
                        'meta[name="csrf-token"]'
                    );
                    if (metaTag) {
                        metaTag.content = data.csrf_token;
                        console.log("CSRF token updated in meta tag");
                    }

                    // Update global variable
                    window.__csrfToken = data.csrf_token;

                    // Update axios if available
                    if (window.axios) {
                        window.axios.defaults.headers.common["X-CSRF-TOKEN"] =
                            data.csrf_token;
                    }
                }

                // Show success message
                showAlert("success", "Login Successful!", "Redirecting...");

                // Redirect after a short delay
                setTimeout(() => {
                    if (data.redirect) {
                        window.location.href = data.redirect;
                    } else {
                        window.location.href = "/";
                    }
                }, 1000);
            } else {
                throw new Error(data.message || "Login failed");
            }
        } catch (error) {
            loadingAlert.close();
            console.error("Login error:", error);

            let errorMessage =
                error.message || "Invalid email or password. Please try again.";

            // Check for validation errors
            if (error.errors) {
                if (error.errors.email) {
                    errorMessage = error.errors.email[0];
                } else if (error.errors.password) {
                    errorMessage = error.errors.password[0];
                }
            }

            showAlert("error", "Login Failed", errorMessage);
            reset("password"); // Only reset password, keep email
        }
    };

    // forgot password
    const resetLink_submit = async (e) => {
        e.preventDefault();

        if (!forgetData.email) {
            showAlert(
                "warning",
                "Email Required",
                "Please enter your email address"
            );
            return;
        }

        const loadingAlert = showLoadingAlert(
            "Sending Reset Link",
            "Please wait..."
        );

        postForget(route("password.email"), {
            email: forgetData.email,
            onSuccess: () => {
                loadingAlert.close();
                setShowForgetModal(false);
                setForgetData("email", "");
                showAlert(
                    "success",
                    "Reset Link Sent!",
                    "If your email exists in our system, you will receive a password reset link shortly."
                );
            },
            onError: (errors) => {
                loadingAlert.close();
                let errorMessage =
                    errors.email ||
                    "Error sending reset link. Please try again.";
                showAlert("error", "Failed to Send", errorMessage);
            },
        });
    };

    // reset password
    const updatePassword_submit = async (e) => {
        e.preventDefault();

        if (!resetData.password || !resetData.password_confirmation) {
            showAlert(
                "warning",
                "Missing Information",
                "Please fill in all password fields"
            );
            return;
        }

        if (resetData.password !== resetData.password_confirmation) {
            showAlert(
                "error",
                "Password Mismatch",
                "Passwords do not match. Please try again."
            );
            return;
        }

        const loadingAlert = showLoadingAlert(
            "Updating Password",
            "Please wait..."
        );

        postReset(route("password.store"), {
            onSuccess: () => {
                loadingAlert.close();
                setShowResetModal(false);
                setResetData({
                    token: "",
                    email: "",
                    password: "",
                    password_confirmation: "",
                });
                showAlert(
                    "success",
                    "Password Updated!",
                    "Your password has been updated successfully. You can now login with your new password."
                ).then(() => {
                    window.location.href = "/login";
                });
            },
            onError: (errors) => {
                loadingAlert.close();
                let errorMessage =
                    "Error resetting password. Please try again.";

                if (errors.password) {
                    errorMessage = errors.password[0];
                } else if (errors.email) {
                    errorMessage = errors.email;
                } else if (errors.token) {
                    errorMessage =
                        "Invalid or expired reset token. Please request a new reset link.";
                }

                showAlert("error", "Reset Failed", errorMessage);
            },
        });
    };

    const handleForgetPasswordClick = () => {
        setShowForgetModal(true);
    };

    const handleCloseForgetModal = () => {
        setShowForgetModal(false);
        setForgetData("email", "");
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-12">
                <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Left Column - Login Form */}
                    <div className="py-10 px-8 sm:px-10">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-gray-600">
                                Sign in to your Relove Market account
                            </p>
                        </div>

                        <form
                            onSubmit={loginAccount_submit}
                            className="space-y-6"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        autoComplete="off"
                                        value={loginData.email}
                                        onChange={(e) =>
                                            setLoginData(
                                                "email",
                                                e.target.value
                                            )
                                        }
                                        className="pl-10 w-full"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        placeholder="Enter your password"
                                        value={loginData.password}
                                        onChange={(e) =>
                                            setLoginData(
                                                "password",
                                                e.target.value
                                            )
                                        }
                                        className="pl-10 pr-10 w-full"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <FaEyeSlash className="h-5 w-5" />
                                        ) : (
                                            <FaEye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={loginData.remember}
                                        onChange={(e) =>
                                            setLoginData(
                                                "remember",
                                                e.target.checked
                                            )
                                        }
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">
                                        Remember me
                                    </span>
                                </label>

                                <button
                                    type="button"
                                    onClick={handleForgetPasswordClick}
                                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={processingLogin}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processingLogin ? (
                                    <span className="flex items-center justify-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v8H4z"
                                            ></path>
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    "Sign in"
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{" "}
                                <Link
                                    href={route("register")}
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Image & Features */}
                    <div className="hidden lg:block relative h-full">
                        <img
                            src="../image/login_bg.jpg"
                            alt="Shopping Woman"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-blue-900 bg-opacity-70"></div>
                        <div className="relative flex flex-col items-center justify-center h-full p-12 text-white">
                            <h3 className="text-3xl text-center font-bold mb-6">
                                Join Our Sustainable Community
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <FaCheckCircle className="h-6 w-6 text-green-300 mr-3 mt-1 flex-shrink-0" />
                                    <span>
                                        Access thousands of eco-conscious buyers
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <FaCheckCircle className="h-6 w-6 text-green-300 mr-3 mt-1 flex-shrink-0" />
                                    <span>Sell your preloved items easily</span>
                                </li>
                                <li className="flex items-start">
                                    <FaCheckCircle className="h-6 w-6 text-green-300 mr-3 mt-1 flex-shrink-0" />
                                    <span>Track your environmental impact</span>
                                </li>
                                <li className="flex items-start">
                                    <FaCheckCircle className="h-6 w-6 text-green-300 mr-3 mt-1 flex-shrink-0" />
                                    <span>
                                        Secure transactions and fast payouts
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgetModal && (
                <ForgetPasswordModal
                    forgetData={forgetData}
                    handleCloseForgetModal={handleCloseForgetModal}
                    processingForget={processingForget}
                    resetLink_submit={resetLink_submit}
                    setForgetData={setForgetData}
                />
            )}

            {/* Reset Password Modal */}
            {showResetModal && (
                <ResetPasswordModal
                    handleCloseResetModal={handleCloseForgetModal}
                    processingReset={processingReset}
                    resetData={resetData}
                    setResetData={setResetData}
                    updatePassword_submit={updatePassword_submit}
                />
            )}

            <Footer />
        </div>
    );
}
