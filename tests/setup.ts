import { setup } from "@sa11y/vitest";

// Register the accessibility matcher
setup();

// Setup DOM environment
if (typeof document !== "undefined") {
    // Create modal root for components that use Teleport
    const modalRoot = document.createElement("div");
    modalRoot.id = "modal-root";
    document.body.appendChild(modalRoot);
}

// Suppress the harmless Vue compiler warning about decodeEntities in browser mode
// This warning is misleading because we ARE running in a browser via Playwright
const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
    const message = args[0];
    if (
        typeof message === "string" &&
        message.includes("decodeEntities option is passed but will be ignored")
    ) {
        // Suppress this specific warning
        return;
    }
    originalConsoleWarn.apply(console, args);
};
