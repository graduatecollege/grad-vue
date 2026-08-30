export const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
    "[contenteditable='true']",
].join(",");

export function getFocusableElements(root: ParentNode | null | undefined) {
    if (!root) {
        return [];
    }

    return Array.from(root.querySelectorAll<HTMLElement>(focusableSelector));
}

export function getFocusedItemIndex(items: HTMLElement[]) {
    const activeElement = document.activeElement;

    if (!activeElement) {
        return -1;
    }

    return items.findIndex(
        (item) => item === activeElement || item.contains(activeElement),
    );
}
