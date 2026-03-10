import { useState, useRef, useEffect } from "react";
import {
    Camera,
    User,
    Shield,
    ShoppingBag,
    LogOut,
    CheckCircle,
    Package,
    Truck,
    CheckCircle2,
} from "lucide-react";

import axios from "axios";
import dayjs from "dayjs";
import Swal from "sweetalert2";

import { usePage, Link } from "@inertiajs/react";

import { Navbar } from "@/Components/BuyerPage/Navbar";
import { Footer } from "@/Components/BuyerPage/Footer";

import { OrdersTab } from "@/Components/BuyerPage/ProfilePage/OrdersTab";
import { SecurityTab } from "@/Components/BuyerPage/ProfilePage/SecurityTab";
import { ProfileTab } from "@/Components/BuyerPage/ProfilePage/ProfileTab";
import { ReceiptModal } from "@/Components/BuyerPage/ProfilePage/ReceiptModal";

// SweetAlert configuration
const showAlert = (icon, title, text, confirmButtonText = "OK") => {
    return Swal.fire({
        icon,
        title,
        text,
        confirmButtonText,
        confirmButtonColor: "#3085d6",
        customClass: {
            popup: "rounded-2xl",
            confirmButton: "px-4 py-2 rounded-lg font-medium",
        },
    });
};

const showConfirmationAlert = (
    title,
    text,
    confirmButtonText = "Yes",
    cancelButtonText = "Cancel"
) => {
    return Swal.fire({
        title,
        text,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText,
        cancelButtonText,
        customClass: {
            popup: "rounded-2xl",
            confirmButton: "px-4 py-2 rounded-lg font-medium",
            cancelButton: "px-4 py-2 rounded-lg font-medium",
        },
    });
};

const showLoadingAlert = (title, text = "") => {
    return Swal.fire({
        title,
        text,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });
};

const showSuccessAlert = (title, text, confirmButtonText = "OK") => {
    return Swal.fire({
        title,
        text,
        icon: "success",
        confirmButtonText,
        confirmButtonColor: "#3085d6",
        customClass: {
            popup: "rounded-2xl",
            confirmButton: "px-4 py-2 rounded-lg font-medium",
        },
    });
};

const showErrorAlert = (title, text, confirmButtonText = "OK") => {
    return Swal.fire({
        title,
        text,
        icon: "error",
        confirmButtonText,
        confirmButtonColor: "#d33",
        customClass: {
            popup: "rounded-2xl",
            confirmButton: "px-4 py-2 rounded-lg font-medium",
        },
    });
};

const showWarningAlert = (title, text, confirmButtonText = "OK") => {
    return Swal.fire({
        title,
        text,
        icon: "warning",
        confirmButtonText,
        confirmButtonColor: "#f59e0b",
        customClass: {
            popup: "rounded-2xl",
            confirmButton: "px-4 py-2 rounded-lg font-medium",
        },
    });
};

