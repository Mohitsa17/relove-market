export function SellerDeleteProduct_Modal({ product, onDelete, onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-lg text-black font-bold mb-4">
                    Delete Product
                </h3>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to delete{" "}
                    <strong>{product.product_name}</strong>?
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={(e) => {
                            onClose();
                            onDelete(e, product.product_id);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
