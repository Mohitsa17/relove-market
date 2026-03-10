import {
    Store,
    ChevronLeft,
    User,
    Info,
    Send,
    MessageCircle,
    Paperclip,
} from "lucide-react";

import { ErrorDisplay } from "./ErrorDisplay";
import { MessageBubble } from "./MessageBubble";

import { LoadingProgress } from "@/Components/AdminPage/LoadingProgress";

export function RenderChatInterface({
    isMobile,
    activeConversation,
    conversationsLoading,
    showChat,
    handleBackToConversations,
    error,
    setError,
    messageLoading,
    messages,
    handleSendMessage,
    newMessage,
    setNewMessage,
    messagesEndRef,
    formatConversationTimeForDisplay,
    imageLoading,
    handleImageLoad,
    handleImageError,
}) {
    return (
        <div
            className={`flex flex-col flex-1 mt-12 md:mt-0 ${
                isMobile && !showChat ? "hidden" : "flex"
            }`}
        >
            {!activeConversation ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="bg-indigo-100 p-4 rounded-full mb-4">
                        <Store size={32} className="text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Seller Messages
                    </h3>
                    <p className="text-gray-500 max-w-md">
                        {conversationsLoading
                            ? "Loading your conversations..."
                            : "Select a conversation to chat with customers about your products."}
                    </p>
                </div>
            ) : (
                <>
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBackToConversations}
                                className="p-1 rounded text-black hover:bg-gray-100 md:hidden"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center">
                                {activeConversation.user?.profile_image ? (
                                    <img
                                        src={
                                            import.meta.env.VITE_BASE_URL +
                                            activeConversation.user
                                                .profile_image
                                        }
                                        alt={
                                            activeConversation.user?.name ||
                                            "User"
                                        }
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User size={20} className="text-gray-600" />
                                )}
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">
                                    {activeConversation.buyer_name ||
                                        "Customer"}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Customer • {activeConversation.product}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                        <ErrorDisplay error={error} setError={setError} />

                        {messageLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <LoadingProgress
                                    modalType="loading"
                                    modalMessage="Loading messages..."
                                />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <MessageCircle
                                    size={48}
                                    className="mb-3 text-gray-300"
                                />
                                <p>No messages yet</p>
                                <p className="text-sm">
                                    Start the conversation with your customer
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <MessageBubble
                                        key={message.id || message.tempId}
                                        message={message}
                                        formatConversationTimeForDisplay={
                                            formatConversationTimeForDisplay
                                        }
                                        imageLoading={imageLoading}
                                        handleImageLoad={handleImageLoad}
                                        handleImageError={handleImageError}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-200 bg-white">
                        <form
                            onSubmit={handleSendMessage}
                            className="flex items-center gap-2"
                        >
                            <button
                                type="button"
                                className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-indigo-50"
                                title="Attach file"
                            >
                                <Paperclip size={20} />
                            </button>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="text-black flex-1 border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={messageLoading}
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || messageLoading}
                                className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Send message"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
