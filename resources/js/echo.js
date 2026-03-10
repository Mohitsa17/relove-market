import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

export default new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY, // Laravel passes it via Vite
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? "mt1",
    forceTLS: true,
});
