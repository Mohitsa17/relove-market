import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faClock,
    faTruckFast,
    faCircleCheck,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

export function OrderStatusBadge({ status }) {
    const map = {
        Pending: { color: "yellow", label: "Pending", icon: faClock },
        Shipped: { color: "blue", label: "Shipped", icon: faTruckFast },
        Delivered: { color: "green", label: "Delivered", icon: faCircleCheck },
        Completed: { color: "green", label: "Completed", icon: faCircleCheck }, // Added Completed
        Cancelled: {
            color: "red",
            label: "Cancelled",
            icon: faTriangleExclamation,
        },
    };

    const s = map[status] || map.Pending;

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium
                ${s.color === "yellow" && "bg-yellow-100 text-yellow-700"}
                ${s.color === "blue" && "bg-blue-100 text-blue-700"}
                ${s.color === "green" && "bg-green-100 text-green-700"}
                ${s.color === "red" && "bg-red-100 text-red-700"}
            `}
        >
            <FontAwesomeIcon icon={s.icon} />
            {s.label}
        </span>
    );
}
