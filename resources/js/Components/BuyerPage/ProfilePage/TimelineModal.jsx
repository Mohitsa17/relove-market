import React from 'react';
import { X, Clock, CheckCircle, Truck, Package, PackageCheck } from 'lucide-react';
import dayjs from 'dayjs';

export const TimelineModal = ({
    getOrderTotal,
    getProductImage,
    getProductName,
    getTotalItemsCount,
    timelineModal,
    setTimelineModal
}) => {
    if (!timelineModal.isOpen || !timelineModal.order) return null;

    const { order } = timelineModal;
    const currentStatus = order.order_status;

    const closeModal = () => {
        setTimelineModal({ isOpen: false, order: null });
    };

    // Define the sequence of statuses
    const timelineSteps = [
        { status: 'Pending', icon: Clock, label: 'Order Placed', description: 'Your order is pending confirmation.' },
        { status: 'Processing', icon: Package, label: 'Processing', description: 'Seller is preparing your item.' },
        { status: 'Shipped', icon: Truck, label: 'Shipped', description: 'Your item is on the way.' },
        { status: 'Delivered', icon: PackageCheck, label: 'Delivered', description: 'Your item has been delivered.' },
        { status: 'Completed', icon: CheckCircle, label: 'Completed', description: 'Order successfully finished.' }
    ];

    // Determine current progress
    const currentIndex = timelineSteps.findIndex(s => s.status.toLowerCase() === currentStatus.toLowerCase());
    const isCancelled = ['Cancelled', 'Refunded'].includes(currentStatus);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] shadow-xl animate-in zoom-in duration-200">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Track Order</h3>
                        <p className="text-sm text-gray-500 font-mono mt-1">ID: {order.order_id}</p>
                    </div>
                    <button
                        onClick={closeModal}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 md:p-6 overflow-y-auto">
                    {/* Order Summary Snapshot */}
                    <div className="flex items-center gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <img
                            src={import.meta.env.VITE_BASE_URL + getProductImage(order)}
                            alt={getProductName(order)}
                            className="w-16 h-16 rounded-lg object-cover bg-white"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm line-clamp-1">{getProductName(order)}</p>
                            <p className="text-gray-600 text-xs mt-1">Qty: {getTotalItemsCount(order)} items</p>
                            <p className="text-blue-600 font-bold text-sm mt-1">RM {getOrderTotal(order).toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Timeline */}
                    <h4 className="font-semibold text-gray-900 mb-6">Order Status</h4>
                    
                    {isCancelled ? (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-3 border border-red-100">
                            <X className="text-red-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Order {currentStatus}</p>
                                <p className="text-sm text-red-600/80">This order has been {currentStatus.toLowerCase()} and cannot be processed further.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 pb-4">
                            {timelineSteps.map((step, index) => {
                                // A step is active if it's the current one, or if we have passed it in the index
                                const isActive = currentIndex >= index;
                                const isCurrent = currentIndex === index;

                                return (
                                    <div key={index} className="pl-6 relative">
                                        <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white transition-colors duration-300 ${
                                            isActive ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                                        }`} />
                                        
                                        <div className={`flex gap-4 items-start ${!isActive && 'opacity-50'}`}>
                                            <div className={`p-2 rounded-lg flex-shrink-0 ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                                <step.icon size={20} />
                                            </div>
                                            <div>
                                                <h5 className={`font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'} ${isCurrent && 'text-blue-600'}`}>
                                                    {step.label}
                                                </h5>
                                                <p className={`text-sm mt-1 ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                                                    {step.description}
                                                </p>
                                                {/* Specifically for order placed, show the creation date */}
                                                {index === 0 && isActive && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {dayjs(order.created_at).format("DD MMM YYYY, hh:mm A")}
                                                    </p>
                                                )}
                                                {/* Specifically for Shipped, try to show tracking number if available */}
                                                {index === 2 && isActive && order.tracking_number && (
                                                    <div className="mt-2 text-xs bg-gray-50 p-2 rounded border border-gray-100 inline-block">
                                                        <span className="text-gray-500">Tracking: </span>
                                                        <span className="font-mono text-gray-800 font-medium">{order.tracking_number}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end rounded-b-2xl">
                    <button
                        onClick={closeModal}
                        className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
