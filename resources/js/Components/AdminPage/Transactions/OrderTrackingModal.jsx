import React from 'react';
import { X } from 'lucide-react';

export const OrderTrackingModal = ({
    selectedTransaction,
    setShowOrderTrackingModal,
    orderStatusSteps,
    manualReleasePayment,
}) => {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-4 md:p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                        <h3 className="text-lg md:text-xl font-bold">Transaction Details</h3>
                        <p className="text-sm text-gray-500 font-mono mt-1">
                            {selectedTransaction.order_id}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowOrderTrackingModal(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 md:p-6 overflow-y-auto">
                    {/* Key Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
                        {/* Transaction Info */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h4 className="font-semibold mb-3 text-sm text-gray-500 uppercase">Payment Info</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Amount:</span>
                                    <span className="font-medium">RM {selectedTransaction.amount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Platform Fee:</span>
                                    <span className="font-medium text-red-600">-RM {selectedTransaction.seller_earning?.[0]?.commission_deducted || "0.00"}</span>
                                </div>
                                <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between font-bold">
                                    <span>Payout to Seller:</span>
                                    <span className="text-green-600">RM {selectedTransaction.seller_earning?.[0]?.payout_amount || selectedTransaction.amount}</span>
                                </div>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h4 className="font-semibold mb-3 text-sm text-gray-500 uppercase">Parties</h4>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="block text-xs text-gray-500 mb-1">Buyer</span>
                                    <div className="font-medium">{selectedTransaction.user?.name}</div>
                                    <div className="text-gray-600 truncate">{selectedTransaction.user?.email}</div>
                                </div>
                                <div className="pt-2 border-t border-gray-200">
                                    <span className="block text-xs text-gray-500 mb-1">Seller</span>
                                    <div className="font-medium">{selectedTransaction.seller?.seller_name}</div>
                                    <div className="text-gray-600 truncate">{selectedTransaction.seller?.user?.email}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <h4 className="font-semibold mb-4">Status Tracking</h4>
                    <div className="relative border-l-2 border-gray-200 ml-3 md:ml-4 space-y-6">
                        {orderStatusSteps.map((step, index) => {
                            const isCurrent = step.status === selectedTransaction.order_status;
                            const isPast = orderStatusSteps.findIndex(s => s.status === selectedTransaction.order_status) >= index;
                            const isReleasedStep = step.status === "Released";
                            
                            // Determine if this step should be marked as active/past
                            let isActive = isPast;
                            if (isReleasedStep) {
                                isActive = selectedTransaction.seller_earning?.[0]?.status === "Released";
                            }

                            return (
                                <div key={index} className="pl-6 relative">
                                    {/* Timeline Dot */}
                                    <div className={`absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-white ${
                                        isActive ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                                    }`} />
                                    
                                    <div className={`p-4 rounded-xl border ${
                                        isCurrent ? 'bg-indigo-50 border-indigo-100 ring-1 ring-indigo-500' : 'bg-white border-gray-100'
                                    }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${
                                                isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                                <step.icon size={20} />
                                            </div>
                                            <div>
                                                <h5 className={`font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                                    {step.status}
                                                </h5>
                                                <p className={`text-sm ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <div className="p-4 md:p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        onClick={() => setShowOrderTrackingModal(false)}
                        className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                        Close
                    </button>
                    {selectedTransaction.order_status === "Completed" && selectedTransaction.seller_earning?.[0]?.status === "Pending" && (
                        <button
                            onClick={() => {
                                setShowOrderTrackingModal(false);
                                manualReleasePayment(selectedTransaction.order_id);
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm"
                        >
                            Release Payment
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
