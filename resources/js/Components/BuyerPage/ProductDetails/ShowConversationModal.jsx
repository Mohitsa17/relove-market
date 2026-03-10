import {
    X,
    Send,
    MessageCircle,
    Sparkles,
    AlertCircle,
    Clock,
    ShieldCheck,
} from "lucide-react";
import { useState } from "react";

export function ShowConversationModal({
    setInitialMessage,
    initialMessage,
    setShowConversationModal,
    startConversation,
}) {
    const [isTyping, setIsTyping] = useState(false);
    const [suggestedMessages] = useState([
        "Is this item still available?",
        "Can you provide more details about the condition?",
        "Do you offer any discounts for bulk purchase?",
        "What's the earliest pickup/delivery date?",
        "Can I see more photos of the product?",
    ]);

    const handleMessageChange = (e) => {
        setInitialMessage(e.target.value);
        setIsTyping(e.target.value.length > 0);
    };

    const handleSuggestedMessage = (message) => {
        setInitialMessage(message);
        setIsTyping(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!initialMessage.trim()) return;
        await startConversation(e);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop with blur effect */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />

            {/* Modal container */}
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                {/* Modal panel with subtle animation */}
                <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-7">
                        {/* Close button */}
                        <button
                            onClick={() => setShowConversationModal(false)}
                            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* Header content */}
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                                <MessageCircle className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-xl font-bold text-white">
                                    Start a Conversation
                                </h2>
                                <p className="text-sm text-purple-100 mt-1">
                                    Connect with the seller directly
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6 space-y-6">
                        {/* Security & Tips Section */}
                        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-blue-900">
                                        💬 Safe & Secure Messaging
                                    </p>
                                    <div className="text-xs text-blue-700 space-y-1">
                                        <p className="flex items-center gap-2">
                                            <span className="text-blue-500">
                                                •
                                            </span>
                                            Keep communication within Relove
                                            Market
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="text-blue-500">
                                                •
                                            </span>
                                            Never share personal contact
                                            information
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="text-blue-500">
                                                •
                                            </span>
                                            Report suspicious messages to our
                                            team
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Suggested Messages */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    Quick Questions
                                </h3>
                                <Sparkles className="h-4 w-4 text-amber-500" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {suggestedMessages.map((message, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() =>
                                            handleSuggestedMessage(message)
                                        }
                                        className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                                    >
                                        {message}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message Input */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-900">
                                    Your Message
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={initialMessage}
                                        onChange={handleMessageChange}
                                        placeholder="Type your message here... Ask about availability, pricing, shipping, or any other questions."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400 resize-none transition-all min-h-[120px]"
                                        rows="4"
                                    />
                                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                        {isTyping && (
                                            <Clock className="h-4 w-4 text-gray-400 animate-pulse" />
                                        )}
                                        <span className="text-xs text-gray-400">
                                            {initialMessage.length}/500
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Requirements */}
                            {!initialMessage.trim() ? (
                                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-amber-700">
                                        <p className="font-medium">
                                            Message required
                                        </p>
                                        <p className="mt-1 text-xs">
                                            Please type a message to start the
                                            conversation
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConversationModal(false)
                                    }
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!initialMessage.trim()}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
                                >
                                    <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    Send Message
                                </button>
                            </div>
                        </form>

                        {/* Additional Info */}
                        <div className="border-t border-gray-100 pt-4">
                            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    <span>
                                        Typically replies within 24 hours
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    <span>Verified Seller</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 rounded-b-2xl">
                        <p className="text-xs text-gray-500 text-center">
                            All messages are encrypted and secure.{" "}
                            <a
                                href="#"
                                className="text-purple-600 hover:underline font-medium"
                            >
                                Learn more
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
