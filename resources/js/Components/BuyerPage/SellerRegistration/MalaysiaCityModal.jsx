import React from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

export function MalaysiaCityModal({
    isOpen,
    onClose,
    searchTerm,
    onSearchChange,
    filteredCities,
    onCitySelect,
    selectedState,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-black text-lg font-semibold">
                        Select City in {selectedState}
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
                            placeholder="Search cities..."
                            value={searchTerm}
                            onChange={onSearchChange}
                            className="text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                        />
                    </div>
                </div>
                <div className="overflow-y-auto max-h-60">
                    {filteredCities.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {filteredCities.map((city) => (
                                <li key={city}>
                                    <button
                                        type="button"
                                        onClick={() => onCitySelect(city)}
                                        className="text-black w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                                    >
                                        {city}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            No cities found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
