import {
    FaLock,
    FaEye,
    FaEyeSlash,
    FaInfoCircle,
    FaCheck,
    FaTimes,
} from "react-icons/fa";
import TextInput from "../../TextInput";
import { useState, useEffect } from "react";

// Password validation functions (same as register page)
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

const PasswordRequirement = ({ met, text }) => (
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

export function ResetPasswordModal({
    handleCloseResetModal,
    resetData,
    setResetData,
    updatePassword_submit,
    processingReset,
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPasswordRequirements, setShowPasswordRequirements] =
        useState(false);
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

    // Validate password on change
    useEffect(() => {
        if (resetData.password) {
            const validation = validatePassword(resetData.password);
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
    }, [resetData.password]);

    const { text: strengthText, color: strengthColor } =
        getPasswordStrengthText(passwordValidation.strength);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate password strength
        if (!passwordValidation.isValid) {
            alert(
                "Please create a stronger password that meets all requirements."
            );
            return;
        }

        // Validate password confirmation
        if (resetData.password !== resetData.password_confirmation) {
            alert(
                "Passwords do not match. Please make sure both passwords are identical."
            );
            return;
        }

        updatePassword_submit(e);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4 text-center">
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={handleCloseResetModal}
                ></div>

                <div className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:max-w-md sm:w-full sm:p-6">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={handleCloseResetModal}
                        >
                            <span className="sr-only">Close</span>
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                            <FaLock className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Set New Password
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    Create a strong password for your account
                                    security.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <TextInput
                                type="email"
                                value={resetData.email}
                                readOnly
                                className="w-full bg-gray-100"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    New Password
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
                                <TextInput
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Create a strong password"
                                    value={resetData.password}
                                    onChange={(e) =>
                                        setResetData("password", e.target.value)
                                    }
                                    className="w-full pr-10"
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

                            {/* Password strength indicator */}
                            {resetData.password && (
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
                                                passwordValidation.strength <= 2
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
                                <TextInput
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password_confirmation"
                                    placeholder="Confirm your password"
                                    value={resetData.password_confirmation}
                                    onChange={(e) =>
                                        setResetData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    className="w-full pr-10"
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
                            {resetData.password_confirmation &&
                                resetData.password !==
                                    resetData.password_confirmation && (
                                    <p className="text-red-600 text-sm mt-1 flex items-center">
                                        <FaTimes className="w-3 h-3 mr-1" />
                                        Passwords do not match
                                    </p>
                                )}
                        </div>

                        <div className="mt-5 sm:mt-6">
                            <button
                                type="submit"
                                disabled={
                                    processingReset ||
                                    !passwordValidation.isValid ||
                                    resetData.password !==
                                        resetData.password_confirmation
                                }
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processingReset
                                    ? "Updating..."
                                    : "Update Password"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Password Requirements Modal */}
            {showPasswordRequirements && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-full p-4 text-center">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={() => setShowPasswordRequirements(false)}
                        ></div>

                        <div className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:max-w-md sm:w-full sm:p-6">
                            <div className="absolute top-0 right-0 pt-4 pr-4">
                                <button
                                    type="button"
                                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                                    onClick={() =>
                                        setShowPasswordRequirements(false)
                                    }
                                >
                                    <span className="sr-only">Close</span>
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <FaLock className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Password Requirements
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500 mb-4">
                                            For your security, please create a
                                            strong password that meets the
                                            following requirements:
                                        </p>
                                        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                            <PasswordRequirement
                                                met={
                                                    passwordValidation
                                                        .validations.length
                                                }
                                                text="At least 8 characters long"
                                            />
                                            <PasswordRequirement
                                                met={
                                                    passwordValidation
                                                        .validations.uppercase
                                                }
                                                text="One uppercase letter (A-Z)"
                                            />
                                            <PasswordRequirement
                                                met={
                                                    passwordValidation
                                                        .validations.lowercase
                                                }
                                                text="One lowercase letter (a-z)"
                                            />
                                            <PasswordRequirement
                                                met={
                                                    passwordValidation
                                                        .validations.number
                                                }
                                                text="One number (0-9)"
                                            />
                                            <PasswordRequirement
                                                met={
                                                    passwordValidation
                                                        .validations.special
                                                }
                                                text="One special character (!@#$%^&*)"
                                            />
                                        </div>
                                        {resetData.password && (
                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-blue-900">
                                                        Current Strength:
                                                    </span>
                                                    <span
                                                        className={`text-sm font-semibold ${strengthColor}`}
                                                    >
                                                        {strengthText}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-blue-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 ${
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
                                </div>
                            </div>

                            <div className="mt-5 sm:mt-6">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPasswordRequirements(false)
                                    }
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Got it
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
