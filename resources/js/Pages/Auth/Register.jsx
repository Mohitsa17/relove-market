import { Footer } from "@/Components/BuyerPage/Footer";
import { Navbar } from "@/Components/BuyerPage/Navbar";
import { TermsPrivacyModal } from "@/Components/Auth/Register/TermsPrivacyModal";
import { PasswordRequirementsModal } from "@/Components/Auth/Register/PasswordRequirementsModal";
import { EmailVerificationModal } from "@/Components/Auth/Register/EmailVerificationModal";

import TextInput from "@/Components/TextInput";

import { Link, useForm, usePage } from "@inertiajs/react";

import { useEffect, useState } from "react";

import {
    FaEnvelope,
    FaLock,
    FaUser,
    FaEye,
    FaEyeSlash,
    FaCheck,
    FaTimes,
    FaInfoCircle,
} from "react-icons/fa";

import Swal from "sweetalert2";

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

const showConfirmationAlert = (
    title,
    text,
    confirmButtonText = "Yes",
    cancelButtonText = "Cancel"
) => {
    return Swal.fire({
        title,
        text,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText,
        cancelButtonText,
        customClass: {
            popup: "rounded-2xl",
            confirmButton: "px-4 py-2 rounded-lg font-medium",
            cancelButton: "px-4 py-2 rounded-lg font-medium",
        },
    });
};

// Password validation functions
const validatePassword = (password) => {
    const validations = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const isValid = Object.values(validations).every(Boolean);
    const strength = Object.values(validations).filter(Boolean).length;

    return { isValid, validations, strength };
};

const getPasswordStrengthText = (strength) => {
    if (strength === 0) return { text: "Very Weak", color: "text-red-600" };
    if (strength <= 2) return { text: "Weak", color: "text-red-500" };
    if (strength <= 3) return { text: "Fair", color: "text-yellow-500" };
    if (strength <= 4) return { text: "Good", color: "text-blue-500" };
    return { text: "Strong", color: "text-green-600" };
};

