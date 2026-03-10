// Terms and Privacy Modal Component
export function TermsPrivacyModal({ isOpen, onClose, modalType }) {
    if (!isOpen) return null;

    const modalContent = {
        terms: {
            title: "Terms of Service",
            content: (
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Welcome to Relove Market. By accessing or using our
                        platform, you agree to be bound by these Terms of
                        Service.
                    </p>
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">
                            User Responsibilities
                        </h4>
                        <p className="text-gray-600">
                            You are responsible for maintaining the
                            confidentiality of your account and password and for
                            restricting access to your computer.
                        </p>
                        <h4 className="font-medium text-gray-900">
                            Service Modifications
                        </h4>
                        <p className="text-gray-600">
                            We reserve the right to modify or discontinue,
                            temporarily or permanently, the service with or
                            without notice.
                        </p>
                        <h4 className="font-medium text-gray-900">
                            User Conduct
                        </h4>
                        <p className="text-gray-600">
                            You agree not to use the service for any illegal
                            purpose or in any way that violates these terms.
                        </p>
                    </div>
                </div>
            ),
        },
        privacy: {
            title: "Privacy Policy",
            content: (
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Your privacy is important to us. This Privacy Policy
                        explains how we collect, use, and protect your personal
                        information.
                    </p>
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">
                            Information We Collect
                        </h4>
                        <p className="text-gray-600">
                            We collect information you provide directly to us,
                            such as when you create an account, use our
                            services, or contact us for support.
                        </p>
                        <h4 className="font-medium text-gray-900">
                            How We Use Information
                        </h4>
                        <p className="text-gray-600">
                            We use the information we collect to provide,
                            maintain, and improve our services, and to develop
                            new ones.
                        </p>
                        <h4 className="font-medium text-gray-900">
                            Data Security
                        </h4>
                        <p className="text-gray-600">
                            We implement appropriate technical and
                            organizational measures to protect your personal
                            information against unauthorized access.
                        </p>
                    </div>
                </div>
            ),
        },
    };

    const currentModal = modalContent[modalType];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {currentModal.title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {currentModal.content}

                    {/* Contact Information */}
                    <section className="bg-gray-50 p-4 rounded-lg mt-6">
                        <h4 className="font-medium text-gray-900 mb-2">
                            Questions?
                        </h4>
                        <p className="text-gray-600 text-sm">
                            If you have any questions about our{" "}
                            {modalType === "terms"
                                ? "Terms of Service"
                                : "Privacy Policy"}
                            , please contact us at{" "}
                            <a
                                href="mailto:support@relovemarket.com"
                                className="text-blue-600 hover:text-blue-500"
                            >
                                support@relovemarket.com
                            </a>
                        </p>
                    </section>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    );
};
