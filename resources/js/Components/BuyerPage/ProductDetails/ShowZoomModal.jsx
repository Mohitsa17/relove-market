import { X } from "lucide-react";

export function ShowZoomModal({
    product_info,
    setShowZoomModal,
    selectedImage,
}) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <button
                onClick={() => setShowZoomModal(false)}
                className="absolute top-4 right-4 text-white p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
            >
                <X size={20} />
            </button>
            <img
                src={import.meta.env.VITE_BASE_URL + selectedImage}
                alt={product_info[0]?.product_name}
                className="max-w-full max-h-full object-contain"
            />
        </div>
    );
}
