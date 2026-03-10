import { X, Star, CheckCircle, Upload, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";

export function ShowReviewModal({
    setShowReviewModal,
    handleAddReview,
    setNewReview,
    newReview,
}) {
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newReview.rating === 0 || !newReview.comment.trim()) return;

        setIsSubmitting(true);
        try {
            await handleAddReview(e);
            // Show success state briefly before closing
            setTimeout(() => {
                setShowReviewModal(false);
            }, 1500);
        } catch (error) {
            setIsSubmitting(false);
        }
    };

    const ratingLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop with blur effect */}
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" />

            {/* Modal container */}
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                {/* Modal panel with slide-up animation */}
                <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                                <Star className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="mt-4 text-2xl font-bold text-white">
                                Share Your Experience
                            </h2>
                            <p className="mt-2 text-blue-100 text-sm">
                                Your review helps others make better decisions
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <form
                        onSubmit={handleSubmit}
                        className="px-6 py-8 space-y-8"
                    >
                        {/* Rating Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-gray-900">
                                    Overall Rating
                                </label>
                                <span className="text-sm font-medium text-blue-600">
                                    {hoverRating > 0
                                        ? ratingLabels[hoverRating - 1]
                                        : newReview.rating > 0
                                        ? ratingLabels[newReview.rating - 1]
                                        : "Select a rating"}
                                </span>
                            </div>

                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() =>
                                            setNewReview((prev) => ({
                                                ...prev,
                                                rating: star,
                                            }))
                                        }
                                        onMouseEnter={() =>
                                            setHoverRating(star)
                                        }
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="transform transition-transform hover:scale-110 active:scale-95"
                                    >
                                        <Star
                                            className={`h-10 w-10 transition-all duration-200 ${
                                                star <=
                                                (hoverRating ||
                                                    newReview.rating)
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-between text-xs text-gray-500 px-1">
                                <span>Poor</span>
                                <span>Excellent</span>
                            </div>
                        </div>

                        {/* Review Text */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-900">
                                Detailed Review
                            </label>
                            <div className="relative">
                                <textarea
                                    value={newReview.comment}
                                    onChange={(e) =>
                                        setNewReview((prev) => ({
                                            ...prev,
                                            comment: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 resize-none transition-all"
                                    rows="5"
                                    placeholder="What did you like or dislike? What should others know about this product?"
                                />
                                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                    {newReview.comment.length}/500
                                </div>
                            </div>
                        </div>

                        {/* Requirements */}
                        {newReview.rating === 0 || !newReview.comment.trim() ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-yellow-700">
                                    <p className="font-medium">
                                        Complete required fields:
                                    </p>
                                    <ul className="mt-1 list-disc list-inside space-y-1">
                                        {newReview.rating === 0 && (
                                            <li>Select a star rating</li>
                                        )}
                                        {!newReview.comment.trim() && (
                                            <li>Write your review</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        ) : null}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowReviewModal(false)}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={
                                    newReview.rating === 0 ||
                                    !newReview.comment.trim() ||
                                    isSubmitting
                                }
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5" />
                                        Submit Review
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer Note */}
                    <div className="border-t border-gray-100 px-6 py-4">
                        <p className="text-xs text-gray-500 text-center">
                            By submitting, you agree to our{" "}
                            <a
                                href="#"
                                className="text-blue-600 hover:underline"
                            >
                                Review Guidelines
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
