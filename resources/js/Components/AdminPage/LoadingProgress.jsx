export function LoadingProgress({ modalType, modalMessage }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
                {modalType === "loading" && (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                        <p className="text-gray-700">{modalMessage}</p>
                    </div>
                )}
                {modalType === "success" && (
                    <p className="text-green-600 font-semibold whitespace-pre-wrap break-words">
                        {modalMessage}
                    </p>
                )}
                {modalType === "error" && (
                    <p className="text-red-600 font-semibold whitespace-pre-wrap break-words">
                        {modalMessage}
                    </p>
                )}
            </div>
        </div>
    );
}
