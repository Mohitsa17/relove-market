import React from "react";
import { CheckCircle, X } from "lucide-react";

export const SuccessConfirmationModal = ({
    confirmedOrder,
    setConfirmedOrder,
    setShowSuccessModal,
    showSuccessModal,
}) => {
    if (!showSuccessModal) return null;

    const closeModal = () => {
        setShowSuccessModal(false);
        setConfirmedOrder(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>
                
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                        <CheckCircle size={32} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Order Confirmed
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-6">
                        {confirmedOrder?.order_id 
                            ? `Order ${confirmedOrder.order_id} has been successfully confirmed as delivered.` 
                            : 'Your order delivery has been successfully confirmed.'}
                    </p>
                    
                    <button
                        onClick={closeModal}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl transition-colors"
                    >
                        Great, thanks!
                    </button>
                </div>
            </div>
        </div>
    );
};
