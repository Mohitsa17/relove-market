import { Store, Search, User, MessageCircle } from "lucide-react";

import { LoadingProgress } from "@/Components/AdminPage/LoadingProgress";

export function RenderConversationsSidebar({
    conversations,
    isMobile,
    showChat,
    searchConversation,
    searchTerm,
    conversationsLoading,
    activeConversation,
    handleConversationClick,
}) {
    return (
        <div
            className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col mt-16 md:mt-0 ${
                isMobile && showChat ? "hidden" : "flex"
            }`}
        >
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-full">
                            <Store className="text-indigo-600" size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                Seller Messages
                            </h1>
                            <p className="text-sm text-gray-600">
                                Chat with your customers
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <Search
                        className="absolute left-3 top-2.5 text-gray-400"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="Search customers or products..."
                        value={searchTerm}
                        onChange={(e) => searchConversation(e.target.value)}
                        className="text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {conversationsLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <LoadingProgress
                            modalType="loading"
                            modalMessage="Loading conversations..."
                        />
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <MessageCircle
                            size={48}
                            className="mx-auto mb-3 text-gray-300"
                        />
                        <p>No conversations found.</p>
                        <p className="text-sm mt-1">
                            {searchTerm
                                ? "Try adjusting your search terms"
                                : "When customers message you, they will appear here"}
                        </p>
                    </div>
                ) : (
                    conversations.map((conversation) => {
                        return (
                            <div
                                key={conversation.id}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                                    activeConversation?.id === conversation.id
                                        ? "bg-blue-50 border-l-4 border-l-indigo-600"
                                        : ""
                                }`}
                                onClick={() =>
                                    handleConversationClick(conversation)
                                }
                            >
                                <div className="flex items-start gap-3">
                                    <div className="bg-gray-200 rounded-full h-12 w-12 flex items-center justify-center overflow-hidden">
                                        {conversation.user?.profile_image ? (
                                            <img
                                                src={
                                                    import.meta.env
                                                        .VITE_BASE_URL +
                                                    conversation.user
                                                        .profile_image
                                                }
                                                alt={
                                                    conversation.user?.name ||
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

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {conversation.buyer_name ||
                                                    "Unknown Customer"}
                                            </h3>
                                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                                {conversation.timestamp}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 truncate mb-2">
                                            {conversation.last_message ||
                                                "No messages yet"}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full truncate max-w-[120px]">
                                                {conversation.product}
                                            </span>
                                            {conversation.unread_count > 0 && (
                                                <span className="bg-indigo-600 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center">
                                                    {conversation.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
