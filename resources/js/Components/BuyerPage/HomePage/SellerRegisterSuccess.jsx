import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, ShoppingBag } from "lucide-react";

export function SellerRegisterSuccess({ isOpen, setIsOpen }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 md:p-8 text-center"
                    >
                        {/* Success Icon */}
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="w-16 h-16 text-green-500" />
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Seller Registration Received
                        </h2>

                        {/* Message */}
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            Thank you for registering as a seller on{" "}
                            <span className="font-semibold text-indigo-600">
                                Relove Market
                            </span>
                            . Your application is under review and will be
                            processed within{" "}
                            <span className="font-medium">around 1 week</span>.
                        </p>

                        {/* Extra info */}
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                            <Clock className="w-4 h-4" />
                            <span>
                                Please wait patiently, we’ll notify you via email once
                                approved.
                            </span>
                        </div>

                        {/* CTA */}
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    window.location.href = "/shopping";
                                }}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md transition"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Start Shopping
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}