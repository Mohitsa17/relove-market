import React from 'react';
import { RefreshCw, DollarSign, CheckCircle, Clock } from 'lucide-react';

export const StatsOverview = ({ metrics, metricsLoading, isMobile }) => {
    if (metricsLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
                <span className="ml-2 text-gray-600">Loading metrics...</span>
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Revenue",
            value: `RM ${metrics.totalRevenue?.toFixed(2) || '0.00'}`,
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-100"
        },
        {
            title: "Completed",
            value: metrics.completedTransactions || 0,
            icon: CheckCircle,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
        },
        {
            title: "Pending Release",
            value: metrics.pendingRelease || 0,
            icon: Clock,
            color: "text-amber-600",
            bgColor: "bg-amber-100"
        },
        {
            title: "Released",
            value: metrics.releasedPayments || 0,
            icon: DollarSign,
            color: "text-purple-600",
            bgColor: "bg-purple-100"
        }
    ];

    return (
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${isMobile ? 'text-sm' : ''}`}>
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div key={index} className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center sm:flex-row sm:items-start sm:justify-start">
                        <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color} mb-3 sm:mb-0 sm:mr-4 flex-shrink-0`}>
                            <Icon size={24} />
                        </div>
                        <div className="text-center sm:text-left">
                            <h4 className="text-gray-500 text-xs uppercase font-semibold tracking-wider mb-1">{stat.title}</h4>
                            <p className="font-bold text-gray-800 text-lg sm:text-xl">{stat.value}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
