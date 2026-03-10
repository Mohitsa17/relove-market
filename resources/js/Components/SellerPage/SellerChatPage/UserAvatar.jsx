import { User } from "lucide-react";

export function UserAvatar({
    user,
    size = 8,
    className = "",
    imageLoading,
    handleImageLoad,
    handleImageError,
}) {
    const avatarId = `avatar-${user?.id || "default"}`;
    const isLoading = imageLoading?.[avatarId] !== false;

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
}
