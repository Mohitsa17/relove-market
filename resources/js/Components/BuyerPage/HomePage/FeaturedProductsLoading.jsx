// Loading Component
export function FeaturedProductsLoading() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                    key={i}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
                >
                    <div className="w-full h-56 bg-gray-200"></div>
                    <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                        <div className="flex justify-between items-center">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
