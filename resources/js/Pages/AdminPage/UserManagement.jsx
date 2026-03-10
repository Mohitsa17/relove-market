import { useState, useEffect, useCallback } from "react";
import { usePage } from "@inertiajs/react";
import dayjs from "dayjs";
import { Sidebar } from "@/Components/AdminPage/Sidebar";
import { LoadingProgress } from "@/Components/AdminPage/LoadingProgress";
import {
    FaSearch,
    FaFilter,
    FaEdit,
    FaBan,
    FaCheck,
    FaTrash,
    FaEye,
    FaExclamationTriangle,
    FaUserShield,
    FaUser,
    FaStore,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaClock,
    FaIdCard,
    FaGlobe,
    FaTimes,
    FaExternalLinkAlt,
} from "react-icons/fa";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [roleFilter, setRoleFilter] = useState("All");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [bulkAction, setBulkAction] = useState(false);

    // NEW: State for user details modal
    const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Debounced search function
    const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);

        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);

            return () => {
                clearTimeout(handler);
            };
        }, [value, delay]);

        return debouncedValue;
    };

    const debouncedFilter = useDebounce(filter, 500);

    const fetchUsers = useCallback(
        async (
            page = 1,
            search = filter,
            status = statusFilter,
            role = roleFilter
        ) => {
            setLoading(true);
            try {
                // Convert "All" filters to empty strings for the API
                const apiStatus = status === "All" ? "" : status;
                const apiRole = role === "All" ? "" : role;
                const apiSearch = search === "" ? "" : search;

                console.log("API Params:", {
                    page,
                    search: apiSearch,
                    status: apiStatus,
                    role: apiRole,
                });

                const params = new URLSearchParams({
                    page: page.toString(),
                    search: apiSearch,
                    status: apiStatus,
                    role: apiRole,
                    per_page: "10",
                });

                const response = await fetch(
                    `/api/admin/user-management/list?${params}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }

                const data = await response.json();

                console.log("API Response:", data);

                setUsers(data.data || []);
                setCurrentPage(data.current_page || 1);
                setLastPage(data.last_page || 1);

                setPagination({
                    from: data.from || 0,
                    to: data.to || 0,
                    total: data.total || 0,
                    current_page: data.current_page || 1,
                    last_page: data.last_page || 1,
                });
            } catch (err) {
                console.error("Error fetching users:", err);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        },
        [filter, statusFilter, roleFilter]
    );

    // NEW: Fetch user details
    const fetchUserDetails = async (userId) => {
        setLoadingDetails(true);
        try {
            const response = await fetch(
                `/api/admin/user-management/details/${userId}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch user details");
            }

            const data = await response.json();
            setUserDetails(data.data || data);
        } catch (err) {
            console.error("Error fetching user details:", err);
            setUserDetails(null);
        } finally {
            setLoadingDetails(false);
        }
    };

    // Fetch users when filters or page change
    useEffect(() => {
        fetchUsers(currentPage, debouncedFilter, statusFilter, roleFilter);
    }, [currentPage, debouncedFilter, statusFilter, roleFilter, fetchUsers]);

    // Reset to page 1 when filters change (except page)
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedFilter, statusFilter, roleFilter]);

    // NEW: Open user details modal
    const openUserDetailsModal = async (user) => {
        setSelectedUser(user);
        await fetchUserDetails(user.user_id || user.id);
        setShowUserDetailsModal(true);
    };

    // NEW: Close user details modal
    const closeUserDetailsModal = () => {
        setShowUserDetailsModal(false);
        setUserDetails(null);
        setSelectedUser(null);
    };

    // Handle user selection
    const toggleUserSelection = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter((id) => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    // Select all users on current page
    const toggleSelectAll = () => {
        const currentPageUserIds = users.map((user) => user.user_id || user.id);

        if (
            selectedUsers.length === currentPageUserIds.length &&
            currentPageUserIds.length > 0 &&
            currentPageUserIds.every((id) => selectedUsers.includes(id))
        ) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(currentPageUserIds);
        }
    };

    // Open confirmation modal
    const openModal = (action, user = null, isBulk = false) => {
        setModalAction(action);
        setSelectedUser(user);
        setBulkAction(isBulk);
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setModalAction(null);
        setSelectedUser(null);
        setBulkAction(false);
    };

    // Perform user action
    const performUserAction = async (action, userId = null) => {
        try {
            const userIds = bulkAction
                ? selectedUsers
                : [userId || selectedUser?.user_id || selectedUser?.id];

            const response = await fetch("/api/admin/user-management/actions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
                body: JSON.stringify({
                    action: action,
                    user_ids: userIds,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to perform action");
            }

            // Refresh the user list
            fetchUsers(currentPage, filter, statusFilter, roleFilter);
            setSelectedUsers([]);
        } catch (error) {
            console.error("Error performing action:", error);
            alert("Failed to perform action. Please try again.");
        }
    };

    // Get role icon
    const getRoleIcon = (roleName) => {
        switch (roleName?.toLowerCase()) {
            case "admin":
                return <FaUserShield className="text-purple-600" />;
            case "seller":
                return <FaStore className="text-green-600" />;
            case "buyer":
                return <FaUser className="text-blue-600" />;
            default:
                return <FaUser className="text-gray-600" />;
        }
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { color: "bg-green-100 text-green-800", text: "Active" },
            blocked: { color: "bg-red-100 text-red-800", text: "Blocked" },
            pending: {
                color: "bg-yellow-100 text-yellow-800",
                text: "Pending",
            },
            suspended: {
                color: "bg-orange-100 text-orange-800",
                text: "Suspended",
            },
        };

        const config =
            statusConfig[status?.toLowerCase()] || statusConfig.active;
        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
            >
                {config.text}
            </span>
        );
    };

    // NEW: Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return dayjs(dateString).format("DD/MM/YYYY HH:mm");
    };

    // NEW: Get user activity status
    const getUserActivityStatus = (lastLogin) => {
        if (!lastLogin) return "Never logged in";

        const now = dayjs();
        const lastLoginDate = dayjs(lastLogin);
        const diffHours = now.diff(lastLoginDate, "hour");

        if (diffHours < 1) return "Active now";
        if (diffHours < 24) return "Today";
        if (diffHours < 48) return "Yesterday";
        return `${Math.floor(diffHours / 24)} days ago`;
    };

    // Render pagination buttons
    const renderPaginationButtons = () => {
        const buttons = [];
        const maxVisiblePages = window.innerWidth < 768 ? 3 : 5;

        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxVisiblePages / 2)
        );
        let endPage = Math.min(lastPage, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Previous button
        buttons.push(
            <button
                key="prev"
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm sm:text-base"
            >
                <svg
                    className="w-4 h-4 mr-1 sm:mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                <span className="hidden sm:inline">Previous</span>
            </button>
        );

        // First page
        if (startPage > 1 && (window.innerWidth >= 768 || lastPage <= 10)) {
            buttons.push(
                <button
                    key={1}
                    onClick={() => setCurrentPage(1)}
                    className="hidden sm:block px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm"
                >
                    1
                </button>
            );
            if (startPage > 2) {
                buttons.push(
                    <span
                        key="ellipsis1"
                        className="hidden sm:block px-2 py-2 text-gray-500"
                    >
                        ...
                    </span>
                );
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-2 sm:px-3 py-2 rounded-lg border text-sm sm:text-base ${
                        currentPage === i
                            ? "bg-indigo-600 text-white border-indigo-600 font-medium"
                            : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                >
                    {i}
                </button>
            );
        }

        // Last page
        if (
            endPage < lastPage &&
            (window.innerWidth >= 768 || lastPage <= 10)
        ) {
            if (endPage < lastPage - 1) {
                buttons.push(
                    <span
                        key="ellipsis2"
                        className="hidden sm:block px-2 py-2 text-gray-500"
                    >
                        ...
                    </span>
                );
            }
            buttons.push(
                <button
                    key={lastPage}
                    onClick={() => setCurrentPage(lastPage)}
                    className="hidden sm:block px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm"
                >
                    {lastPage}
                </button>
            );
        }

        // Next button
        buttons.push(
            <button
                key="next"
                onClick={() =>
                    setCurrentPage(Math.min(currentPage + 1, lastPage))
                }
                disabled={currentPage === lastPage}
                className="px-2 sm:px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm sm:text-base"
            >
                <span className="hidden sm:inline">Next</span>
                <svg
                    className="w-4 h-4 ml-1 sm:ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>
        );

        return buttons;
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <main className="flex-1 p-4 mt-14 z-70 lg:p-6 md:z-10 md:mt-0">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Header with title and actions */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    User Management
                                </h2>
                                <p className="text-gray-600">
                                    Manage platform users and permissions
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {selectedUsers.length > 0 && (
                                    <>
                                        <button
                                            onClick={() =>
                                                openModal("block", null, true)
                                            }
                                            className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                        >
                                            <FaBan className="mr-2" />
                                            Block Selected (
                                            {selectedUsers.length})
                                        </button>
                                        <button
                                            onClick={() =>
                                                openModal("unblock", null, true)
                                            }
                                            className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                                        >
                                            <FaCheck className="mr-2" />
                                            Unblock Selected (
                                            {selectedUsers.length})
                                        </button>
                                        <button
                                            onClick={() =>
                                                openModal("delete", null, true)
                                            }
                                            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                        >
                                            <FaTrash className="mr-2" />
                                            Delete Selected (
                                            {selectedUsers.length})
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            {/* Search Bar */}
                            <div className="flex items-center border border-gray-300 rounded-md w-full md:w-auto md:flex-1 max-w-md">
                                <div className="pl-3 pr-2 py-2">
                                    <FaSearch className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="flex-1 text-black pr-4 py-2 focus:outline-none border-none bg-transparent"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-3 md:w-auto">
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                    className="w-full sm:w-40 text-black border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Blocked">Blocked</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Suspended">Suspended</option>
                                </select>

                                <select
                                    value={roleFilter}
                                    onChange={(e) =>
                                        setRoleFilter(e.target.value)
                                    }
                                    className="w-full sm:w-40 text-black border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="All">All Roles</option>
                                    <option value="Buyer">Buyer</option>
                                    <option value="Seller">Seller</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="overflow-x-auto">
                        {loading ? (
                            <LoadingProgress
                                modalType={"success"}
                                modalMessage={"Loading users..."}
                            />
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <table className="hidden min-w-full divide-y divide-gray-200 md:table">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        users.length > 0 &&
                                                        selectedUsers.length ===
                                                            users.length
                                                    }
                                                    onChange={toggleSelectAll}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Registration Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Last Login
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.length > 0 ? (
                                            users.map((user) => (
                                                <tr
                                                    key={
                                                        user.user_id || user.id
                                                    }
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedUsers.includes(
                                                                user.user_id ||
                                                                    user.id
                                                            )}
                                                            onChange={() =>
                                                                toggleUserSelection(
                                                                    user.user_id ||
                                                                        user.id
                                                                )
                                                            }
                                                            className="rounded text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                <img
                                                                    src={
                                                                        user.profile_image
                                                                            ? import.meta
                                                                                  .env
                                                                                  .VITE_BASE_URL +
                                                                              user.profile_image
                                                                            : "../image/user.png"
                                                                    }
                                                                    alt={
                                                                        user.name
                                                                    }
                                                                    className="max-h-8 w-10 rounded-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {user.name}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {user.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center space-x-2">
                                                            {getRoleIcon(
                                                                user.role
                                                                    ?.role_name
                                                            )}
                                                            <span className="text-sm text-gray-900">
                                                                {
                                                                    user.role
                                                                        ?.role_name
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(
                                                            user.status
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(
                                                            user.created_at
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {user.last_login_at
                                                            ? formatDate(
                                                                  user.last_login_at
                                                              )
                                                            : "Never"}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-2">
                                                            <button
                                                                onClick={() =>
                                                                    openUserDetailsModal(
                                                                        user
                                                                    )
                                                                }
                                                                className="text-indigo-600 hover:text-indigo-900 p-1"
                                                                title="View Details"
                                                            >
                                                                <FaEye className="w-4 h-4" />
                                                            </button>
                                                            {user.status ===
                                                                "Active" ||
                                                            user.status ===
                                                                "active" ? (
                                                                <button
                                                                    onClick={() =>
                                                                        openModal(
                                                                            "block",
                                                                            user
                                                                        )
                                                                    }
                                                                    className="text-red-600 hover:text-red-900 p-1"
                                                                    title="Block User"
                                                                >
                                                                    <FaBan className="w-4 h-4" />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() =>
                                                                        openModal(
                                                                            "unblock",
                                                                            user
                                                                        )
                                                                    }
                                                                    className="text-green-600 hover:text-green-900 p-1"
                                                                    title="Unblock User"
                                                                >
                                                                    <FaCheck className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="7"
                                                    className="px-6 py-8 text-center"
                                                >
                                                    <div className="flex flex-col items-center justify-center">
                                                        <FaUser className="w-12 h-12 text-gray-400 mb-2" />
                                                        <p className="text-gray-500 text-sm">
                                                            No users found
                                                        </p>
                                                        <p className="text-gray-400 text-xs mt-1">
                                                            Try adjusting your
                                                            search or filter
                                                            criteria
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Mobile Cards */}
                                <div className="md:hidden p-4 space-y-4">
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <div
                                                key={user.user_id || user.id}
                                                className="bg-white border rounded-lg p-4 shadow-sm"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedUsers.includes(
                                                                user.user_id ||
                                                                    user.id
                                                            )}
                                                            onChange={() =>
                                                                toggleUserSelection(
                                                                    user.user_id ||
                                                                        user.id
                                                                )
                                                            }
                                                            className="rounded text-indigo-600 focus:ring-indigo-500 mr-3"
                                                        />
                                                        <img
                                                            src={
                                                                user.profile_image
                                                                    ? import.meta
                                                                          .env
                                                                          .VITE_BASE_URL +
                                                                      user.profile_image
                                                                    : "../image/user.png"
                                                            }
                                                            alt={user.name}
                                                            className="max-h-8 w-12 rounded-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() =>
                                                                openUserDetailsModal(
                                                                    user
                                                                )
                                                            }
                                                            className="text-indigo-600 hover:text-indigo-900 p-1"
                                                        >
                                                            <FaEye className="w-4 h-4" />
                                                        </button>
                                                        {user.status ===
                                                            "Active" ||
                                                        user.status ===
                                                            "active" ? (
                                                            <button
                                                                onClick={() =>
                                                                    openModal(
                                                                        "block",
                                                                        user
                                                                    )
                                                                }
                                                                className="text-red-600 hover:text-red-900 p-1"
                                                            >
                                                                <FaBan className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    openModal(
                                                                        "unblock",
                                                                        user
                                                                    )
                                                                }
                                                                className="text-green-600 hover:text-green-900 p-1"
                                                            >
                                                                <FaCheck className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="font-medium text-gray-900 text-sm">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {user.email}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        {getRoleIcon(
                                                            user.role?.role_name
                                                        )}
                                                        <span className="text-gray-600">
                                                            {
                                                                user.role
                                                                    ?.role_name
                                                            }
                                                        </span>
                                                    </div>
                                                    <div>
                                                        {getStatusBadge(
                                                            user.status
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 text-xs">
                                                            Registered:
                                                        </span>
                                                        <div className="text-gray-700 text-sm">
                                                            {formatDate(
                                                                user.created_at
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 text-xs">
                                                            Last Login:
                                                        </span>
                                                        <div className="text-gray-700 text-sm">
                                                            {user.last_login_at
                                                                ? formatDate(
                                                                      user.last_login_at
                                                                  )
                                                                : "Never"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-8 text-center">
                                            <FaUser className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500 text-sm">
                                                No users found
                                            </p>
                                            <p className="text-gray-400 text-xs mt-1">
                                                Try adjusting your search or
                                                filter criteria
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Pagination */}
                    {users.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                                <div className="text-sm text-gray-700">
                                    Showing{" "}
                                    <span className="font-medium">
                                        {pagination.from}
                                    </span>{" "}
                                    to{" "}
                                    <span className="font-medium">
                                        {pagination.to}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-medium">
                                        {pagination.total}
                                    </span>{" "}
                                    results
                                </div>

                                <div className="flex items-center space-x-2 flex-wrap justify-center">
                                    {renderPaginationButtons()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirmation Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <div className="flex items-center mb-4">
                                <FaExclamationTriangle className="text-yellow-500 text-xl mr-3" />
                                <h3 className="text-lg font-medium text-gray-900">
                                    Confirm Action
                                </h3>
                            </div>

                            <p className="text-sm text-gray-600 mb-4">
                                {bulkAction
                                    ? `Are you sure you want to ${modalAction} ${selectedUsers.length} user(s)?`
                                    : `Are you sure you want to ${modalAction} user "${selectedUser?.name}"?`}
                            </p>

                            {(modalAction === "block" ||
                                modalAction === "delete") && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                    <div className="flex">
                                        <FaExclamationTriangle className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-800">
                                                {modalAction === "block"
                                                    ? "Blocking will prevent the user from accessing the platform."
                                                    : "This action cannot be undone. All user data will be permanently deleted."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        performUserAction(modalAction);
                                        closeModal();
                                    }}
                                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                                        modalAction === "block" ||
                                        modalAction === "delete"
                                            ? "bg-red-600 hover:bg-red-700"
                                            : "bg-green-600 hover:bg-green-700"
                                    }`}
                                >
                                    Confirm {modalAction}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* NEW: User Details Modal */}
                {showUserDetailsModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">
                                        User Details
                                    </h3>
                                    <p className="text-gray-600 text-sm mt-1">
                                        View detailed information about{" "}
                                        {selectedUser?.name}
                                    </p>
                                </div>
                                <button
                                    onClick={closeUserDetailsModal}
                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                                >
                                    <FaTimes className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6">
                                {loadingDetails ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : userDetails ? (
                                    <div className="space-y-6">
                                        {/* Profile Section */}
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                                <div className="flex-1">
                                                    <div className="flex flex-col md:flex-row items-center justify-between mb-4">
                                                        <div>
                                                            <h4 className="text-2xl font-bold text-gray-900">
                                                                {
                                                                    userDetails.name
                                                                }
                                                            </h4>
                                                            <div className="flex items-center gap-4 mt-2">
                                                                <div className="flex items-center gap-2">
                                                                    {getRoleIcon(
                                                                        userDetails
                                                                            .role
                                                                            ?.role_name
                                                                    )}
                                                                    <span className="text-lg font-medium text-gray-700">
                                                                        {userDetails
                                                                            .role
                                                                            ?.role_name ||
                                                                            "User"}
                                                                    </span>
                                                                </div>
                                                                <span className="text-sm text-gray-500">
                                                                    ID:{" "}
                                                                    {userDetails.user_id ||
                                                                        userDetails.id}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <FaEnvelope className="w-5 h-5 text-gray-400" />
                                                            <div>
                                                                <p className="text-sm text-gray-500">
                                                                    Email
                                                                </p>
                                                                <p className="font-medium text-black">
                                                                    {
                                                                        userDetails.email
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {userDetails.phone_number && (
                                                            <div className="flex items-center gap-3">
                                                                <FaPhone className="w-5 h-5 text-gray-400" />
                                                                <div>
                                                                    <p className="text-sm text-gray-500">
                                                                        Phone
                                                                    </p>
                                                                    <p className="font-medium text-black">
                                                                        {
                                                                            userDetails.phone
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {userDetails.address && (
                                                            <div className="flex items-center gap-3">
                                                                <FaMapMarkerAlt className="w-5 h-5 text-gray-400" />
                                                                <div>
                                                                    <p className="text-sm text-gray-500">
                                                                        Address
                                                                    </p>
                                                                    <p className="font-medium text-black">
                                                                        {
                                                                            userDetails.address
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {userDetails.country && (
                                                            <div className="flex items-center gap-3">
                                                                <FaGlobe className="w-5 h-5 text-gray-400" />
                                                                <div>
                                                                    <p className="text-sm text-gray-500">
                                                                        Country
                                                                    </p>
                                                                    <p className="font-medium">
                                                                        {
                                                                            userDetails.country
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Activity & Stats Section */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Registration Info */}
                                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <FaCalendarAlt className="w-6 h-6 text-indigo-600" />
                                                    <h5 className="font-semibold text-gray-800">
                                                        Registration
                                                    </h5>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-sm text-gray-500">
                                                            Date Registered
                                                        </p>
                                                        <p className="font-medium text-black">
                                                            {formatDate(
                                                                userDetails.created_at
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">
                                                            Account Age
                                                        </p>
                                                        <p className="font-medium text-black">
                                                            {dayjs().diff(
                                                                dayjs(
                                                                    userDetails.created_at
                                                                ),
                                                                "day"
                                                            )}{" "}
                                                            days
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">
                                                            Email Verified
                                                        </p>
                                                        <p
                                                            className={`font-medium ${
                                                                userDetails.email_verified_at
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                            }`}
                                                        >
                                                            {userDetails.email_verified_at
                                                                ? "Yes"
                                                                : "No"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Login Activity */}
                                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <FaClock className="w-6 h-6 text-green-600" />
                                                    <h5 className="font-semibold text-gray-800">
                                                        Login Activity
                                                    </h5>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-sm text-gray-500">
                                                            Last Login
                                                        </p>
                                                        <p className="font-medium text-black">
                                                            {userDetails.last_login_at
                                                                ? formatDate(
                                                                      userDetails.last_login_at
                                                                  )
                                                                : "Never"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Footer */}
                                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                            <button
                                                onClick={closeUserDetailsModal}
                                                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                            >
                                                Close
                                            </button>
                                            {userDetails.status === "active" ||
                                            userDetails.status === "Active" ? (
                                                <button
                                                    onClick={() => {
                                                        openModal(
                                                            "block",
                                                            selectedUser
                                                        );
                                                        closeUserDetailsModal();
                                                    }}
                                                    className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                >
                                                    Block User
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        openModal(
                                                            "unblock",
                                                            selectedUser
                                                        );
                                                        closeUserDetailsModal();
                                                    }}
                                                    className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                >
                                                    Unblock User
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <FaExclamationTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600">
                                            Failed to load user details.
                                        </p>
                                        <button
                                            onClick={() =>
                                                fetchUserDetails(
                                                    selectedUser?.user_id ||
                                                        selectedUser?.id
                                                )
                                            }
                                            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
