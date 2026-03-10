import React from 'react';
import { Eye, DollarSign, RefreshCw } from 'lucide-react';
import dayjs from 'dayjs';

export const TransactionRow = ({ transaction, showOrderTracking, manualReleasePayment, actionLoading }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 p-4">
            <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                <div>
                    <h4 className="font-mono text-sm font-bold text-gray-900">{transaction.order_id}</h4>
                    <p className="text-xs text-gray-500 mt-1">{dayjs(transaction.created_at).format("DD MMM YYYY, HH:mm")}</p>
                </div>
                <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-1 ${
                        transaction.order_status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                        {transaction.order_status}
                    </span>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                    <p className="text-gray-500 text-xs">Buyer</p>
                    <p className="font-medium">{transaction.user?.name || 'Unknown'}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-xs">Seller</p>
                    <p className="font-medium">{transaction.seller?.seller_name || 'N/A'}</p>
                </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div>
                    <p className="text-gray-500 text-xs mb-1">Payout Status: <span className={`font-semibold ${transaction?.seller_earning?.[0]?.status === 'Released' ? 'text-green-600' : 'text-amber-600'}`}>{transaction?.seller_earning?.[0]?.status || 'Pending'}</span></p>
                    <p className="font-bold text-lg text-gray-900">RM {transaction?.seller_earning?.[0]?.payout_amount || transaction.amount}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => showOrderTracking(transaction)}
                        className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Track Order"
                    >
                        <Eye size={18} />
                    </button>
                    {transaction.order_status === "Completed" && transaction?.seller_earning?.[0]?.status === "Pending" && (
                        <button
                            onClick={() => manualReleasePayment(transaction.order_id)}
                            disabled={actionLoading === transaction.order_id}
                            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-xs font-medium"
                        >
                            {actionLoading === transaction.order_id ? (
                                <RefreshCw size={14} className="animate-spin" />
                            ) : (
                                <DollarSign size={14} />
                            )}
                            Release
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
