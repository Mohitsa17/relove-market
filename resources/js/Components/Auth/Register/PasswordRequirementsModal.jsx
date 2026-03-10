import { FaLock } from "react-icons/fa";
import { PasswordRequirement } from "./PasswordRequirement";

export function PasswordRequirementsModal({
    setShowPasswordRequirements,
    passwordValidation,
    registerData,
    strengthText,
    strengthColor,
}) {
    return (
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
                            onClick={() => setShowPasswordRequirements(false)}
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
                                    For your security, please create a strong
                                    password that meets the following
                                    requirements:
                                </p>
                                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                    <PasswordRequirement
                                        met={
                                            passwordValidation.validations
                                                .length
                                        }
                                        text="At least 8 characters long"
                                    />
                                    <PasswordRequirement
                                        met={
                                            passwordValidation.validations
                                                .uppercase
                                        }
                                        text="One uppercase letter (A-Z)"
                                    />
                                    <PasswordRequirement
                                        met={
                                            passwordValidation.validations
                                                .lowercase
                                        }
                                        text="One lowercase letter (a-z)"
                                    />
                                    <PasswordRequirement
                                        met={
                                            passwordValidation.validations
                                                .number
                                        }
                                        text="One number (0-9)"
                                    />
                                    <PasswordRequirement
                                        met={
                                            passwordValidation.validations
                                                .special
                                        }
                                        text="One special character (!@#$%^&*)"
                                    />
                                </div>
                                {registerData.password && (
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
                            onClick={() => setShowPasswordRequirements(false)}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
