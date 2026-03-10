export function RejectSeller_Modal({
    selectedSeller,
    onReject,
    rejectionReason,
    setRejectionReason,
    onClose,
}) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-xl">
                <h2 className="text-xl text-black font-bold mb-4">
                    Reject Seller
                </h2>
                <p className="text-black">
                    Are you sure you want to reject{" "}
                    <span className="font-semibold">
                        {selectedSeller?.name}
                    </span>
                    ?
                </p>

                {/* Reason for rejection */}
                <div className="mt-4">
                    <label
                        htmlFor="rejectionReason"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Reason for Rejection (optional)
                    </label>
                    <textarea
                        id="rejectionReason"
                        name="reason"
                        rows="5"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter reason if rejecting..."
                        className="w-full textarea textarea-lg bg-white text-black border-solid border-2 border-black rounded-md p-2"
                    />
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="text-black bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();

                            onClose();
                            onReject(rejectionReason);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    >
                        Reject
                    </button>
                </div>
            </div>
        </div>
    );
}
