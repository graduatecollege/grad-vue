// Setup DOM environment
if (typeof document !== "undefined") {
    // Create modal root for components that use Teleport
    const modalRoot = document.createElement("div");
    modalRoot.id = "modal-root";
    document.body.appendChild(modalRoot);
}
