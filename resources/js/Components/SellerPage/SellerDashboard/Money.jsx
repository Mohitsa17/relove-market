export function Money({ children }) {
    return (
        <span className="font-semibold text-gray-800">
            RM {Number(children).toFixed(2)}
        </span>
    );
}
