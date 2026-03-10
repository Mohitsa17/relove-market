import "../css/app.css";
import "./bootstrap";
import "flowbite";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";

const appName = "Relove Market";

import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
    onNeedRefresh() {
        if (confirm("New content available. Reload?")) {
            updateSW(true);
        }
    },
    onOfflineReady() {
        console.log("App ready to work offline!");
    },
});

createInertiaApp({
    title: () => `${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx")
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: "#2AAA8A",
    },
});
