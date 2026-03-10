import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import axios from "axios";

import { Sidebar } from "@/Components/AdminPage/Sidebar";
import { LoadingProgress } from "@/Components/AdminPage/LoadingProgress";
import { SellerDetails_Modal } from "@/Components/AdminPage/PendingSellerTable/SellerDetails_Modal";
import { ApproveSeller_Modal } from "@/Components/AdminPage/PendingSellerTable/ApproveSeller_Modal";
import { RejectSeller_Modal } from "@/Components/AdminPage/PendingSellerTable/RejectSeller_Modal";

export default function PendingSellerTable() {
    const [sellers, setSellers] = useState([]);

    const [filter, setFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("Pending");
    const itemsPerPage = 5;

    const [selectedSeller, setSelectedSeller] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const [sellerDetails_modal, setSellerDetails_modal] = useState(false);
    const [approveSeller_modal, setApproveSeller_modal] = useState(false);
    const [rejectSeller_modal, setRejectSeller_modal] = useState(false);

    const [rejectionReason, setRejectionReason] = useState("");

    const [modalMessage, setModalMessage] = useState("");
    const [modalType, setModalType] = useState(""); // "success" or "error"
    const [loadingProgress, setLoadingProgress] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [pendingCount, setPendingCount] = useState(0);

    const [isOpen, setIsOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [pagination, setPagination] = useState({
        from: 0,
        to: 0,
        total: 0,
    });

    // Ref for dropdown container to handle outside clicks
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Status Badge Component
    function StatusBadge({ status }) {
        const statusColors = {
            Pending: "bg-yellow-100 text-yellow-800",
            Approved: "bg-green-100 text-green-800",
            Rejected: "bg-red-100 text-red-800",
            Registered: "bg-blue-100 text-blue-800",
        };

        return (
            <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    statusColors[status] || "bg-gray-100 text-gray-800"
                }`}
            >
                {status}
            </span>
        );
    }

    // Dropdown Actions Component
    function ActionDropdown({ seller, isOpen, onToggle, onClose }) {
        return (
            <div className="relative" ref={dropdownRef}>
                {/* Dropdown Toggle Button - Show on mobile, hide on larger screens */}
                <button
                    onClick={onToggle}
                    className="sm:hidden text-gray-600 hover:text-gray-900 p-1 rounded-md border border-gray-300 bg-white z-20 relative"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                        />
                    </svg>
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 sm:hidden"
                        style={{ top: "100%" }}
                    >
                        <div className="py-1">
                            <button
                                onClick={() => {
                                    setSelectedSeller(seller);
                                    setSellerDetails_modal(true);
                                    onClose();
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <svg
                                    className="w-4 h-4 mr-2 text-indigo-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                                View Details
                            </button>

                            {seller.status === "Pending" && (
                                <>
                                    <button
                                        onClick={() => {
                                            setSelectedSeller(seller);
                                            setApproveSeller_modal(true);
                                            onClose();
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                                    >
                                        <svg
                                            className="w-4 h-4 mr-2 text-green-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        Approve Seller
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedSeller(seller);
                                            setRejectSeller_modal(true);
                                            onClose();
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    >
                                        <svg
                                            className="w-4 h-4 mr-2 text-red-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                        Reject Seller
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Fetch sellers from database with filters and pagination
    const fetchSellers = async (
        page = 1,
        status = statusFilter,
        search = filter
    ) => {
        try {
            setIsLoading(true);

            const params = new URLSearchParams({
                page: page.toString(),
                per_page: itemsPerPage.toString(),
            });

            if (status && status !== "All") {
                params.append("status", status);
            }

            if (search) {
                params.append("search", search);
            }

            const res = await axios.get(
                `/api/admin/dashboard/seller-list?${params}`
            );
            const responseData = res.data;

            setSellers(responseData.data || []);

            setCurrentPage(responseData.current_page || 1);
            setLastPage(responseData.last_page || 1);

            setPagination({
                from: responseData.from || 0,
                to: responseData.to || 0,
                total: responseData.total || 0,
                current_page: responseData.current_page || 1,
                last_page: responseData.last_page || 1,
            });

            // Update pending count
            const pending = (responseData.data || []).filter(
                (s) => s.status === "Pending"
            ).length;
            setPendingCount(pending);
        } catch (error) {
            console.error("Failed to fetch sellers:", error);
            // Reset to safe state on error
            setSellers([]);
            setCurrentPage(1);
            setLastPage(1);
            setPagination({
                from: 0,
                to: 0,
                total: 0,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle page change
    const handlePageChange = (page) => {
        if (page < 1 || page > lastPage) return; // Prevent invalid page numbers
        setCurrentPage(page);
        fetchSellers(page, statusFilter, filter);
    };

    // Handle status filter change
    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        setCurrentPage(1);
        fetchSellers(1, status, filter);
    };

    // Handle search filter change with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
            fetchSellers(1, statusFilter, filter);
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [filter]);

    // Code for processing the action to the pending seller
    const handleAction = async (registrationId, action, reason = "") => {
        try {
            // Show loading modal
            setModalMessage("Processing your request...");
            setModalType("loading");
            setLoadingProgress(true);

            const response = await axios.post(
                `/api/admin/pending-seller/${registrationId}/action`,
                { action, reason }
            );

            if (action === "Approved") {
                setModalMessage(
                    response.data.successMessage || "Action successful!"
                );
            } else {
                setModalMessage(
                    response.data.successMessage || "Action successful!"
                );
            }

            setModalType("success");

            setTimeout(() => {
                setLoadingProgress(false);
                // Refresh the data after successful action
                fetchSellers(currentPage, statusFilter, filter);
            }, 2000);
        } catch (error) {
            console.log(error);
            setModalMessage("Something went wrong: " + error.message);
            setModalType("error");

            setTimeout(() => {
                setLoadingProgress(false);
            }, 5000);
        }
    };

    // Toggle dropdown for specific seller
    const toggleDropdown = (sellerId) => {
        setActiveDropdown(activeDropdown === sellerId ? null : sellerId);
    };

    // Close dropdown
    const closeDropdown = () => {
        setActiveDropdown(null);
    };

    // To listen to the new registered seller for real time updating
    useEffect(() => {
        // request permission for receiving notification
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission().then((permission) => {
                console.log("Notification permission:", permission);
            });
        }

        if (!window.Echo) return;

        const channel = window.Echo.channel("pending-seller-list");

        const sellerListener = (e) => {
            console.log("📢 SellerUpdated event received:", e);

            if (e.action === "Registered") {
                // Refresh data instead of manually updating to ensure consistency
                fetchSellers(currentPage, statusFilter, filter);

                // Send desktop notification
                if (
                    "Notification" in window &&
                    Notification.permission === "granted"
                ) {
                    new Notification("🆕 New Seller Pending", {
                        body: `${e.seller.name} has registered and is waiting for approval.`,
                        icon: "/image/shania_yan.png", // optional
                    });
                }
            }

            if (e.action === "Approved" || e.action === "Rejected") {
                // Refresh data to get updated list
                fetchSellers(currentPage, statusFilter, filter);
            }
        };

        channel.listen(".SellerRegistered", sellerListener);

        // Cleanup
        return () => {
            channel.stopListening(".SellerRegistered");
            window.Echo.leaveChannel("pending-seller-list");
        };
    }, [currentPage, statusFilter, filter]);

    // Initial data fetch
    useEffect(() => {
        fetchSellers(currentPage, statusFilter, filter);
    }, []);

    // Don't show pagination if there's only one page or no data
    const showPagination = lastPage > 1 && pagination.total > 0;

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Modal for view the request details */}
            {sellerDetails_modal && (
                <SellerDetails_Modal
                    selectedSeller={selectedSeller}
                    onApprove={() => setApproveSeller_modal(true)}
                    onReject={() => setRejectSeller_modal(true)}
                    onClose={() => setSellerDetails_modal(false)}
                />
            )}

            {/* Modal for approve the seller */}
            {approveSeller_modal && (
                <ApproveSeller_Modal
                    selectedSeller={selectedSeller}
                    onApprove={() => {
                        setApproveSeller_modal(false);
                        handleAction(
                            selectedSeller.registration_id,
                            "Approved"
                        );
                    }}
                    onClose={() => {
                        setApproveSeller_modal(false);
                    }}
                />
            )}

            {/* Modal for rejecting the seller */}
            {rejectSeller_modal && (
                <RejectSeller_Modal
                    selectedSeller={selectedSeller}
                    onReject={(reason) =>
                        handleAction(
                            selectedSeller.registration_id,
                            "Rejected",
                            reason
                        )
                    }
                    rejectionReason={rejectionReason}
                    setRejectionReason={setRejectionReason}
                    onClose={() => {
                        setRejectSeller_modal(false);
                    }}
                />
            )}

            {/* Loading Progress Modal */}
            {loadingProgress && (
                <LoadingProgress
                    modalMessage={modalMessage}
                    modalType={modalType}
                />
            )}

            {/* Sidebar */}
            <Sidebar pendingCount={pendingCount} />

            {/* Main Content */}
            <main className="flex-1 md:p-2 sm:p-4 lg:p-6">
                <div className="bg-white rounded-xl shadow-md overflow-hidden mt-16 md:mt-0">
                    {/* Header with title and filters */}
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="w-full md:w-auto">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                                    Seller Management
                                </h2>
                                <p className="text-sm sm:text-base text-gray-600 mt-1">
                                    Review and manage seller registration
                                    requests
                                </p>
                                {isLoading && (
                                    <div className="mt-2">
                                        <LoadingProgress
                                            modalType={"loading"}
                                            modalMessage={"Loading..."}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        handleStatusFilterChange(e.target.value)
                                    }
                                    className="w-full sm:w-auto text-sm sm:text-base text-black border border-gray-300 rounded-md px-5 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="All">All</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>

                                <div className="flex items-center w-full sm:w-64 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-indigo-500">
                                    {/* Icon */}
                                    <svg
                                        className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>

                                    {/* Input */}
                                    <input
                                        type="text"
                                        placeholder="Search sellers..."
                                        value={filter}
                                        onChange={(e) =>
                                            setFilter(e.target.value)
                                        }
                                        className="flex-1 text-sm sm:text-base text-black py-2 px-3 border-none focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Container - Improved mobile responsiveness */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-3 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Seller
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                                    >
                                        Business Details
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                                    >
                                        Date Applied
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-3 sm:px-6 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider relative z-10"
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sellers.length > 0 ? (
                                    sellers.map((seller) => (
                                        <tr
                                            key={seller.registration_id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-3 py-4 sm:px-6 sm:py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                        <span className="text-indigo-800 font-medium text-sm sm:text-base">
                                                            {seller.name
                                                                ? seller.name
                                                                      .charAt(0)
                                                                      .toUpperCase()
                                                                : "S"}
                                                        </span>
                                                    </div>
                                                    <div className="ml-3 sm:ml-4">
                                                        <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                                                            {seller.name}
                                                        </div>
                                                        <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-none">
                                                            {seller.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 sm:px-6 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                                                <div className="text-sm text-gray-900 truncate max-w-[150px]">
                                                    {seller.store_name}
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[150px]">
                                                    {seller?.business
                                                        ?.business_type ||
                                                        "N/A"}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                                                {seller.created_at
                                                    ? format(
                                                          new Date(
                                                              seller.created_at
                                                          ),
                                                          "dd MMM yyyy, hh:mm a"
                                                      )
                                                    : "N/A"}
                                            </td>
                                            <td className="px-3 py-4 sm:px-6 sm:py-4 whitespace-nowrap">
                                                <StatusBadge
                                                    status={seller.status}
                                                />
                                            </td>
                                            <td className="px-3 py-4 sm:px-6 sm:py-4 whitespace-nowrap text-right text-sm font-medium relative z-20">
                                                {/* Mobile: Dropdown Button */}
                                                <div className="sm:hidden relative z-30">
                                                    <ActionDropdown
                                                        seller={seller}
                                                        isOpen={
                                                            activeDropdown ===
                                                            seller.registration_id
                                                        }
                                                        onToggle={() =>
                                                            toggleDropdown(
                                                                seller.registration_id
                                                            )
                                                        }
                                                        onClose={closeDropdown}
                                                    />
                                                </div>

                                                {/* Desktop: Regular Buttons */}
                                                <div className="hidden sm:flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-1 sm:space-y-0 sm:space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSeller(
                                                                seller
                                                            );
                                                            setSellerDetails_modal(
                                                                true
                                                            );
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-900 text-xs sm:text-sm px-2 py-1 sm:px-0 sm:py-0"
                                                    >
                                                        View
                                                    </button>
                                                    {seller.status ===
                                                        "Pending" && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedSeller(
                                                                        seller
                                                                    );
                                                                    setApproveSeller_modal(
                                                                        true
                                                                    );
                                                                }}
                                                                className="text-green-600 hover:text-green-900 text-xs sm:text-sm px-2 py-1 sm:px-0 sm:py-0"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedSeller(
                                                                        seller
                                                                    );
                                                                    setRejectSeller_modal(
                                                                        true
                                                                    );
                                                                }}
                                                                className="text-red-600 hover:text-red-900 text-xs sm:text-sm px-2 py-1 sm:px-0 sm:py-0"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-3 py-8 sm:px-6 sm:py-8 text-center text-sm text-gray-500"
                                        >
                                            {isLoading
                                                ? "Loading sellers..."
                                                : "No seller registrations found."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination - Only show if there are multiple pages and data */}
                {showPagination && (
                    <div className="mt-2 px-2 py-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                            <div className="text-sm sm:text-sm text-gray-700 text-center sm:text-left">
                                {pagination.total > 0 ? (
                                    <>
                                        Showing{" "}
                                        <span className="text-black font-medium">
                                            {pagination.from}
                                        </span>{" "}
                                        to{" "}
                                        <span className="font-medium">
                                            {pagination.to}
                                        </span>{" "}
                                        of{" "}
                                        <span className="text-black font-medium">
                                            {pagination.total}
                                        </span>{" "}
                                        results
                                    </>
                                ) : (
                                    "No results found"
                                )}
                                <div className="text-primary font-bold mt-1 sm:mt-0 sm:inline sm:ml-2">
                                    (Page {currentPage} of {lastPage})
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    className={`px-3 py-1.5 text-xs sm:text-sm rounded-md ${
                                        currentPage === 1
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>

                                <span className="px-3 py-1.5 text-xs sm:text-sm rounded-md bg-indigo-600 text-white">
                                    {currentPage}
                                </span>

                                <button
                                    className={`px-3 py-1.5 text-xs sm:text-sm rounded-md ${
                                        currentPage === lastPage
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                    onClick={() =>
                                        handlePageChange(currentPage + 1)
                                    }
                                    disabled={currentPage === lastPage}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