export default function ProfilePage({
    active_tab,
    show_order_success,
    order_id,
    payment_success,
}) {
    const [activeTab, setActiveTab] = useState(active_tab || "profile");
    const [isEditing, setIsEditing] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);

    const { auth } = usePage().props;

    // Enhanced user data
    const [userData, setUserData] = useState(auth.user);

    const [formData, setFormData] = useState({ ...userData });
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // NEW: Separate state for image preview
    const [imagePreview, setImagePreview] = useState(null);

    // Order history state with pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);

    const [orderHistory, setOrderHistory] = useState([]);
    const [confirmingOrderId, setConfirmingOrderId] = useState(null);

    const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
    const [recentOrderId, setRecentOrderId] = useState(null);

    const totalPages = Math.ceil(orderHistory.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // FIXED: Enhanced helper function to get proper image URL
    const getProfileImageUrl = (imagePath) => {
        // If no image path, return default image
        if (!imagePath) {
            return "/image/user.png";
        }

        // If it's already a full URL or data URL, return as is
        if (imagePath.startsWith("http") || imagePath.startsWith("data:")) {
            return imagePath;
        }

        // If it's a storage path (like 'profile_images/123/filename.jpg'), prepend storage URL
        if (imagePath.startsWith("profile_images/")) {
            const fullUrl = `${import.meta.env.VITE_BASE_URL}${imagePath}`;

            return fullUrl;
        }

        // If it's a relative path starting with /, prepend base URL
        if (imagePath.startsWith("/")) {
            const fullUrl = import.meta.env.VITE_BASE_URL + imagePath;

            return fullUrl;
        }

        // For any other case, try with storage prefix
        const fullUrl = `${import.meta.env.VITE_BASE_URL}${imagePath}`;

        return fullUrl;
    };

    const checkForOrderSuccessRedirect = () => {
        // Check URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const showOrderSuccess = urlParams.get("show_order_success");
        const orderId = urlParams.get("order_id");
        const paymentSuccess = urlParams.get("payment_success");
        const activeTabParam = urlParams.get("active_tab");

        // Check if any success condition is met
        if (showOrderSuccess === "true" || paymentSuccess === "true") {
            // Set active tab to orders
            setActiveTab("orders");

            // Store the order ID and show modal
            setRecentOrderId(orderId);
            setShowOrderSuccessModal(true);

            // Clean up the URL - remove the parameters
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            console.log("🧹 URL cleaned:", cleanUrl);
        }

        if (show_order_success || payment_success) {
            setActiveTab("orders");
            setRecentOrderId(order_id || null);
            setShowOrderSuccessModal(true);
        }
    };

    // NEW: Function to show the order success modal
    const showOrderSuccessAlert = () => {
        Swal.fire({
            title: "Order Confirmed! 🎉",
            html: `
            <div class="text-center">
                <div class="text-green-500 text-6xl mb-4">✓</div>
                <p class="text-lg font-semibold text-gray-800 mb-3">
                    Your order has been successfully placed!
                </p>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p class="text-sm text-blue-700">
                        <strong>Your order receipt is available in the Orders tab.</strong><br>
                        You can track your order status and view your order details here.
                    </p>
                </div>
            </div>
        `,
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#3085d6",
            showCancelButton: false, // ❌ remove cancel button
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: {
                popup: "rounded-2xl",
                confirmButton: "px-6 py-3 rounded-lg font-medium",
            },
        }).then(() => {
            // When user clicks OK
            highlightRecentOrder();
            setShowOrderSuccessModal(false);
        });
    };

    // NEW: Function to highlight the recent order in the list
    const highlightRecentOrder = () => {
        if (recentOrderId) {
            // Find the recent order in the order history
            const recentOrder = orderHistory.find(
                (order) =>
                    order.order_id == recentOrderId ||
                    order.order_number == recentOrderId
            );

            if (recentOrder) {
                // You can implement scrolling to the order or highlighting it
                const orderElement = document.getElementById(
                    `order-${recentOrder.order_id}`
                );
                if (orderElement) {
                    orderElement.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                    orderElement.classList.add(
                        "bg-green-50",
                        "border",
                        "border-green-200"
                    );

                    // Remove highlight after 3 seconds
                    setTimeout(() => {
                        orderElement.classList.remove(
                            "bg-green-50",
                            "border",
                            "border-green-200"
                        );
                    }, 3000);
                }
            } else {
                console.log("❌ Recent order not found in order history");
            }
        }
    };

    // Fetch order history from API
    const fetchOrderHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(route("order-history"), {
                headers: {
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
            });

            setOrderHistory(response.data || []);
        } catch (error) {
            console.error("Error fetching order history:", error);
            showErrorAlert(
                "Error",
                "Failed to load order history. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // NEW: Order Confirmation Function (SweetAlert Version)
    const confirmOrderDelivery = async (orderId) => {
        // SweetAlert Confirmation Popup
        const result = await showConfirmationAlert(
            "Confirm Delivery?",
            "Have you received your order in good condition? The order will be considered as completed by the seller.",
            "Yes, I have received it",
            "Cancel"
        );

        // If user cancels, stop the function
        if (!result.isConfirmed) {
            return;
        }

        try {
            setConfirmingOrderId(orderId);

            const response = await axios.post(
                route("confirm-delivery", orderId)
            );

            if (response.data.success) {
                // Update the order in local state
                setOrderHistory((prevOrders) =>
                    prevOrders.map((order) =>
                        order.order_id === orderId
                            ? {
                                  ...order,
                                  order_status: "Completed",
                                  commission_amount:
                                      response.data.order?.commission_amount,
                                  seller_amount:
                                      response.data.order?.seller_amount,
                                  completed_at:
                                      response.data.order?.completed_at,
                              }
                            : order
                    )
                );

                // SweetAlert Success Popup
                await showSuccessAlert(
                    "Delivery Confirmed!",
                    "Payment has been released to the seller."
                );
            }
        } catch (error) {
            console.error("Error confirming delivery:", error);

            // SweetAlert Error Popup
            showErrorAlert(
                "Error",
                error.response?.data?.message
                    ? error.response.data.message
                    : "Failed to confirm delivery. Please try again."
            );
        } finally {
            setConfirmingOrderId(null);
        }
    };

    // FIXED: Handle image upload with proper preview
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                showErrorAlert(
                    "Invalid File",
                    "Please select a valid image file (JPEG, PNG, etc.)"
                );
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showErrorAlert(
                    "File Too Large",
                    "Image size should be less than 5MB"
                );
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                // Set preview immediately with data URL
                setImagePreview(e.target.result);

                // Update form data with file for upload
                setFormData((prev) => ({
                    ...prev,
                    profileImageFile: file, // Store file for upload
                    profile_image: e.target.result, // Store preview URL for immediate display
                }));
            };
            reader.onerror = () => {
                console.error("Error reading file");
                showErrorAlert(
                    "Error",
                    "Error reading image file. Please try another image."
                );
            };
            reader.readAsDataURL(file);
        }
    };

    // FIXED: Handle save with proper image handling
    const handleSave = async () => {
        try {
            setLoading(true);

            // Show loading alert
            const loadingAlert = showLoadingAlert(
                "Updating Profile",
                "Please wait while we save your changes..."
            );

            // Create FormData for all fields
            const formDataToSend = new FormData();
            formDataToSend.append("name", formData.name || "");
            formDataToSend.append("email", formData.email || "");
            formDataToSend.append("phone", formData.phone || "");
            formDataToSend.append("address", formData.address || "");
            formDataToSend.append("city", formData.city || "");
            formDataToSend.append("zip_code", formData.zip_code || "");

            // Append the actual file if it exists
            if (formData.profileImageFile) {
                formDataToSend.append(
                    "profile_image",
                    formData.profileImageFile
                );
                console.log("📤 Uploading new profile image file");
            } else {
                console.log("ℹ️ No new file selected, keeping existing image");
            }

            const response = await axios.post(
                route("update-profile"),
                formDataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            // Close loading alert
            loadingAlert.close();

            if (response.data.success) {
                const updatedUser = response.data.user;
                console.log("✅ Profile update response:", updatedUser);

                // FIXED: Handle the server response properly
                // The server returns both profile_image (path) and profile_image_url (full URL)
                let finalImageUrl = null;

                if (updatedUser.profile_image_url) {
                    // Use the full URL provided by server
                    finalImageUrl = updatedUser.profile_image_url;
                    console.log(
                        "🖼️ Using profile_image_url from server:",
                        finalImageUrl
                    );
                } else if (updatedUser.profile_image) {
                    // Convert path to full URL
                    finalImageUrl = getProfileImageUrl(
                        updatedUser.profile_image
                    );
                    console.log(
                        "🖼️ Converted profile_image to URL:",
                        finalImageUrl
                    );
                }

                // Update all states with the new data
                setUserData(updatedUser);
                setFormData(updatedUser);

                // Set the image preview to the final URL
                if (finalImageUrl) {
                    setImagePreview(finalImageUrl);
                    console.log("🖼️ Image preview updated to:", finalImageUrl);
                } else {
                    // If no image, set to default
                    setImagePreview("/image/user.png");
                    console.log("🖼️ No image, using default");
                }

                setIsEditing(false);

                // Clear the file object since it's been uploaded
                setFormData((prev) => ({
                    ...prev,
                    profileImageFile: null,
                }));

                // Show success message
                showSuccessAlert(
                    "Success!",
                    "Your profile has been updated successfully."
                );
            }
        } catch (error) {
            console.error("❌ Error updating profile:", error);

            // Close any existing loading alerts
            Swal.close();

            if (error.response?.data) {
                console.error("Server response:", error.response.data);
                showErrorAlert(
                    "Update Failed",
                    error.response.data.message ||
                        "Failed to update profile. Please try again."
                );
            } else {
                showErrorAlert(
                    "Update Failed",
                    "Error updating profile. Please check your connection and try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // FIXED: Handle cancel with proper image reset
    const handleCancel = () => {
        // Show confirmation if there are unsaved changes
        const hasChanges =
            formData.name !== userData.name ||
            formData.email !== userData.email ||
            formData.phone !== userData.phone ||
            formData.address !== userData.address ||
            formData.city !== userData.city ||
            formData.zip_code !== userData.zip_code ||
            formData.profileImageFile;

        if (hasChanges) {
            showConfirmationAlert(
                "Discard Changes?",
                "You have unsaved changes. Are you sure you want to discard them?",
                "Yes, Discard",
                "Continue Editing"
            ).then((result) => {
                if (result.isConfirmed) {
                    resetForm();
                }
            });
        } else {
            resetForm();
        }
    };

    const resetForm = () => {
        setFormData({ ...userData });
        // Reset to the current user's profile image
        setImagePreview(getProfileImageUrl(userData.profile_image));
        setIsEditing(false);

        // Clear any selected file
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "delivered":
                return "bg-green-100 text-green-800";
            case "shipped":
                return "bg-blue-100 text-blue-800";
            case "processing":
                return "bg-yellow-100 text-yellow-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "delivered":
                return <CheckCircle2 size={16} />;
            case "shipped":
                return <Truck size={16} />;
            case "processing":
                return <Package size={16} />;
            default:
                return <Package size={16} />;
        }
    };

    // View receipt function
    const viewReceipt = (order) => {
        setSelectedOrder(order);
        setShowReceiptModal(true);
    };

    // Print receipt function
    const printReceipt = (order) => {
        const receiptWindow = window.open("", "_blank");
        const receiptContent = generateReceiptContent(order);
        receiptWindow.document.write(receiptContent);
        receiptWindow.document.close();
        receiptWindow.print();
    };

    // Generate receipt HTML content
    const generateReceiptContent = (order) => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt - Order ${order.order_number}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                    .order-info { margin-bottom: 20px; }
                    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .items-table th { background-color: #f5f5f5; }
                    .total-section { text-align: right; margin-top: 20px; }
                    .thank-you { text-align: center; margin-top: 30px; font-style: italic; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-name">Relove Market</div>
                    <div>Order Receipt</div>
                </div>
                
                <div class="order-info">
                    <p><strong>Order Number:</strong> ${order.order_number}</p>
                    <p><strong>Order Date:</strong> ${new Date(
                        order.date
                    ).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                </div>

                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.order_items
                            .map(
                                (item) => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>RM ${item.price}</td>
                                <td>RM ${item.price * item.quantity}</td>
                            </tr>
                        `
                            )
                            .join("")}
                    </tbody>
                </table>

                <div class="total-section">
                    <p><strong>Total Amount: RM ${order.total}</strong></p>
                </div>

                <div class="thank-you">
                    Thank you for your purchase!
                </div>
            </body>
            </html>
        `;
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchOrderHistory();
        checkForOrderSuccessRedirect();
    }, []);

    // FIXED: Set initial image preview when component mounts
    useEffect(() => {
        if (userData.profile_image) {
            const initialImageUrl = getProfileImageUrl(userData.profile_image);
            setImagePreview(initialImageUrl);
        } else {
            setImagePreview("/image/user.png");
        }
    }, [userData.profile_image]);

    useEffect(() => {
        if (showOrderSuccessModal) {
            showOrderSuccessAlert();
        }
    }, [showOrderSuccessModal, recentOrderId]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 mt-16">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Enhanced Sidebar Navigation */}
                    <div className="lg:w-80 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
                            <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-100">
                                <div className="relative mb-4 group">
                                    <div className="w-28 max-h-28 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                        {/* FIXED: Simplified image source logic */}
                                        <img
                                            src={
                                                imagePreview ||
                                                "/image/user.png"
                                            }
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                console.error(
                                                    "❌ Error loading image:",
                                                    e.target.src
                                                );
                                                e.target.src =
                                                    "/image/user.png";
                                            }}
                                        />
                                    </div>
                                    {isEditing && (
                                        <button
                                            onClick={triggerFileInput}
                                            className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all transform group-hover:scale-110 border-2 border-white"
                                        >
                                            <Camera size={16} />
                                        </button>
                                    )}
                                    <input
                                        type="file"
                                        name="profile_image"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 text-center">
                                    {formData.name}
                                </h2>
                                <p className="text-gray-600 text-sm mt-1">
                                    Member since{" "}
                                    {dayjs(auth.user.created_at).format(
                                        "MMMM YYYY"
                                    )}
                                </p>
                                <div className="flex items-center mt-2 text-sm text-gray-500">
                                    <CheckCircle
                                        size={14}
                                        className="text-green-500 mr-1"
                                    />
                                    Verified Account
                                </div>
                            </div>

                            <nav className="space-y-1">
                                {[
                                    {
                                        id: "profile",
                                        icon: User,
                                        label: "Profile Information",
                                        badge: null,
                                    },
                                    {
                                        id: "orders",
                                        icon: ShoppingBag,
                                        label: "Order History",
                                        badge: orderHistory.length,
                                    },
                                    {
                                        id: "security",
                                        icon: Shield,
                                        label: "Security",
                                        badge: null,
                                    },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
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
                                        {item.badge !== null && (
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    activeTab === item.id
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                                                }`}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}

                                <Link href={route("logout")} method="POST">
                                    <button className="flex items-center px-4 py-3.5 rounded-xl text-left text-red-600 hover:bg-red-50 transition-all mt-4 group">
                                        <LogOut
                                            size={20}
                                            className="mr-3 flex-shrink-0"
                                        />
                                        <span className="flex-1">Logout</span>
                                    </button>
                                </Link>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        {/* Profile Tab */}
                        {activeTab === "profile" && (
                            <ProfileTab
                                formData={formData}
                                isEditing={isEditing}
                                setIsEditing={setIsEditing}
                                loading={loading}
                                handleCancel={handleCancel}
                                handleInputChange={handleInputChange}
                                handleSave={handleSave}
                            />
                        )}

                        {/* Orders Tab */}
                        {activeTab === "orders" && (
                            <OrdersTab
                                orderHistory={orderHistory}
                                getStatusColor={getStatusColor}
                                getStatusIcon={getStatusIcon}
                                currentPage={currentPage}
                                itemsPerPage={itemsPerPage}
                                totalPages={totalPages}
                                paginate={paginate}
                                viewReceipt={viewReceipt}
                                printReceipt={printReceipt}
                                loading={loading}
                                confirmOrderDelivery={confirmOrderDelivery}
                                confirmingOrderId={confirmingOrderId}
                                recentOrderId={recentOrderId}
                            />
                        )}

                        {/* Security Tab */}
                        {activeTab === "security" && (
                            <SecurityTab
                                showChangePassword={showChangePassword}
                                setShowChangePassword={setShowChangePassword}
                                passwordData={passwordData}
                                setPasswordData={setPasswordData}
                                handlePasswordChange={handlePasswordChange}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                            />
                        )}

                        {showReceiptModal && (
                            <ReceiptModal
                                order={selectedOrder}
                                isOpen={showReceiptModal}
                                onClose={() => setShowReceiptModal(false)}
                                onPrint={printReceipt}
                            />
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
