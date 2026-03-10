export function SellerDetails_Modal({
    selectedSeller,
    onApprove,
    onReject,
    onClose,
}) {
    return (
        <>
            {/* Modal Backdrop */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                {/* Modal Container */}
                <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                Seller Registration Details
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Review seller information and documents
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            aria-label="Close modal"
                        >
                            <svg
                                className="w-6 h-6 text-gray-500"
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

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-6">
                            {/* Seller Information Section */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <svg
                                        className="w-5 h-5 mr-2 text-indigo-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    Seller Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <label className="text-sm font-medium text-gray-500">
                                            Full Name
                                        </label>
                                        <p className="text-gray-900 font-medium mt-1">
                                            {selectedSeller?.name ||
                                                "Not provided"}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <label className="text-sm font-medium text-gray-500">
                                            Email Address
                                        </label>
                                        <p className="text-gray-900 font-medium mt-1">
                                            {selectedSeller?.email ||
                                                "Not provided"}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <label className="text-sm font-medium text-gray-500">
                                            Phone Number
                                        </label>
                                        <p className="text-gray-900 font-medium mt-1">
                                            {selectedSeller?.phone_number ||
                                                "Not provided"}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <label className="text-sm font-medium text-gray-500">
                                            Registration ID
                                        </label>
                                        <p className="text-gray-900 font-medium mt-1">
                                            {selectedSeller?.registration_id ||
                                                "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Business Information Section */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <svg
                                        className="w-5 h-5 mr-2 text-indigo-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                        />
                                    </svg>
                                    Business Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <label className="text-sm font-medium text-gray-500">
                                            Store Name
                                        </label>
                                        <p className="text-gray-900 font-medium mt-1">
                                            {selectedSeller?.store_name ||
                                                "Not provided"}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <label className="text-sm font-medium text-gray-500">
                                            Business Type
                                        </label>
                                        <p className="text-gray-900 font-medium mt-1">
                                            {selectedSeller?.business
                                                ?.business_type ||
                                                "Not specified"}
                                        </p>
                                    </div>
                                    {selectedSeller?.business
                                        ?.business_address && (
                                        <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-500">
                                                Business Address
                                            </label>
                                            <p className="text-gray-900 font-medium mt-1">
                                                {
                                                    selectedSeller.business
                                                        .business_address
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Documents Section */}
                            {selectedSeller?.verification_image && (
                                <section>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <svg
                                            className="w-5 h-5 mr-2 text-indigo-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        Verification Document
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
                                                    <svg
                                                        className="w-6 h-6 text-red-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        Verification Document
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Image Format Document
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={`${
                                                    import.meta.env
                                                        .VITE_BASE_URL
                                                }${
                                                    selectedSeller.verification_image
                                                }`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    />
                                                </svg>
                                                View Document
                                            </a>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Additional Information */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <svg
                                        className="w-5 h-5 mr-2 text-indigo-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    Additional Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <label className="text-sm font-medium text-gray-500">
                                            Registration Date
                                        </label>
                                        <p className="text-gray-900 font-medium mt-1">
                                            {selectedSeller?.created_at
                                                ? new Date(
                                                      selectedSeller.created_at
                                                  ).toLocaleDateString(
                                                      "en-US",
                                                      {
                                                          year: "numeric",
                                                          month: "long",
                                                          day: "numeric",
                                                      }
                                                  )
                                                : "Not available"}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <label className="text-sm font-medium text-gray-500">
                                            Current Status
                                        </label>
                                        <div className="mt-1">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                    selectedSeller?.status ===
                                                    "Pending"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : selectedSeller?.status ===
                                                          "Approved"
                                                        ? "bg-green-100 text-green-800"
                                                        : selectedSeller?.status ===
                                                          "Rejected"
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {selectedSeller?.status ||
                                                    "Unknown"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Footer with Actions - Only show for Pending status */}
                    {selectedSeller?.status === "Pending" && (
                        <div className="border-t border-gray-200 bg-gray-50 p-6">
                            <div className="flex flex-col sm:flex-row gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        onReject();
                                        onClose();
                                    }}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-red-300 text-red-700 bg-white hover:bg-red-50 rounded-lg transition-colors duration-200 font-medium w-full sm:w-auto"
                                >
                                    <svg
                                        className="w-4 h-4"
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
                                    Reject Application
                                </button>
                                <button
                                    onClick={() => {
                                        onApprove();
                                        onClose();
                                    }}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium w-full sm:w-auto"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    Approve Seller
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Status Message for Approved/Rejected Applications */}
                    {selectedSeller?.status !== "Pending" && (
                        <div className="border-t border-gray-200 bg-gray-50 p-6">
                            <div className="text-center">
                                <div
                                    className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg ${
                                        selectedSeller?.status === "Approved"
                                            ? "bg-green-50 text-green-700 border border-green-200"
                                            : "bg-red-50 text-red-700 border border-red-200"
                                    }`}
                                >
                                    {selectedSeller?.status === "Approved" ? (
                                        <>
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            <span className="font-medium">
                                                This application has been
                                                approved
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                className="w-5 h-5"
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
                                            <span className="font-medium">
                                                This application has been
                                                rejected
                                            </span>
                                        </>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    {selectedSeller?.status === "Approved"
                                        ? "The seller has been approved and can now access the seller dashboard."
                                        : "This application has been rejected and cannot be processed further."}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
