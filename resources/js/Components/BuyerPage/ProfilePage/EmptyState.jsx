export function EmptyState({
    icon: Icon,
    title,
    description,
    actionText,
    actionLink,
}) {
    return (
        <div className="text-center py-12">
            <Icon size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
            {actionText && (
                <a
                    href={actionLink || "#"}
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                    {actionText}
                </a>
            )}
        </div>
    );
}