export default function Register() {
    const { flash } = usePage().props;
    const [showEmailVerificationModal, setShowEmailVerificationModal] =
        useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPasswordRequirements, setShowPasswordRequirements] =
        useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [nameValidation, setNameValidation] = useState({
        isValid: true,
        message: "",
    });
    const [passwordValidation, setPasswordValidation] = useState({
        isValid: false,
        validations: {
            length: false,
            uppercase: false,
            lowercase: false,
            number: false,
            special: false,
        },
        strength: 0,
    });

    const {
        data: registerData,
        setData: setRegisterData,
        post: postRegister,
        processing: processingRegister,
        reset,
        errors: registerErrors,
    } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const {
        data: verifyData,
        setData: setVerifyData,
        post: postResendEmail,
        processing: processingResendEmail,
    } = useForm({
        user_email: "",
    });

    // Handle flash messages and modal display
    useEffect(() => {
        if (flash?.errorMessage) {
            showAlert("error", "Error!", flash.errorMessage);
        }

        // Check if we should show the verification modal
        if (flash?.successMessage) {
            setVerifyData("user_email", registerData.email);
            setShowEmailVerificationModal(true);

            // Reset form fields but keep the email for verification
            reset("password", "password_confirmation", "name");
        }
    }, [flash]);

    useEffect(() => {
        if (registerData.name) {
            const nameRegex = /^[a-zA-Z\s]*$/;
            const isValid = nameRegex.test(registerData.name);

            if (!isValid) {
                setNameValidation({
                    isValid: false,
                    message: "Name should only contain letters and spaces",
                });
            } else if (registerData.name.trim().length < 2) {
                setNameValidation({
                    isValid: false,
                    message: "Name should be at least 2 characters long",
                });
            } else {
                setNameValidation({
                    isValid: true,
                    message: "",
                });
            }
        } else {
            setNameValidation({
                isValid: true,
                message: "",
            });
        }
    }, [registerData.name]);

    // Validate password on change
    useEffect(() => {
        if (registerData.password) {
            const validation = validatePassword(registerData.password);
            setPasswordValidation(validation);
        } else {
            setPasswordValidation({
                isValid: false,
                validations: {
                    length: false,
                    uppercase: false,
                    lowercase: false,
                    number: false,
                    special: false,
                },
                strength: 0,
            });
        }
    }, [registerData.password]);

    const closeTermsModal = () => {
        setShowTermsModal(false);
    };

    const closePrivacyModal = () => {
        setShowPrivacyModal(false);
    };

    const register_submit = async (e) => {
        e.preventDefault();

        // Validate form
        if (
            !registerData.name ||
            !registerData.email ||
            !registerData.password ||
            !registerData.password_confirmation
        ) {
            showAlert(
                "warning",
                "Missing Information",
                "Please fill in all required fields"
            );
            return;
        }

        // Validate name - no numbers or symbols allowed
        const nameRegex = /^[a-zA-Z\s]*$/; // Only letters and spaces allowed
        if (!nameRegex.test(registerData.name)) {
            showAlert(
                "warning",
                "Invalid Name",
                "Name should only contain letters and spaces. Numbers and symbols are not allowed."
            );
            return;
        }

        // Validate name length
        if (registerData.name.trim().length < 2) {
            showAlert(
                "warning",
                "Invalid Name",
                "Name should be at least 2 characters long."
            );
            return;
        }

        // Validate name doesn't contain only spaces
        if (registerData.name.trim() === "") {
            showAlert("warning", "Invalid Name", "Please enter a valid name.");
            return;
        }

        // Validate password strength - Show SweetAlert if requirements not met
        if (!passwordValidation.isValid) {
            showAlert(
                "warning",
                "Password Requirements Not Met",
                "Please create a password that meets all the requirements:\n\n• At least 8 characters long\n• Contains uppercase letters\n• Contains lowercase letters\n• Contains numbers\n• Contains special characters",
                "OK"
            );
            return;
        }

        // Validate password confirmation
        if (registerData.password !== registerData.password_confirmation) {
            showAlert(
                "error",
                "Password Mismatch",
                "Passwords do not match. Please make sure both passwords are identical."
            );
            return;
        }

        const loadingAlert = showLoadingAlert(
            "Creating Account",
            "Please wait while we create your account..."
        );

        // Use Inertia's post method with proper configuration
        postRegister(route("register"), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                loadingAlert.close();

                // Check if the response indicates we should show verification modal
                if (page.props.flash?.successMessage) {
                    setVerifyData("user_email", registerData.email);
                    setShowEmailVerificationModal(true);

                    // Clear the form but keep email for reference
                    setRegisterData({
                        ...registerData,
                        password: "",
                        password_confirmation: "",
                        name: "",
                    });
                }
            },
            onError: (errors) => {
                loadingAlert.close();

                let errorMessage =
                    "Failed to create account. Please try again.";

                if (errors.email) {
                    errorMessage = errors.email;
                } else if (errors.password) {
                    errorMessage = errors.password;
                } else if (errors.name) {
                    errorMessage = errors.name;
                }

                showAlert("error", "Registration Failed", errorMessage);
            },
        });
    };

    const resend_emailVerification = async (e) => {
        e.preventDefault();

        const loadingAlert = showLoadingAlert(
            "Sending Verification Email",
            "Please wait..."
        );

        postResendEmail(route("custom.verification.send"), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                loadingAlert.close();
                setShowEmailVerificationModal(false);
                showAlert(
                    "success",
                    "Email Sent!",
                    "A new verification link has been sent to your email address."
                );
            },
            onError: (errors) => {
                loadingAlert.close();
                showAlert(
                    "error",
                    "Failed to Send",
                    "Failed to send verification email. Please try again."
                );
            },
        });
    };

    const handleCloseVerificationModal = async () => {
        const result = await showConfirmationAlert(
            "Close Verification?",
            "Are you sure you want to close this window? You can always resend the verification email later.",
            "Yes, Close",
            "Stay"
        );

        if (result.isConfirmed) {
            setShowEmailVerificationModal(false);
        }
    };

    const { text: strengthText, color: strengthColor } =
        getPasswordStrengthText(passwordValidation.strength);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-16">
                <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Left Column - Register Form */}
                    <div className="py-10 px-8 sm:px-10">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Join Relove Market
                            </h2>
                            <p className="text-gray-600">
                                Create your account and start your sustainable
                                shopping journey
                            </p>
                        </div>

                        <form onSubmit={register_submit} className="space-y-6">
                            {/* Form fields remain the same */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUser className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        autoComplete="off"
                                        value={registerData.name}
                                        onChange={(e) =>
                                            setRegisterData(
                                                "name",
                                                e.target.value
                                            )
                                        }
                                        className={`pl-10 w-full ${
                                            registerData.name &&
                                            !nameValidation.isValid
                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                : ""
                                        }`}
                                        required
                                    />
                                </div>
                                {registerData.name &&
                                    !nameValidation.isValid && (
                                        <p className="text-red-600 text-sm mt-1 flex items-center">
                                            <FaTimes className="w-3 h-3 mr-1" />
                                            {nameValidation.message}
                                        </p>
                                    )}
                                {registerErrors.name && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {registerErrors.name}
                                    </p>
                                )}
                            </div>

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
                                        value={registerData.email}
                                        onChange={(e) =>
                                            setRegisterData(
                                                "email",
                                                e.target.value
                                            )
                                        }
                                        className="pl-10 w-full"
                                        required
                                    />
                                </div>
                                {registerErrors.email && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {registerErrors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password and other fields remain the same */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPasswordRequirements(true)
                                        }
                                        className="text-blue-600 hover:text-blue-500 text-sm font-medium flex items-center"
                                    >
                                        <FaInfoCircle className="w-3 h-3 mr-1" />
                                        Requirements
                                    </button>
                                </div>
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
                                        placeholder="Create a password"
                                        value={registerData.password}
                                        onChange={(e) =>
                                            setRegisterData(
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
                                {registerErrors.password && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {registerErrors.password}
                                    </p>
                                )}

                                {/* Password strength indicator */}
                                {registerData.password && (
                                    <div className="mt-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs text-gray-600">
                                                Password strength:
                                            </span>
                                            <span
                                                className={`text-xs font-medium ${strengthColor}`}
                                            >
                                                {strengthText}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                                    passwordValidation.strength <=
                                                    2
                                                        ? "bg-red-500"
                                                        : passwordValidation.strength <=
                                                          3
                                                        ? "bg-yellow-500"
                                                        : passwordValidation.strength <=
                                                          4
                                                        ? "bg-blue-500"
                                                        : "bg-green-500"
                                                }`}
                                                style={{
                                                    width: `${
                                                        (passwordValidation.strength /
                                                            5) *
                                                        100
                                                    }%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="password_confirmation"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password_confirmation"
                                        placeholder="Confirm your password"
                                        value={
                                            registerData.password_confirmation
                                        }
                                        onChange={(e) =>
                                            setRegisterData(
                                                "password_confirmation",
                                                e.target.value
                                            )
                                        }
                                        className="pl-10 pr-10 w-full"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? (
                                            <FaEyeSlash className="h-5 w-5" />
                                        ) : (
                                            <FaEye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {registerData.password_confirmation &&
                                    registerData.password !==
                                        registerData.password_confirmation && (
                                        <p className="text-red-600 text-sm mt-1 flex items-center">
                                            <FaTimes className="w-3 h-3 mr-1" />
                                            Passwords do not match
                                        </p>
                                    )}
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    required
                                />
                                <label
                                    htmlFor="terms"
                                    className="ml-2 block text-sm text-gray-600"
                                >
                                    I agree to the{" "}
                                    <button
                                        type="button"
                                        onClick={() => setShowTermsModal(true)}
                                        className="text-blue-600 hover:text-blue-500 underline cursor-pointer"
                                    >
                                        Terms of Service
                                    </button>{" "}
                                    and{" "}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPrivacyModal(true)
                                        }
                                        className="text-blue-600 hover:text-blue-500 underline cursor-pointer"
                                    >
                                        Privacy Policy
                                    </button>
                                </label>
                            </div>

                            {/* CHANGED: Button is no longer disabled based on password validation */}
                            <button
                                type="submit"
                                disabled={processingRegister}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processingRegister ? (
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
                                        Creating account...
                                    </span>
                                ) : (
                                    "Create Account"
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{" "}
                                <Link
                                    href={route("login")}
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Image & Benefits */}
                    <div className="hidden lg:block relative h-full">
                        <img
                            src="../image/register_bg.jpg"
                            alt="Shopping Woman"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-blue-900 bg-opacity-70"></div>
                        <div className="relative flex flex-col justify-center h-full p-12 text-white">
                            <h3 className="text-3xl font-bold mb-6">
                                Why Join Relove Market?
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <FaCheck className="h-6 w-6 text-green-300 mr-3 mt-1 flex-shrink-0" />
                                    <span>
                                        Access thousands of unique preloved
                                        items
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <FaCheck className="h-6 w-6 text-green-300 mr-3 mt-1 flex-shrink-0" />
                                    <span>
                                        Join a community of eco-conscious
                                        shoppers
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <FaCheck className="h-6 w-6 text-green-300 mr-3 mt-1 flex-shrink-0" />
                                    <span>
                                        Save money while reducing environmental
                                        impact
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <FaCheck className="h-6 w-6 text-green-300 mr-3 mt-1 flex-shrink-0" />
                                    <span>
                                        Secure transactions and buyer protection
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <FaCheck className="h-6 w-6 text-green-300 mr-3 mt-1 flex-shrink-0" />
                                    <span>
                                        Personalized recommendations based on
                                        your preferences
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Terms and Privacy Modals */}
            <TermsPrivacyModal
                isOpen={showTermsModal}
                onClose={closeTermsModal}
                modalType="terms"
            />

            {/* Privacy Policy Modal */}
            <TermsPrivacyModal
                isOpen={showPrivacyModal}
                onClose={closePrivacyModal}
                modalType="privacy"
            />

            {/* Password Requirements Modal */}
            {showPasswordRequirements && (
                <PasswordRequirementsModal
                    passwordValidation={passwordValidation}
                    registerData={registerData}
                    setShowPasswordRequirements={setShowPasswordRequirements}
                    strengthColor={strengthColor}
                    strengthText={strengthText}
                />
            )}

            {/* Email Verification Modal */}
            {showEmailVerificationModal && (
                <EmailVerificationModal
                    handleCloseVerificationModal={handleCloseVerificationModal}
                    processingResendEmail={processingResendEmail}
                    resend_emailVerification={resend_emailVerification}
                    verifyData={verifyData}
                />
            )}

            <Footer />
        </div>
    );
}
