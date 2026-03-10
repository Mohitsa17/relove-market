import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Search,
    Paperclip,
    Send,
    MoreVertical,
    MessageCircle,
    AlertCircle,
    User,
    Menu,
    X,
    Mic,
    Clock,
    ChevronLeft,
} from "lucide-react";

import { Footer } from "@/Components/BuyerPage/Footer";
import { Navbar } from "@/Components/BuyerPage/Navbar";

import { usePage } from "@inertiajs/react";

import axios from "axios";

import Pusher from "pusher-js";

export default function BuyerChatPage() {
    const [activeConversation, setActiveConversation] = useState(null);
    const [conversations, setConversations] = useState([]);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(false);

    const [isMobile, setIsMobile] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    const [pusherError, setPusherError] = useState(null);

    const [connectionStatus, setConnectionStatus] = useState("connecting");

    const [isSending, setIsSending] = useState(false);

    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

    const [imageLoading, setImageLoading] = useState({}); // Track image loading states

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const pusher = useRef(null);

    const { auth } = usePage().props;

    const handleNewMessage = useCallback(
        (newMessageData) => {
            const isFromCurrentBuyer =
                newMessageData.sender_type === "buyer" &&
                newMessageData.sender_id === auth.user.user_id;

            // Auto-mark seller messages as read when received
            if (newMessageData.sender_type === "seller" && activeConversation) {
                newMessageData.read = true;
            }

            if (isFromCurrentBuyer && !newMessageData.isOptimistic) {
                return;
            }

            setMessages((prev) => {
                // Enhanced duplicate detection
                const messageExists = prev.some((msg) => {
                    // Check by ID
                    if (
                        msg.id &&
                        newMessageData.id &&
                        msg.id === newMessageData.id
                    ) {
                        return true;
                    }
                    // Check by tempId (for optimistic updates)
                    if (
                        msg.tempId &&
                        newMessageData.tempId &&
                        msg.tempId === newMessageData.tempId
                    ) {
                        return true;
                    }
                    // Check by content and sender (prevent Pusher duplicates)
                    if (
                        msg.message === newMessageData.message &&
                        msg.sender_id === newMessageData.sender_id &&
                        Math.abs(
                            new Date(msg.created_at) -
                                new Date(newMessageData.created_at)
                        ) < 5000
                    ) {
                        return true;
                    }
                    return false;
                });

                if (messageExists) {
                    console.log("📝 Message already exists, skipping...");
                    return prev;
                }

                setTimeout(() => {
                    if (messagesEndRef.current) {
                        messagesEndRef.current.scrollIntoView({
                            behavior: "smooth",
                            block: "end",
                        });
                    }
                }, 150);

                return [...prev, newMessageData];
            });

            // Update conversations list
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === newMessageData.conversation_id
                        ? {
                              ...conv,
                              last_message: newMessageData.message,
                              last_message_at: newMessageData.created_at,
                              timestamp: "Just now",
                              unread_count:
                                  newMessageData.sender_type === "seller"
                                      ? activeConversation &&
                                        activeConversation.id ===
                                            newMessageData.conversation_id
                                          ? 0 // No unread count if this conversation is active
                                          : (conv.unread_count || 0) + 1
                                      : conv.unread_count || 0, // Keep existing count for buyer messages
                          }
                        : conv
                )
            );
        },
        [auth.user, activeConversation]
    ); // Make sure to wrap in useCallback

    const filteredConversations = conversations.filter(
        (conv) =>
            conv.seller_name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            conv.product?.product_name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    // Auto-dismiss error after 5 seconds
    useEffect(() => {
        if (pusherError) {
            const timer = setTimeout(() => {
                setPusherError(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [pusherError]);

    // Initialize Pusher
    useEffect(() => {
        if (!auth.user) return;

        const isBuyer = auth.user.user_id !== undefined;
        const roleSuffix = isBuyer ? "buyer" : "seller";
        const userId = auth.user.user_id;

        const initializePusher = async () => {
            try {
                pusher.current = new Pusher(
                    import.meta.env.VITE_PUSHER_APP_KEY,
                    {
                        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
                        forceTLS: true,
                        authEndpoint: "/broadcasting/auth",
                        // enabledTransports: ["ws", "wss"],
                    }
                );

                pusher.current.connection.bind("error", (err) => {
                    console.error("Pusher connection error:", err);
                    setPusherError("Connection failed. Reconnecting...");
                    setConnectionStatus("failed");
                });

                pusher.current.connection.bind("connected", () => {
                    console.log("Pusher connected successfully");
                    setPusherError(null);
                    setConnectionStatus("connected");
                });

                pusher.current.connection.bind("disconnected", () => {
                    setConnectionStatus("disconnected");
                });

                // Subscribe to user-wide channel for all conversations
                const userChannel = pusher.current.subscribe(
                    `private-user.${userId}.${roleSuffix}`
                );

                userChannel.bind("MessageSent", (data) => {
                    // If this message is for the currently active conversation, add it to messages
                    if (
                        activeConversation?.id === data.message.conversation_id
                    ) {
                        // Auto-mark as read if it's a seller message
                        if (data.message.sender_type === "seller") {
                            data.message.read = true;
                            markAsRead(activeConversation.id);
                        }
                    }
                    handleNewMessage(data.message);
                });

                return () => {
                    userChannel.unbind_all();
                    userChannel.unsubscribe();
                };
            } catch (error) {
                console.error("Pusher initialization error:", error);
                setPusherError("Failed to initialize real-time connection");
                setConnectionStatus("failed");
            }
        };

        initializePusher();

        return () => {
            if (pusher.current) {
                pusher.current.disconnect();
            }
        };
    }, [auth.user, activeConversation]);

    // Mobile detection with improved handling
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);

            // On mobile, show sidebar by default if no active conversation
            if (mobile && !activeConversation) {
                setShowMobileSidebar(true);
            }
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, [activeConversation]);

    // Load conversations from API if props are empty
    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        if ((!conversations || conversations.length === 0) && auth.user) {
            try {
                setLoading(true);
                const response = await axios.get("/conversations");

                setConversations(response.data);
            } catch (error) {
                console.error("Error loading conversations:", error);
                setPusherError("Failed to load conversations");
            } finally {
                setLoading(false);
            }
        }
    };

    // Initialize component with proper data handling
    useEffect(() => {
        if (conversations && conversations.length > 0) {
            setConversations(conversations);

            // Set active conversation if provided
            if (activeConversation) {
                const foundConversation = conversations.find(
                    (conv) => conv.id == activeConversation
                );
                if (foundConversation) {
                    console.log(
                        "Setting active conversation:",
                        foundConversation
                    );
                    setActiveConversation(foundConversation);
                    // On mobile, hide sidebar when conversation is selected
                    if (isMobile) {
                        setShowMobileSidebar(false);
                    }
                }
            }
        }
    }, [activeConversation, isMobile]);

    // Load messages when active conversation changes
    useEffect(() => {
        if (activeConversation) {
            loadMessages(activeConversation.id);
            markAsRead(activeConversation.id);
            // Reset scroll state when conversation changes
            setHasScrolledToBottom(false);
            setShouldScrollToBottom(true);
        }
    }, [activeConversation, handleNewMessage]);

    // Improved scroll to bottom functionality
    useEffect(() => {
        if (shouldScrollToBottom && messages.length > 0) {
            scrollToBottom();
            setShouldScrollToBottom(false);
            setHasScrolledToBottom(true);
        }
    }, [messages, shouldScrollToBottom]);

    // Auto-scroll when new messages arrive
    useEffect(() => {
        if (messages.length > 0 && !hasScrolledToBottom) {
            scrollToBottom();
            setHasScrolledToBottom(true);
        }
    }, [messages.length, hasScrolledToBottom]);

    // Auto-mark as read when new messages arrive and conversation is active
    useEffect(() => {
        if (!activeConversation || messages.length === 0) return;

        // Check if there are any unread messages from the seller
        const hasUnreadMessages = messages.some(
            (message) =>
                message.sender_type === "seller" &&
                !message.read &&
                !message.isOptimistic
        );

        if (hasUnreadMessages) {
            markAsRead(activeConversation.id);

            // Also update local message state to show as read
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.sender_type === "seller" &&
                    !msg.read &&
                    !msg.isOptimistic
                        ? { ...msg, read: true }
                        : msg
                )
            );
        }
    }, [messages, activeConversation]);

    const loadMessages = async (conversationId) => {
        setLoading(true);
        try {
            const response = await axios.get(`/messages/${conversationId}`);

            // Handle both response structures
            const messagesData =
                response.data.message ||
                response.data.messages ||
                response.data;
            setMessages(Array.isArray(messagesData) ? messagesData : []);

            setShouldScrollToBottom(true);
        } catch (error) {
            console.error("Error loading messages:", error);
            setPusherError("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (conversationId) => {
        try {
            await axios.post(`/conversations/${conversationId}/mark-read`);

            // Update local state
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === conversationId
                        ? { ...conv, unread_count: 0 }
                        : conv
                )
            );

            // Update messages read status locally
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.conversation_id === conversationId &&
                    msg.sender_type === "seller"
                        ? { ...msg, read: true }
                        : msg
                )
            );
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || isSending) return;

        const tempId = Date.now(); // This is a number
        const messageContent = newMessage.trim();
        setIsSending(true);

        try {
            // Optimistic update
            const tempMessage = {
                id: tempId,
                conversation_id: activeConversation.id,
                sender_id: auth.user.user_id,
                sender_type: "buyer", // or "seller" depending on the page
                message: messageContent,
                created_at: new Date().toISOString(),
                read: false,
                isOptimistic: true,
                sender: {
                    id: auth.user.user_id,
                    name: auth.user.name,
                },
            };

            setMessages((prev) => [...prev, tempMessage]);
            setNewMessage("");
            setShouldScrollToBottom(true);

            // Update conversation list
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === activeConversation.id
                        ? {
                              ...conv,
                              last_message: messageContent,
                              last_message_time: new Date().toISOString(),
                              timestamp: "Just now",
                              unread_count: 0,
                          }
                        : conv
                )
            );

            // Send to server - tempId will be automatically converted to string by axios
            const response = await axios.post("/send-message", {
                message: messageContent,
                conversation_id: activeConversation.id,
                sender_type: "buyer",
                tempId: tempId.toString(), // Send as number, it will be converted
            });

            console.log("✅ Message sent successfully:", response.data);
        } catch (error) {
            console.error("❌ Error sending message:", error);

            if (error.response?.status === 401) {
                setPusherError("Please log in again.");
            } else {
                setPusherError(
                    "Failed to send message. Please check your connection."
                );
            }
        } finally {
            setIsSending(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                });
            }
        }, 100);
    };

    const handleConversationClick = async (conversation) => {
        setActiveConversation(conversation);
        await markAsRead(conversation.id);
        if (isMobile) {
            setShowMobileSidebar(false);
        }
    };

    const toggleMobileSidebar = () => {
        setShowMobileSidebar(!showMobileSidebar);
        setActiveConversation(null);
    };

    // Handle image loading
    const handleImageLoad = (imageId) => {
        setImageLoading((prev) => ({
            ...prev,
            [imageId]: false,
        }));
    };

    const handleImageError = (imageId) => {
        setImageLoading((prev) => ({
            ...prev,
            [imageId]: false,
        }));
    };

    // Format time function
    const formatMessageTime = (timestamp) => {
        if (!timestamp) return "";

        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return "Just now";
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440)
            return `${Math.floor(diffInMinutes / 60)}h ago`;
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    // User Avatar Component with loading state
    const UserAvatar = ({ user, size = 8, className = "" }) => {
        const avatarId = `avatar-${user?.id || "default"}`;
        const isLoading = imageLoading[avatarId] !== false;

        return (
            <div className={`relative w-${size} h-${size} ${className}`}>
                {user.user?.profile_image ? (
                    // ✅ Buyer profile image
                    <>
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                            </div>
                        )}

                        <img
                            src={
                                import.meta.env.VITE_BASE_URL +
                                user.user.profile_image
                            }
                            alt={user.user?.name}
                            className={`w-full h-full rounded-full object-cover ${
                                isLoading ? "opacity-0" : "opacity-100"
                            } transition-opacity`}
                            onLoad={() => handleImageLoad(avatarId)}
                            onError={() => handleImageError(avatarId)}
                        />
                    </>
                ) : user.seller?.profile_image ? (
                    // ✅ Seller profile image (fallback)
                    <>
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                            </div>
                        )}

                        <img
                            src={
                                import.meta.env.VITE_BASE_URL +
                                user.seller.profile_image
                            }
                            alt={user.seller?.name}
                            className={`w-full h-full rounded-full object-cover ${
                                isLoading ? "opacity-0" : "opacity-100"
                            } transition-opacity`}
                            onLoad={() => handleImageLoad(avatarId)}
                            onError={() => handleImageError(avatarId)}
                        />
                    </>
                ) : (
                    // ❌ Default avatar
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                            <User size={20} className="text-gray-600" />
                        </span>
                    </div>
                )}
            </div>
        );
    };

    // Message Bubble Component
    const MessageBubble = ({ message }) => {
        const isBuyer = message.sender_type === "buyer";
        const isOptimistic = message.isOptimistic;

        return (
            <div
                className={`flex gap-2 mb-4 ${
                    isBuyer ? "justify-end" : "justify-start"
                }`}
            >
                {!isBuyer && (
                    <UserAvatar
                        user={message}
                        size={8}
                        className="flex-shrink-0"
                    />
                )}

                <div
                    className={`max-w-[70%] flex flex-col ${
                        isBuyer ? "items-end" : "items-start"
                    }`}
                >
                    {!isBuyer && (
                        <span className="text-xs text-gray-500 mb-1 ml-1">
                            {message.sender?.name}
                        </span>
                    )}
                    <div
                        className={`px-4 py-3 rounded-2xl ${
                            isBuyer
                                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-md"
                                : "bg-gray-100 text-gray-900 rounded-bl-md"
                        } ${isOptimistic ? "opacity-80" : ""} shadow-sm`}
                    >
                        <p className="text-sm leading-relaxed">
                            {message.message}
                        </p>
                    </div>
                    <div
                        className={`flex items-center gap-2 mt-1 ${
                            isBuyer ? "flex-row-reverse" : ""
                        }`}
                    >
                        <span
                            className={`text-xs ${
                                isBuyer ? "text-gray-500" : "text-gray-400"
                            }`}
                        >
                            {formatMessageTime(message.created_at)}
                        </span>
                        {isBuyer && (
                            <span className="text-xs">
                                {isOptimistic ? (
                                    <Clock size={12} className="inline" />
                                ) : message.read ? (
                                    "✓✓"
                                ) : (
                                    "✓"
                                )}
                            </span>
                        )}
                        {/* Show read status for seller messages */}
                        {!isBuyer && message.read && (
                            <span className="text-xs text-gray-400">Read</span>
                        )}
                    </div>
                </div>

                {isBuyer && (
                    <UserAvatar
                        user={message}
                        size={8}
                        className="flex-shrink-0"
                    />
                )}
            </div>
        );
    };

    // Conversation List Item
    const ConversationItem = ({ conversation }) => {
        const isActive = activeConversation?.id === conversation.id;

        return (
            <div
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isActive
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm"
                        : "hover:bg-gray-50"
                }`}
                onClick={() => handleConversationClick(conversation)}
            >
                <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center">
                        {conversation.seller?.profile_image ? (
                            <img
                                src={
                                    import.meta.env.VITE_BASE_URL +
                                    conversation.seller.profile_image
                                }
                                alt={conversation.seller?.name || "User"}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User size={20} className="text-gray-600" />
                        )}
                    </div>
                    {conversation.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {conversation.unread_count}
                        </span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate text-sm">
                            {conversation.seller_name || "Unknown Seller"}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                            {conversation.timestamp}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-1">
                        {conversation.last_message || "No messages yet"}
                    </p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            {conversation.product || "Unknown Product"}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    // Error display component with auto-dismiss
    const ErrorDisplay = () => {
        if (!pusherError) return null;

        return (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg mb-4 flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span className="text-sm">{pusherError}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-16 bg-amber-200 rounded-full h-1">
                        <div
                            className="bg-amber-600 h-1 rounded-full transition-all duration-5000 ease-linear"
                            style={{ width: "100%" }}
                        />
                    </div>
                    <button
                        onClick={() => setPusherError(null)}
                        className="ml-2 px-3 py-1 bg-amber-100 border border-amber-300 rounded text-sm hover:bg-amber-200"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        );
    };

    // Loading Progress Component
    const LoadingProgress = ({ type = "messages" }) => {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
                    <div className="w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <p className="mt-3 text-gray-600 text-sm">
                    {type === "messages"
                        ? "Loading messages..."
                        : "Loading conversations..."}
                </p>
                <div className="w-32 bg-gray-200 rounded-full h-1.5 mt-2">
                    <div className="bg-blue-500 h-1.5 rounded-full animate-pulse"></div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            <Navbar />

            <main className="flex-1 pt-20 pb-8 px-4 md:px-8 lg:px-16">
                <div className="max-w-7xl mx-auto">
                    {/* Error Display */}
                    <ErrorDisplay />

                    {/* Main Chat Container */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 my-10">
                        <div className="flex h-[calc(100vh-12rem)]">
                            {/* Conversations Sidebar - Mobile Overlay Style */}
                            <div
                                className={`w-full md:w-96 border-r border-gray-100 flex flex-col transition-all duration-300 ${
                                    isMobile
                                        ? showMobileSidebar
                                            ? "fixed inset-0 z-20 bg-white md:static md:z-auto"
                                            : "hidden"
                                        : "flex"
                                }`}
                            >
                                {/* Sidebar Header with Close Button for Mobile */}
                                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {isMobile && (
                                                <button
                                                    onClick={
                                                        toggleMobileSidebar
                                                    }
                                                    className="p-2 rounded-lg bg-black hover:bg-white transition-colors md:hidden"
                                                >
                                                    <X size={20} />
                                                </button>
                                            )}
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-900">
                                                    Conversations
                                                </h2>
                                            </div>
                                        </div>
                                        {!isMobile && (
                                            <div className="text-sm text-gray-500">
                                                {conversations.length} chats
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <Search
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                            size={18}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Search conversations..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="text-black w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Conversations List */}
                                <div className="flex-1 overflow-y-auto">
                                    {loading ? (
                                        <LoadingProgress type="conversations" />
                                    ) : filteredConversations.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <MessageCircle
                                                    className="text-gray-400"
                                                    size={24}
                                                />
                                            </div>
                                            <h3 className="text-gray-900 font-medium mb-1">
                                                {conversations.length === 0
                                                    ? "No conversations"
                                                    : "No matches found"}
                                            </h3>
                                            <p className="text-gray-500 text-sm">
                                                {conversations.length === 0
                                                    ? "Start a conversation with a seller"
                                                    : "Try adjusting your search terms"}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-2">
                                            {filteredConversations.map(
                                                (conversation) => (
                                                    <ConversationItem
                                                        key={conversation.id}
                                                        conversation={
                                                            conversation
                                                        }
                                                    />
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Chat Interface */}
                            <div
                                className={`flex-1 flex flex-col transition-all duration-300 ${
                                    isMobile && !showMobileSidebar
                                        ? "flex"
                                        : "hidden md:flex"
                                }`}
                            >
                                {!activeConversation ? (
                                    // Empty State
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                                            <MessageCircle
                                                className="text-blue-600"
                                                size={32}
                                            />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            {conversations.length === 0
                                                ? "No conversations yet"
                                                : "Select a conversation"}
                                        </h3>
                                        <p className="text-gray-500 max-w-md">
                                            {conversations.length === 0
                                                ? "You don't have any conversations yet. Start by contacting a seller about a product."
                                                : "Choose a conversation from the sidebar to start messaging."}
                                        </p>
                                        {isMobile &&
                                            conversations.length > 0 && (
                                                <button
                                                    onClick={
                                                        toggleMobileSidebar
                                                    }
                                                    className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                                >
                                                    View Conversations
                                                </button>
                                            )}
                                    </div>
                                ) : (
                                    <>
                                        {/* Chat Header */}
                                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {isMobile && (
                                                        <button
                                                            onClick={
                                                                toggleMobileSidebar
                                                            }
                                                            className="p-2 rounded-lg text-black hover:bg-white transition-colors"
                                                        >
                                                            <ChevronLeft
                                                                size={20}
                                                            />
                                                        </button>
                                                    )}
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center">
                                                        {activeConversation
                                                            .seller
                                                            ?.profile_image ? (
                                                            <img
                                                                src={
                                                                    import.meta
                                                                        .env
                                                                        .VITE_BASE_URL +
                                                                    activeConversation
                                                                        .seller
                                                                        .profile_image
                                                                }
                                                                alt={
                                                                    activeConversation
                                                                        .seller
                                                                        ?.name ||
                                                                    "User"
                                                                }
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <User
                                                                size={20}
                                                                className="text-gray-600"
                                                            />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h2 className="font-semibold text-gray-900">
                                                            {
                                                                activeConversation.seller_name
                                                            }
                                                        </h2>
                                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                                            <span>
                                                                Product:
                                                            </span>
                                                            <span className="text-blue-600 font-medium">
                                                                {activeConversation.product ||
                                                                    "Unknown Product"}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Messages Area */}
                                        <div
                                            ref={messagesContainerRef}
                                            className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-white to-gray-50/50"
                                        >
                                            {loading ? (
                                                <LoadingProgress type="messages" />
                                            ) : (
                                                <div className="max-w-4xl mx-auto">
                                                    {messages.length === 0 ? (
                                                        <div className="text-center py-12 text-gray-500">
                                                            No messages yet.
                                                            Start the
                                                            conversation!
                                                        </div>
                                                    ) : (
                                                        messages.map(
                                                            (message) => (
                                                                <MessageBubble
                                                                    key={
                                                                        message.id ||
                                                                        message.tempId
                                                                    }
                                                                    message={
                                                                        message
                                                                    }
                                                                />
                                                            )
                                                        )
                                                    )}
                                                    <div ref={messagesEndRef} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Message Input */}
                                        <div className="p-4 border-t border-gray-100 bg-white">
                                            <form
                                                onSubmit={handleSendMessage}
                                                className="flex items-center gap-2"
                                            >
                                                <div className="flex items-center gap-1 flex-1">
                                                    <button
                                                        type="button"
                                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                                                    >
                                                        <Paperclip size={20} />
                                                    </button>
                                                    <div className="flex-1 relative">
                                                        <input
                                                            type="text"
                                                            value={newMessage}
                                                            onChange={(e) =>
                                                                setNewMessage(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Type your message..."
                                                            className="text-black w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                            disabled={isSending}
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={
                                                        !newMessage.trim() ||
                                                        isSending
                                                    }
                                                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2 min-w-[80px] justify-center"
                                                >
                                                    {isSending ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                            <span className="hidden sm:inline">
                                                                Sending...
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send size={18} />
                                                            <span className="hidden sm:inline">
                                                                Send
                                                            </span>
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Mobile Overlay */}
                            {isMobile && showMobileSidebar && (
                                <div
                                    className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
                                    onClick={toggleMobileSidebar}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
