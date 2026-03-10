import { X, ThumbsUp, Star } from "lucide-react";

export function ShowAllReviewsModal({
    reviewCount,
    setShowAllReviewsModal,
    allReviews,
    isLoadingReviews,
    hasMoreReviews,
    loadMoreReviews,
}) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl lg:rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 lg:p-6 border-b">
                    <h2 className="text-lg lg:text-xl text-black font-semibold">
                        All Reviews ({reviewCount})
                    </h2>
                    <button
                        onClick={() => setShowAllReviewsModal(false)}
                        className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="space-y-6">
                        {allReviews.map((review) => (
                            <div
                                key={review.id}
                                className="border-b pb-6 last:border-b-0"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {review.user?.profile_image ? (
                                            <img
                                                src={
                                                    import.meta.env
                                                        .VITE_BASE_URL +
                                                    review.user.profile_image
                                                }
                                                alt={
                                                    review.user?.name || "User"
                                                }
                                                className="w-full h-full rounded-lg object-cover"
                                            />
                                        ) : (
                                            <span>
                                                {review.avatar ||
                                                    (review.user?.name?.charAt(
                                                        0
                                                    ) ??
                                                        "U")}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className="font-semibold text-gray-900">
                                                {review.user.name}
                                            </span>
                                            {review.verified && (
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                    Verified
                                                </span>
                                            )}
                                            <span className="text-sm text-gray-500">
                                                {review.date}
                                            </span>
                                        </div>
                                        <div className="flex text-yellow-400 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    className={
                                                        i < review.rating
                                                            ? "fill-current"
                                                            : "text-gray-300"
                                                    }
                                                />
                                            ))}
                                        </div>
                                        <p className="text-gray-700 mb-3">
                                            {review.comment}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoadingReviews && (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        )}

                        {/* Load more button */}
                        {hasMoreReviews && !isLoadingReviews && (
                            <div className="text-center pt-4">
                                <button
                                    onClick={loadMoreReviews}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Load More Reviews
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
