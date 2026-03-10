import React from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

export function BusinessTypeModal({
    isOpen,
    onClose,
    searchTerm,
    onSearchChange,
    filteredBusinesses,
    onBusinessSelect,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-black text-lg font-semibold">
                        Select Business Type
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FaTimes />
                    </button>
                </div>
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search business types..."
                            value={searchTerm}
                            onChange={onSearchChange}
                            className="text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                        />
                    </div>
                </div>
                <div className="overflow-y-auto max-h-60">
                    {filteredBusinesses.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {filteredBusinesses.map((business) => (
                                <li key={business.business_id}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onBusinessSelect(
                                                business.business_id,
                                                business.business_type
                                            )
                                        }
                                        className="text-black w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                                    >
                                        <span>{business.business_type}</span>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {business.business_description ||
                                                "No description available."}
                                        </p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            No business types found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
