import { useState, useRef, useEffect } from "react";
import {
    Camera,
    Edit3,
    Save,
    X,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Store,
    FileText,
    Shield,
    Bell,
    CreditCard,
    Package,
    Truck,
    CheckCircle2,
    LogOut,
    Trash2,
    Eye,
    EyeOff,
} from "lucide-react";

import dayjs from "dayjs";
import axios from "axios";

import { SellerSidebar } from "@/Components/SellerPage/SellerSidebar";
import { LoadingProgress } from "@/Components/AdminPage/LoadingProgress";

export default function SellerUpdateProfile({ seller_storeInfo, auth }) {
    const [activeTab, setActiveTab] = useState("profile");
    const [editingSection, setEditingSection] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalType, setModalType] = useState("");
    const [loadingProgress, setLoadingProgress] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });

    const fileInputRef = useRef(null);

    // Enhanced seller data
    const [sellerData, setSellerData] = useState({
        ...auth.user,
        store: seller_storeInfo[0]?.seller_store || {},
    });

    const [userFormData, setUserFormData] = useState({
        name: auth.user.name || "",
        email: auth.user.email || "",
        phone: auth.user.phone || "",
    });

    const [storeFormData, setStoreFormData] = useState({
        store_name: sellerData.store?.store_name || "",
        store_description: sellerData.store?.store_description || "",
        store_address: sellerData.store?.store_address || "",
        store_phone: sellerData.store?.store_phone || "",
    });

    // Image preview state
    const [imagePreview, setImagePreview] = useState(null);
    const [storeImagePreview, setStoreImagePreview] = useState(null);

    // Fetch seller data on component mount
    useEffect(() => {
        fetchSellerData();
    }, []);

    // Set initial image previews when component mounts
    useEffect(() => {
        if (sellerData.profile_image) {
            setImagePreview(getProfileImageUrl(sellerData.profile_image));
        }
        if (sellerData.store?.store_image) {
            setStoreImagePreview(
                getProfileImageUrl(sellerData.store.store_image)
            );
        }
    }, [sellerData]);

    // Helper function to get proper image URL
    const getProfileImageUrl = (imagePath) => {
        if (!imagePath) return "/image/user.png";

        if (imagePath.startsWith("http") || imagePath.startsWith("data:")) {
            return imagePath;
        }

        if (imagePath.startsWith("/")) {
            return import.meta.env.VITE_BASE_URL + imagePath;
        }

        return `${import.meta.env.VITE_BASE_URL}${imagePath}`;
    };

    // Fetch seller data from API
    const fetchSellerData = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/seller/profile", {
                headers: {
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
            });

            if (response.data.success) {
                const updatedData = {
                    ...auth.user,
                    ...response.data.user,
                    store: response.data.store || {},
                };
                setSellerData(updatedData);
                setUserFormData({
                    name: updatedData.name || "",
                    email: updatedData.email || "",
                    phone: updatedData.phone || "",
                });
                setStoreFormData({
                    store_name: updatedData.store?.store_name || "",
                    store_description:
                        updatedData.store?.store_description || "",
                    store_address: updatedData.store?.store_address || "",
                    store_phone: updatedData.store?.store_phone || "",
                });
            }
        } catch (error) {
            console.error("Error fetching seller data:", error);
            showModal("Failed to load profile data", "error");
        } finally {
            setLoading(false);
        }
    };

    // Show modal message
    const showModal = (message, type = "info") => {
        setModalMessage(message);
        setModalType(type);
        setLoadingProgress(true);

        setTimeout(
            () => {
                setLoadingProgress(false);
            },
            type === "success" ? 2000 : 3000
        );
    };

    // Handle profile image upload
    const handleProfileImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                showModal("Please select a valid image file", "error");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showModal("Image size should be less than 5MB", "error");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle store image upload
    const handleStoreImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                showModal("Please select a valid image file", "error");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showModal("Image size should be less than 5MB", "error");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setStoreImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Delete profile image
    const handleDeleteProfileImage = async () => {
        try {
            setLoading(true);
            const response = await axios.delete("/seller/profile/image", {
                headers: {
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
            });

            if (response.data.success) {
                setImagePreview("/image/user.png");
                showModal("Profile image deleted successfully", "success");
                fetchSellerData(); // Refresh data
            }
        } catch (error) {
            console.error("Error deleting profile image:", error);
            showModal("Failed to delete profile image", "error");
        } finally {
            setLoading(false);
        }
    };

    // Delete store image
    const handleDeleteStoreImage = async () => {
        try {
            setLoading(true);
            const response = await axios.delete("/seller/store/image", {
                headers: {
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
            });

            if (response.data.success) {
                setStoreImagePreview("/image/user.png");
                showModal("Store image deleted successfully", "success");
                fetchSellerData(); // Refresh data
            }
        } catch (error) {
            console.error("Error deleting store image:", error);
            showModal("Failed to delete store image", "error");
        } finally {
            setLoading(false);
        }
    };

    // Handle save user profile
    const handleSaveUserProfile = async () => {
        try {
            setLoading(true);
            showModal("Updating personal information...", "loading");

            const formDataToSend = new FormData();

            // Personal information
            formDataToSend.append("name", userFormData.name || "");
            formDataToSend.append("email", userFormData.email || "");
            formDataToSend.append("phone", userFormData.phone || "");

            // Append profile image if exists
            const profileImageInput = document.getElementById(
                "profile-image-input"
            );
            if (profileImageInput?.files[0]) {
                formDataToSend.append(
                    "profile_image",
                    profileImageInput.files[0]
                );
            }

            const response = await axios.post(
                "/seller/profile/user/update",
                formDataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            .getAttribute("content"),
                    },
                }
            );

            if (response.data.success) {
                setSellerData((prev) => ({
                    ...prev,
                    ...response.data.user,
                }));
                setEditingSection(null);
                showModal(
                    "Personal information updated successfully!",
                    "success"
                );
                fetchSellerData(); // Refresh data
            }
        } catch (error) {
            console.error("Error updating user profile:", error);
            const errorMessage =
                error.response?.data?.message || error.response?.data?.errors
                    ? Object.values(error.response.data.errors)
                          .flat()
                          .join(", ")
                    : "Failed to update personal information";
            showModal(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    // Handle save store profile
    const handleSaveStoreProfile = async () => {
        try {
            setLoading(true);
            showModal("Updating store information...", "loading");

            const formDataToSend = new FormData();

            // Store information
            formDataToSend.append("store_name", storeFormData.store_name || "");
            formDataToSend.append(
                "store_description",
                storeFormData.store_description || ""
            );
            formDataToSend.append(
                "store_address",
                storeFormData.store_address || ""
            );
            formDataToSend.append(
                "store_phone",
                storeFormData.store_phone || ""
            );

            // Append store image if exists
            const storeImageInput =
                document.getElementById("store-image-input");
            if (storeImageInput?.files[0]) {
                formDataToSend.append("store_image", storeImageInput.files[0]);
            }

            const response = await axios.post(
                "/seller/profile/store/update",
                formDataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            .getAttribute("content"),
                    },
                }
            );

            if (response.data.success) {
                setSellerData((prev) => ({
                    ...prev,
                    store: response.data.store,
                }));
                setEditingSection(null);
                showModal("Store information updated successfully!", "success");
                fetchSellerData(); // Refresh data
            }
        } catch (error) {
            console.error("Error updating store profile:", error);
            const errorMessage =
                error.response?.data?.message || error.response?.data?.errors
                    ? Object.values(error.response.data.errors)
                          .flat()
                          .join(", ")
                    : "Failed to update store information";
            showModal(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    // Handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (
            passwordData.new_password !== passwordData.new_password_confirmation
        ) {
            showModal("New passwords do not match", "error");
            return;
        }

        if (passwordData.new_password.length < 8) {
            showModal("Password must be at least 8 characters long", "error");
            return;
        }

        try {
            setLoading(true);
            showModal("Updating password...", "loading");

            const response = await axios.post(
                "/seller/profile/password/update",
                passwordData,
                {
                    headers: {
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            .getAttribute("content"),
                    },
                }
            );

            if (response.data.success) {
                setPasswordData({
                    current_password: "",
                    new_password: "",
                    new_password_confirmation: "",
                });
                showModal("Password updated successfully!", "success");
            }
        } catch (error) {
            console.error("Error updating password:", error);
            const errorMessage =
                error.response?.data?.message || error.response?.data?.errors
                    ? Object.values(error.response.data.errors)
                          .flat()
                          .join(", ")
                    : "Failed to update password";
            showModal(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel edit
    const handleCancelEdit = (section) => {
        if (section === "user") {
            setUserFormData({
                name: sellerData.name || "",
                email: sellerData.email || "",
                phone: sellerData.phone || "",
            });
            setImagePreview(getProfileImageUrl(sellerData.profile_image));
        } else if (section === "store") {
            setStoreFormData({
                store_name: sellerData.store?.store_name || "",
                store_description: sellerData.store?.store_description || "",
                store_address: sellerData.store?.store_address || "",
                store_phone: sellerData.store?.store_phone || "",
            });
            setStoreImagePreview(
                getProfileImageUrl(sellerData.store?.store_image)
            );
        }
        setEditingSection(null);
    };

    const handleUserInputChange = (e) => {
        setUserFormData({ ...userFormData, [e.target.name]: e.target.value });
    };

    const handleStoreInputChange = (e) => {
        setStoreFormData({ ...storeFormData, [e.target.name]: e.target.value });
    };

    const handlePasswordInputChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const triggerProfileFileInput = () => {
        document.getElementById("profile-image-input").click();
    };

    const triggerStoreFileInput = () => {
        document.getElementById("store-image-input").click();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Loading Progress */}
            {loadingProgress && (
                <LoadingProgress
                    modalType={modalType}
                    modalMessage={modalMessage}
                />
            )}

            {/* Sidebar */}
            <SellerSidebar />

            {/* Main Content */}
            <main className="flex-1 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Enhanced Sidebar Navigation */}
                        <div className="lg:w-80 flex-shrink-0 mt-16 md:mt-0">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:sticky top-6">
                                <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-100">
                                    <div className="md:relative mb-4 group">
                                        <div className="w-28 max-h-28 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                            <img
                                                src={
                                                    imagePreview ||
                                                    getProfileImageUrl(
                                                        sellerData.profile_image
                                                    ) ||
                                                    "/image/user.png"
                                                }
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src =
                                                        "/image/user.png";
                                                }}
                                            />
                                        </div>
                                        {editingSection === "user" && (
                                            <div className="md:absolute bottom-2 right-2 flex flex-row justify-center md:flex-col gap-1">
                                                <button
                                                    onClick={
                                                        triggerProfileFileInput
                                                    }
                                                    className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all transform group-hover:scale-110 border-2 border-white"
                                                >
                                                    <Camera size={16} />
                                                </button>
                                                {sellerData.profile_image && (
                                                    <button
                                                        onClick={
                                                            handleDeleteProfileImage
                                                        }
                                                        className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-all transform group-hover:scale-110 border-2 border-white"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        <input
                                            id="profile-image-input"
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleProfileImageUpload}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 text-center">
                                        {sellerData.name}
                                    </h2>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {sellerData.store?.store_name}
                                    </p>
                                    <p className="text-gray-500 text-xs mt-1">
                                        Seller since{" "}
                                        {dayjs(auth.user.created_at).format(
                                            "MMMM YYYY"
                                        )}
                                    </p>
                                    <div className="flex items-center mt-2 text-sm text-gray-500">
                                        <CheckCircle2
                                            size={14}
                                            className="text-green-500 mr-1"
                                        />
                                        Verified Seller
                                    </div>
                                </div>

                                <nav className="space-y-1">
                                    {[
                                        {
                                            id: "profile",
                                            icon: User,
                                            label: "Profile & Store",
                                        },
                                        {
                                            id: "security",
                                            icon: Shield,
                                            label: "Security",
                                        },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() =>
                                                setActiveTab(item.id)
                                            }
                                            className={`w-full flex items-center px-4 py-3.5 rounded-xl text-left transition-all group ${
                                                activeTab === item.id
                                                    ? "bg-blue-50 text-blue-600 font-semibold shadow-sm border border-blue-100"
                                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                        >
                                            <item.icon
                                                size={20}
                                                className="mr-3 flex-shrink-0"
                                            />
                                            <span className="flex-1">
                                                {item.label}
                                            </span>
                                        </button>
                                    ))}

                                    <button className="w-full flex items-center px-4 py-3.5 rounded-xl text-left text-red-600 hover:bg-red-50 transition-all mt-4 group">
                                        <LogOut
                                            size={20}
                                            className="mr-3 flex-shrink-0"
                                        />
                                        <span className="flex-1">Logout</span>
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 min-w-0">
                            {/* Profile & Store Tab */}
                            {activeTab === "profile" && (
                                <div className="space-y-6">
                                    {/* User Personal Information Card */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="border-b border-gray-100 px-6 py-5">
                                            <div className="flex flex-col md:flex-row justify-between md:items-center">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-gray-900">
                                                        Personal Information
                                                    </h2>
                                                    <p className="text-gray-600 mt-1">
                                                        Manage your personal
                                                        details
                                                    </p>
                                                </div>
                                                {editingSection !== "user" ? (
                                                    <button
                                                        onClick={() =>
                                                            setEditingSection(
                                                                "user"
                                                            )
                                                        }
                                                        className="flex items-center bg-blue-600 text-white px-4 py-2.5 mt-3 md:mt-0 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
                                                    >
                                                        <Edit3
                                                            size={18}
                                                            className="mr-2"
                                                        />
                                                        Edit Personal Info
                                                    </button>
                                                ) : (
                                                    <div className="flex flex-col md:flex-row space-x-2">
                                                        <button
                                                            onClick={
                                                                handleSaveUserProfile
                                                            }
                                                            disabled={loading}
                                                            className="flex items-center bg-blue-600 text-white px-4 py-2.5 mt-3 md:mt-0 rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {loading ? (
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                            ) : (
                                                                <Save
                                                                    size={18}
                                                                    className="mr-2"
                                                                />
                                                            )}
                                                            {loading
                                                                ? "Saving..."
                                                                : "Save Changes"}
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleCancelEdit(
                                                                    "user"
                                                                )
                                                            }
                                                            className="flex items-center bg-gray-200 text-gray-700 px-4 py-2.5 mt-2 md:mt-0 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                                                        >
                                                            <X
                                                                size={18}
                                                                className="mr-2"
                                                            />
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Full Name
                                                    </label>
                                                    {editingSection ===
                                                    "user" ? (
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={
                                                                userFormData.name
                                                            }
                                                            onChange={
                                                                handleUserInputChange
                                                            }
                                                            className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                            placeholder="Enter your full name"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                                                            <User
                                                                size={20}
                                                                className="text-gray-400 mr-3"
                                                            />
                                                            <span className="text-gray-900 font-medium">
                                                                {
                                                                    sellerData.name
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Email Address
                                                    </label>
                                                    {editingSection ===
                                                    "user" ? (
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={
                                                                userFormData.email
                                                            }
                                                            onChange={
                                                                handleUserInputChange
                                                            }
                                                            className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                            placeholder="Enter your email"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                                                            <Mail
                                                                size={20}
                                                                className="text-gray-400 mr-3"
                                                            />
                                                            <span className="text-gray-900 font-medium">
                                                                {
                                                                    sellerData.email
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Phone Number
                                                    </label>
                                                    {editingSection ===
                                                    "user" ? (
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={
                                                                userFormData.phone
                                                            }
                                                            onChange={
                                                                handleUserInputChange
                                                            }
                                                            className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                            placeholder="Enter your phone number"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                                                            <Phone
                                                                size={20}
                                                                className="text-gray-400 mr-3"
                                                            />
                                                            <span className="text-gray-900 font-medium">
                                                                {sellerData.phone ||
                                                                    "Not provided"}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Member Since
                                                    </label>
                                                    <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                                                        <Calendar
                                                            size={20}
                                                            className="text-gray-400 mr-3"
                                                        />
                                                        <span className="text-gray-900 font-medium">
                                                            {dayjs(
                                                                auth.user
                                                                    .created_at
                                                            ).format(
                                                                "MMMM D, YYYY"
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Store Information Card */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="border-b border-gray-100 px-6 py-5">
                                            <div className="flex flex-col md:flex-row justify-between md:items-center">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-gray-900">
                                                        Store Information
                                                    </h2>
                                                    <p className="text-gray-600 mt-1">
                                                        Manage your store
                                                        details
                                                    </p>
                                                </div>
                                                {editingSection !== "store" ? (
                                                    <button
                                                        onClick={() =>
                                                            setEditingSection(
                                                                "store"
                                                            )
                                                        }
                                                        className="flex items-center bg-green-600 text-white px-4 py-2.5 mt-3 md:mt-0 rounded-xl hover:bg-green-700 transition-colors font-medium shadow-sm"
                                                    >
                                                        <Edit3
                                                            size={18}
                                                            className="mr-2"
                                                        />
                                                        Edit Store Info
                                                    </button>
                                                ) : (
                                                    <div className="flex flex-col md:flex-row space-x-2">
                                                        <button
                                                            onClick={
                                                                handleSaveStoreProfile
                                                            }
                                                            disabled={loading}
                                                            className="flex items-center mt-3 md:mt-0 bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {loading ? (
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                            ) : (
                                                                <Save
                                                                    size={18}
                                                                    className="mr-2"
                                                                />
                                                            )}
                                                            {loading
                                                                ? "Saving..."
                                                                : "Save Changes"}
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleCancelEdit(
                                                                    "store"
                                                                )
                                                            }
                                                            className="flex items-center mt-3 md:mt-0 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                                                        >
                                                            <X
                                                                size={18}
                                                                className="mr-2"
                                                            />
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div className="lg:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Store Image
                                                    </label>
                                                    <div className="flex items-center space-x-6">
                                                        <div className="md:relative group">
                                                            <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                                                                <img
                                                                    src={
                                                                        storeImagePreview ||
                                                                        getProfileImageUrl(
                                                                            sellerData
                                                                                .store
                                                                                ?.store_image
                                                                        ) ||
                                                                        "/image/store-placeholder.png"
                                                                    }
                                                                    alt="Store"
                                                                    className="w-full h-full object-cover"
                                                                    onError={(
                                                                        e
                                                                    ) => {
                                                                        e.target.src =
                                                                            "/image/store-placeholder.png";
                                                                    }}
                                                                />
                                                            </div>
                                                            {editingSection ===
                                                                "store" && (
                                                                <div className="md:absolute bottom-2 right-2 flex flex-row md:flex-col justify-center mt-3 md:mt-0 gap-1">
                                                                    <button
                                                                        onClick={
                                                                            triggerStoreFileInput
                                                                        }
                                                                        className="bg-green-600 text-white p-2 rounded-full shadow-lg hover:bg-green-700 transition-all transform group-hover:scale-110 border-2 border-white"
                                                                    >
                                                                        <Camera
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    </button>
                                                                    {sellerData
                                                                        .store
                                                                        ?.store_image && (
                                                                        <button
                                                                            onClick={
                                                                                handleDeleteStoreImage
                                                                            }
                                                                            className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-all transform group-hover:scale-110 border-2 border-white"
                                                                        >
                                                                            <Trash2
                                                                                size={
                                                                                    16
                                                                                }
                                                                            />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                            <input
                                                                id="store-image-input"
                                                                type="file"
                                                                onChange={
                                                                    handleStoreImageUpload
                                                                }
                                                                accept="image/*"
                                                                className="hidden"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm text-gray-600">
                                                                Upload a clear
                                                                image of your
                                                                store.
                                                                Recommended
                                                                size: 500x500px
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="lg:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Store Name
                                                    </label>
                                                    {editingSection ===
                                                    "store" ? (
                                                        <input
                                                            type="text"
                                                            name="store_name"
                                                            value={
                                                                storeFormData.store_name
                                                            }
                                                            onChange={
                                                                handleStoreInputChange
                                                            }
                                                            className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                            placeholder="Enter your store name"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                                                            <Store
                                                                size={20}
                                                                className="text-gray-400 mr-3"
                                                            />
                                                            <span className="text-gray-900 font-medium">
                                                                {
                                                                    sellerData
                                                                        .store
                                                                        ?.store_name
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="lg:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Store Description
                                                    </label>
                                                    {editingSection ===
                                                    "store" ? (
                                                        <textarea
                                                            name="store_description"
                                                            value={
                                                                storeFormData.store_description
                                                            }
                                                            onChange={
                                                                handleStoreInputChange
                                                            }
                                                            rows={4}
                                                            className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                            placeholder="Describe your store..."
                                                        />
                                                    ) : (
                                                        <div className="flex items-start p-3 bg-gray-50 rounded-xl border border-gray-200">
                                                            <FileText
                                                                size={20}
                                                                className="text-gray-400 mr-3 mt-0.5 flex-shrink-0"
                                                            />
                                                            <span className="text-gray-900 font-medium">
                                                                {sellerData
                                                                    .store
                                                                    ?.store_description ||
                                                                    "No description provided"}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="lg:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Store Address
                                                    </label>
                                                    {editingSection ===
                                                    "store" ? (
                                                        <textarea
                                                            name="store_address"
                                                            value={
                                                                storeFormData.store_address
                                                            }
                                                            onChange={
                                                                handleStoreInputChange
                                                            }
                                                            rows={3}
                                                            className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                            placeholder="Enter your store address"
                                                        />
                                                    ) : (
                                                        <div className="flex items-start p-3 bg-gray-50 rounded-xl border border-gray-200">
                                                            <MapPin
                                                                size={20}
                                                                className="text-gray-400 mr-3 mt-0.5 flex-shrink-0"
                                                            />
                                                            <span className="text-gray-900 font-medium">
                                                                {sellerData
                                                                    .store
                                                                    ?.store_address ||
                                                                    "No address provided"}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Store Phone
                                                    </label>
                                                    {editingSection ===
                                                    "store" ? (
                                                        <input
                                                            type="tel"
                                                            name="store_phone"
                                                            value={
                                                                storeFormData.store_phone
                                                            }
                                                            onChange={
                                                                handleStoreInputChange
                                                            }
                                                            className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                            placeholder="Enter store phone number"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                                                            <Phone
                                                                size={20}
                                                                className="text-gray-400 mr-3"
                                                            />
                                                            <span className="text-gray-900 font-medium">
                                                                {sellerData
                                                                    .store
                                                                    ?.store_phone ||
                                                                    "Not provided"}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === "security" && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="border-b border-gray-100 px-6 py-5">
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Security Settings
                                        </h2>
                                        <p className="text-gray-600 mt-1">
                                            Manage your account security and
                                            password
                                        </p>
                                    </div>

                                    <div className="p-6">
                                        <div className="max-w-2xl">
                                            <form
                                                onSubmit={handlePasswordChange}
                                                className="space-y-6"
                                            >
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Current Password
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={
                                                                showPassword
                                                                    ? "text"
                                                                    : "password"
                                                            }
                                                            name="current_password"
                                                            value={
                                                                passwordData.current_password
                                                            }
                                                            onChange={
                                                                handlePasswordInputChange
                                                            }
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12"
                                                            placeholder="Enter current password"
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setShowPassword(
                                                                    !showPassword
                                                                )
                                                            }
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff
                                                                    size={20}
                                                                />
                                                            ) : (
                                                                <Eye
                                                                    size={20}
                                                                />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        New Password
                                                    </label>
                                                    <input
                                                        type={
                                                            showPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        name="new_password"
                                                        value={
                                                            passwordData.new_password
                                                        }
                                                        onChange={
                                                            handlePasswordInputChange
                                                        }
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                        placeholder="Enter new password"
                                                        required
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Password must be at
                                                        least 8 characters long
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Confirm New Password
                                                    </label>
                                                    <input
                                                        type={
                                                            showPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        name="new_password_confirmation"
                                                        value={
                                                            passwordData.new_password_confirmation
                                                        }
                                                        onChange={
                                                            handlePasswordInputChange
                                                        }
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                        placeholder="Confirm new password"
                                                        required
                                                    />
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {loading ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            Updating Password...
                                                        </div>
                                                    ) : (
                                                        "Update Password"
                                                    )}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
