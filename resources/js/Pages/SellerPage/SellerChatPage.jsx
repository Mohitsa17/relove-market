import React, { useState, useEffect, useRef, useCallback } from "react";

import { SellerSidebar } from "@/Components/SellerPage/SellerSidebar";

import { RenderConversationsSidebar } from "@/Components/SellerPage/SellerChatPage/RenderConversationsSidebar";
import { RenderChatInterface } from "@/Components/SellerPage/SellerChatPage/RenderChatInterface";

import axios from "axios";

import Pusher from "pusher-js";

import { usePage } from "@inertiajs/react";

export default function SellerChatPage({ seller_storeInfo }) {
    const [activeConversation, setActiveConversation] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [conversationsLoading, setConversationsLoading] = useState(true);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [messageLoading, setMessageLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");

    const [showChat, setShowChat] = useState(false);

    const [isMobile, setIsMobile] = useState(false);

    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const [imageLoading, setImageLoading] = useState({});

    const messagesEndRef = useRef(null);

    const pusher = useRef(null);

    const { auth } = usePage().props;

    // ✅ KEPT: Handle new conversation creation - simplified without subscription checks
    const handleNewConversation = async (buyerId, productId) => {
        console.log("✅ Creating new conversation without restrictions");

        try {
            // Your existing logic to create new conversation
            const response = await axios.post("/conversations", {
                buyer_id: buyerId,
                product_id: productId,
            });
            return response.data.conversation;
        } catch (error) {
            console.error("Error creating conversation:", error);
            throw error;
        }
    };

    // ✅ KEPT: Add this function to handle the actual conversation creation from buyers
    const handleIncomingConversation = async (buyerId, productId) => {
        console.log(
            "✅ Handling incoming conversation request without restrictions"
        );

        try {
            const newConversation = await handleNewConversation(
                buyerId,
                productId
            );
            return { success: true, conversation: newConversation };
        } catch (error) {
            console.error("Error creating conversation:", error);
            return { success: false, error: error.message };
        }
    };

    const handleNewMessage = useCallback(
        (newMessageData) => {
            console.log("🔄 Handling new message:", newMessageData);

            const isFromCurrentSeller =
                newMessageData.sender_type === "seller" &&
                newMessageData.sender_id === auth.user.seller_id;

            // Auto-mark seller messages as read when received
            if (newMessageData.sender_type === "buyer" && activeConversation) {
                newMessageData.read = true;
            }

            if (isFromCurrentSeller && !newMessageData.isOptimistic) {
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
                                  newMessageData.sender_type === "buyer"
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
    );

    // ✅ KEPT: Filter conversations based on search
    const filteredConversations = conversations.filter(
        (conv) =>
            conv.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.product?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ✅ KEPT: Check if mobile on component mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // ✅ KEPT: Fetch conversations on component mount
    useEffect(() => {
        fetchConversations();
    }, []);

    // ✅ KEPT: Initialize component with proper data handling
    useEffect(() => {
        if (conversations && conversations.length > 0) {
            setConversations(conversations);

            // Set active conversation if provided
            if (activeConversation) {
                const foundConversation = conversations.find(
                    (conv) => conv.id == activeConversation
                );
                if (foundConversation) {
                    setActiveConversation(foundConversation);
                    // On mobile, hide sidebar when conversation is selected
                    if (isMobile) {
                        setShowChat(true);
                    }
                }
            }
        }
    }, [activeConversation, isMobile]);

    // ✅ KEPT: Auto-mark as read when new messages arrive and conversation is active
    useEffect(() => {
        if (!activeConversation || messages.length === 0) return;

        // Check if there are any unread messages from the seller
        const hasUnreadMessages = messages.some(
            (message) =>
                message.sender_type === "buyer" &&
                !message.read &&
                !message.isOptimistic
        );

        if (hasUnreadMessages) {
            markAsRead(activeConversation.id);

            // Also update local message state to show as read
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.sender_type === "buyer" &&
                    !msg.read &&
                    !msg.isOptimistic
                        ? { ...msg, read: true }
                        : msg
                )
            );
        }
    }, [messages, activeConversation]);

    // ✅ KEPT: Fetch conversations from API
    const fetchConversations = async () => {
        try {
            setConversationsLoading(true);
            setError(null);

            const response = await axios.get("/conversations");

            setConversations(response.data);
        } catch (error) {
            console.error("Error fetching conversations:", error);
            setError("Failed to load conversations. Please try again.");
        } finally {
            setConversationsLoading(false);
            setRefreshing(false);
        }
    };

    // ✅ KEPT: Mark conversation as read
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
                    msg.sender_type === "buyer"
                        ? { ...msg, read: true }
                        : msg
                )
            );
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    // ✅ KEPT: Handle image loading
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

    // ✅ KEPT: Format timestamp for conversation list display
    const formatConversationTimeForDisplay = (timestamp) => {
        if (!timestamp || timestamp === "No messages") return "No messages";

        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffInMs = now - date;
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

            if (diffInMinutes < 1) return "Just now";
            if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
            if (diffInHours < 24) return `${diffInHours}h ago`;
            if (diffInDays < 7) return `${diffInDays}d ago`;

            return date.toLocaleDateString();
        } catch (error) {
            return "Recently";
        }
    };

    // ✅ KEPT: Initialize Pusher for real-time messaging
    useEffect(() => {
        if (!auth.user) return;

        const isSeller = auth.user.user_id && auth.user.seller_id !== undefined;
        const roleSuffix = isSeller ? "seller" : "buyer";
        const userId = auth.user.seller_id;

        const initializePusher = async () => {
            try {
                pusher.current = new Pusher(
                    import.meta.env.VITE_PUSHER_APP_KEY,
                    {
                        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
                        forceTLS: true,
                        authEndpoint: "/broadcasting/auth",
                    }
                );

                pusher.current.connection.bind("connected", () => {
                    console.log("Pusher connected successfully");
                });

                pusher.current.connection.bind("error", (err) => {
                    console.error("Pusher connection error:", err);
                });

                // Subscribe to user-wide channel for all conversations
                const sellerChannel = pusher.current.subscribe(
                    `private-user.${userId}.${roleSuffix}`
                );

                sellerChannel.bind("MessageSent", (data) => {
                    console.log("🔔 New message notification received:", data);

                    // If this message is for the currently active conversation, add it to messages
                    if (
                        activeConversation?.id === data.message.conversation_id
                    ) {
                        // Auto-mark as read if it's a seller message
                        if (data.message.sender_type === "buyer") {
                            data.message.read = true;
                            markAsRead(activeConversation.id);
                        }
                    }
                    handleNewMessage(data.message);
                });

                return () => {
                    sellerChannel.unbind_all();
                    sellerChannel.unsubscribe();
                };
            } catch (error) {
                console.error("Pusher initialization error:", error);
            }
        };

        initializePusher();

        return () => {
            if (pusher.current) {
                pusher.current.disconnect();
            }
        };
    }, [auth.user, activeConversation]);

    // ✅ KEPT: Load messages when active conversation changes
    useEffect(() => {
        if (activeConversation) {
            loadMessages(activeConversation.id);
            markConversationAsRead(activeConversation.id);
        }
    }, [activeConversation, handleNewMessage]);

    // ✅ KEPT: Load messages function
    const loadMessages = async (conversationId) => {
        setMessageLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/messages/${conversationId}`);

            // Handle both response structures
            const messagesData =
                response.data.message ||
                response.data.messages ||
                response.data;
            setMessages(Array.isArray(messagesData) ? messagesData : []);
        } catch (error) {
            console.error("Error loading messages:", error);
            setError("Failed to load messages. Please try again.");
        } finally {
            setMessageLoading(false);
        }
    };

    // ✅ KEPT: Mark conversation as read
    const markConversationAsRead = async (conversationId) => {
        try {
            await axios.post(`/conversations/${conversationId}/mark-read`);
            // Update local state to reflect read status
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
                    msg.sender_type === "buyer"
                        ? { ...msg, read: true }
                        : msg
                )
            );
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    // ✅ KEPT: Handle send message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        const tempId = Date.now();
        const messageContent = newMessage.trim();

        try {
            // Create optimistic update
            const tempMessage = {
                id: tempId,
                conversation_id: activeConversation.id,
                sender_id: auth.user.user_id,
                sender_type: "seller",
                message: messageContent,
                created_at: new Date().toISOString(),
                read: false,
                isOptimistic: true,
                sender: {
                    id: auth.user.seller_id,
                    name: auth.user.name,
                },
            };

            setMessages((prev) => [...prev, tempMessage]);
            setNewMessage("");

            // Update conversations list locally
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

            // Send to server
            const response = await axios.post("/send-message", {
                message: messageContent,
                conversation_id: activeConversation.id,
                sender_type: "seller",
                tempId: tempId.toString(),
            });

            console.log("Message sent successfully:", response.data);
        } catch (error) {
            console.error("Error sending message:", error);
            setError("Failed to send message. Please try again.");
        }
    };

    // ✅ KEPT: Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ✅ KEPT: Handle back to conversations list on mobile
    const handleBackToConversations = () => {
        setShowChat(false);
        setTimeout(() => {
            setActiveConversation(null);
        }, 300);
    };

    // ✅ KEPT: Handle conversation click
    const handleConversationClick = async (conversation) => {
        setActiveConversation(conversation);
        await markAsRead(conversation.id);
        if (isMobile) {
            setShowChat(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <SellerSidebar
                shopName={
                    seller_storeInfo?.[0]?.seller_store?.store_name ||
                    "My Store"
                }
            />

            <main className="flex-1 p-4 md:p-6">
                <div className="bg-white rounded-xl shadow-sm h-[calc(100vh-2rem)] flex overflow-hidden">
                    <RenderConversationsSidebar
                        conversations={filteredConversations}
                        isMobile={isMobile}
                        showChat={showChat}
                        searchConversation={setSearchTerm}
                        searchTerm={searchTerm}
                        conversationsLoading={conversationsLoading}
                        activeConversation={activeConversation}
                        handleConversationClick={handleConversationClick}
                    />
                    <RenderChatInterface
                        isMobile={isMobile}
                        activeConversation={activeConversation}
                        conversationsLoading={conversationsLoading}
                        showChat={showChat}
                        handleBackToConversations={handleBackToConversations}
                        error={error}
                        setError={setError}
                        messageLoading={messageLoading}
                        messages={messages}
                        handleSendMessage={handleSendMessage}
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                        messagesEndRef={messagesEndRef}
                        formatConversationTimeForDisplay={
                            formatConversationTimeForDisplay
                        }
                        imageLoading={imageLoading}
                        handleImageError={handleImageError}
                        handleImageLoad={handleImageLoad}
                    />
                </div>
            </main>
        </div>
    );
}
