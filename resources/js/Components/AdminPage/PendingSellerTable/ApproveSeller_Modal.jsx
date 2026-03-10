export function ApproveSeller_Modal({ selectedSeller, onApprove, onClose }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl text-black font-bold mb-4">
                    Approve Seller
                </h2>
                <p className="text-black">
                    Are you sure you want to approve{" "}
                    <span className="font-semibold">
                        {selectedSeller?.name}
                    </span>
                    ?
                </p>
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onClose();
                            onApprove();
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Approve
                    </button>
                </div>
            </div>
        </div>
    );
}
