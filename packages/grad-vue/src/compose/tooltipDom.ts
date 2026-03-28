import { calculatePopoverPosition } from "./popoverPosition.ts";
import { getTopZIndex } from "./useOverlayStack.ts";

let tooltipIdCounter = 1;

export function nextTooltipId(prefix = "v-gtooltip") {
    return `${prefix}-${++tooltipIdCounter}`;
}

export function resolveTooltipId(el: HTMLElement, prefix = "v-gtooltip") {
    const existing = el.getAttribute("aria-describedby");
    if (existing) {
        return existing;
    }
    const id = nextTooltipId(prefix);
    el.setAttribute("aria-describedby", id);
    return id;
}

export function createTooltipEl(text: string, id: string) {
    const tooltip = document.createElement("div");
    tooltip.className = "v-gtooltip";
    tooltip.textContent = text;
    tooltip.setAttribute("role", "tooltip");
    tooltip.setAttribute("id", id);
    return tooltip;
}

export function appendTooltipEl(tooltip: HTMLElement) {
    const modalRoot = document.getElementById("modal-root");
    (modalRoot ?? document.body).appendChild(tooltip);
}

export function showTooltip(anchor: HTMLElement, tooltip: HTMLElement) {
    const anchorRect = anchor.getBoundingClientRect();
    const popoverRect = tooltip.getBoundingClientRect();
    const viewportRect = new DOMRect(0, 0, window.innerWidth, window.innerHeight);
    const { top, left, placedAbove } = calculatePopoverPosition(anchorRect, popoverRect, viewportRect, {
        gap: 8,
        margin: 8,
        preferAbove: true,
    });
    const anchorCenter = anchorRect.left + anchorRect.width / 2;
    const arrowX = ((anchorCenter - left) / popoverRect.width) * 100;
    tooltip.style.setProperty("--v-gtooltip-arrow-x", `${arrowX}%`);
    tooltip.classList.remove("v-gtooltip-bottom");
    if (!placedAbove) {
        tooltip.classList.add("v-gtooltip-bottom");
    }
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.zIndex = `${getTopZIndex()}`;
    tooltip.style.opacity = "1";
}

export function hideTooltip(tooltip: HTMLElement) {
    tooltip.style.opacity = "0";
}
