import { FaEnvelope } from "react-icons/fa";
import TextInput from "../../TextInput";

export function ForgetPasswordModal({
    handleCloseForgetModal,
    forgetData,
    setForgetData,
    resetLink_submit,
    processingForget,
}) {
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4 text-center">
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={handleCloseForgetModal}
                ></div>

                <div className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:max-w-md sm:w-full sm:p-6">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={handleCloseForgetModal}
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
                            <FaEnvelope className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Reset your password
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    Enter your email address and we'll send you
                                    a link to reset your password.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={resetLink_submit} className="mt-5">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email address
                            </label>
                            <div className="mt-1">
                                <TextInput
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={forgetData.email}
                                    autoComplete="off"
                                    onChange={(e) =>
                                        setForgetData("email", e.target.value)
                                    }
                                    className="w-full"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-5 sm:mt-6">
                            <button
                                type="submit"
                                disabled={processingForget}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processingForget
                                    ? "Sending..."
                                    : "Send reset link"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
