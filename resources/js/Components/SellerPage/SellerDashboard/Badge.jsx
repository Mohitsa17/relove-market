export function Badge({ color, children }) {
    const styles = {
        blue: "bg-blue-100 text-blue-700",
        green: "bg-green-100 text-green-700",
        yellow: "bg-yellow-100 text-yellow-700",
        red: "bg-red-100 text-red-700",
        gray: "bg-gray-100 text-gray-700",
        indigo: "bg-indigo-100 text-indigo-700",
        orange: "bg-orange-100 text-orange-700",
    }[color || "gray"];

    return (
        <span className={`px-2 py-0.5 text-xs font-medium rounded ${styles}`}>
            {children}
        </span>
    );
}
