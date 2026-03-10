import { FaCheckCircle } from "react-icons/fa";

const steps = ["Account", "Store", "Review"];

export function SellerProgressBar({ currentStep }) {
    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="relative">
                {/* Progress line - Hidden on mobile, shown on desktop */}
                <div className="hidden md:block absolute top-4 left-0 right-0 h-1.5 bg-gray-200 rounded-full">
                    <div
                        className="h-1.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300"
                        style={{
                            width: `${
                                ((currentStep - 1) / (steps.length - 1)) * 100
                            }%`,
                        }}
                    ></div>
                </div>

                {/* Steps */}
                <div className="relative flex justify-between">
                    {steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const isActive = stepNumber === currentStep;
                        const isCompleted = stepNumber < currentStep;

                        return (
                            <div
                                key={index}
                                className="relative flex flex-col items-center w-1/3 md:w-auto"
                            >
                                {/* Step circle with connecting lines for mobile */}
                                <div className="flex items-center justify-center w-full md:w-auto">
                                    {/* Left connector for desktop */}
                                    {index > 0 && (
                                        <div className="hidden md:block absolute top-4 -left-1/2 w-full h-1.5 bg-gray-200">
                                            {isCompleted && (
                                                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
                                            )}
                                        </div>
                                    )}

                                    {/* Mobile progress line between steps */}
                                    {index > 0 && (
                                        <div className="md:hidden absolute top-4 left-0 w-full h-1.5 bg-gray-200 -z-10">
                                            {isCompleted && (
                                                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
                                            )}
                                        </div>
                                    )}

                                    {/* Step circle - Centered properly */}
                                    <div className="flex justify-center w-full md:w-auto">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 ${
                                                isCompleted
                                                    ? "bg-green-500 text-white shadow-lg"
                                                    : isActive
                                                    ? "bg-blue-600 text-white shadow-lg md:ring-4 ring-blue-100"
                                                    : "bg-white border-2 border-gray-300 text-gray-400"
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <FaCheckCircle className="w-4 h-4" />
                                            ) : (
                                                <span className="flex items-center justify-center w-full h-full">
                                                    {stepNumber}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right connector for mobile */}
                                    {index < steps.length - 1 && (
                                        <div className="md:hidden absolute top-4 right-0 w-full h-1.5 bg-gray-200 -z-10">
                                            {isCompleted &&
                                                stepNumber < steps.length && (
                                                    <div className="h-1.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
                                                )}
                                        </div>
                                    )}
                                </div>

                                {/* Step label */}
                                <div className="flex flex-col items-center mt-3 md:mt-3 w-full">
                                    <span
                                        className={`text-xs md:text-sm font-medium transition-colors duration-300 text-center ${
                                            isCompleted
                                                ? "text-green-700"
                                                : isActive
                                                ? "text-blue-700 font-semibold"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {step}
                                    </span>

                                    {/* Step status for mobile with better colors */}
                                    <span
                                        className={`md:hidden text-xs mt-1 font-medium ${
                                            isCompleted
                                                ? "text-green-600"
                                                : isActive
                                                ? "text-red-600"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {isCompleted
                                            ? "Complete"
                                            : isActive
                                            ? "Current"
                                            : "Pending"}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Mobile progress indicator text */}
                <div className="md:hidden text-center mt-8 text-sm font-medium">
                    <span className="text-gray-600">Step </span>
                    <span className="text-blue-600">{currentStep}</span>
                    <span className="text-gray-600"> of {steps.length}: </span>
                    <span className="text-blue-600">
                        {steps[currentStep - 1]}
                    </span>
                </div>
            </div>
        </div>
    );
}
