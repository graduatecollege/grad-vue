import type { Directive, DirectiveBinding } from "vue";
import { ref, watchEffect } from "vue";
import { calculatePopoverPosition } from "../compose/popoverPosition.ts";
import { getTopZIndex } from "../compose/useOverlayStack.ts";

let tooltipIdCounter = 1;

/**
 * Create the tooltip HTML element.
 * @param text Text content.
 * @param id ID for aria-describedby to point to this tooltip.
 */
function createTooltipEl(text: string, id: string) {
    const tooltip = document.createElement("div");
    tooltip.className = "v-gtooltip";
    tooltip.textContent = text;
    tooltip.setAttribute("role", "tooltip");
    tooltip.setAttribute("id", id);
    return tooltip;
}

/**
 * Show the tooltip at the correct position based on the element's position.
 *
 * @param el The interactive element that the tooltip is attached to.
 * @param tooltip The tooltip HTML element.
 */
function showTooltip(el: HTMLElement, tooltip: HTMLElement) {
    const anchorRect = el.getBoundingClientRect();
    const popoverRect = tooltip.getBoundingClientRect();
    // Use (0, 0) as origin since getBoundingClientRect() and position: fixed
    // both use viewport-relative coordinates.
    const viewportRect = new DOMRect(0, 0, window.innerWidth, window.innerHeight);
    const { top, left, placedAbove } = calculatePopoverPosition(anchorRect, popoverRect, viewportRect, {
        gap: 8,
        margin: 8,
        preferAbove: true,
    });
    // Calculate arrow position as a percentage
    const anchorCenter = anchorRect.left + anchorRect.width / 2;
    const tooltipLeft = left;
    const arrowX = ((anchorCenter - tooltipLeft) / popoverRect.width) * 100;
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

/**
 * The opacity is set to 0 to fade the tooltip out.
 * @param tooltip
 */
function hideTooltip(tooltip: HTMLElement) {
    tooltip.style.opacity = "0";
}

export type VGtooltipDirective = Directive<HTMLElement, string>;

const VGtooltip: VGtooltipDirective = {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
        const tooltip = ref<HTMLElement | null>(null);
        const isHovered = ref(false);
        const isFocused = ref(false);
        const tooltipText = ref(binding.value);
        let resizeObserver: ResizeObserver | null = null;
        let scrollListenerActive = false;
        // Generate unique id for tooltip
        let tooltipId: string;
        if (el.getAttribute("aria-describedby")) {
            tooltipId = el.getAttribute("aria-describedby")!;
        } else {
            tooltipId = `v-gtooltip-${++tooltipIdCounter}`;
            el.setAttribute("aria-describedby", tooltipId);
        }

        const ensureTooltip = () => {
            if (!tooltip.value) {
                tooltip.value = createTooltipEl(tooltipText.value, tooltipId);
                // Append to #modal-root (with document.body fallback) so the tooltip
                // shares the same DOM container as GModal and GPopover. This ensures
                // consistent z-index stacking context and avoids CSS transform issues
                // when the trigger is inside a transformed ancestor (e.g., GModal uses
                // transform: translate(-50%, -50%) for centering).
                const modalRoot = document.getElementById("modal-root");
                (modalRoot ?? document.body).appendChild(tooltip.value);
                resizeObserver = new ResizeObserver(() => {
                    if (tooltip.value && (isHovered.value || isFocused.value)) {
                        showTooltip(el, tooltip.value);
                    }
                });
                resizeObserver.observe(tooltip.value);
            }
        };

        watchEffect(() => {
            if (tooltip.value) {
                tooltip.value.textContent = tooltipText.value;
            }
        });

        // Watch for changes in hover and focus states,
        // and show/hide the tooltip accordingly
        const onScroll = () => {
            if (tooltip.value && (isHovered.value || isFocused.value)) {
                showTooltip(el, tooltip.value);
            }
        };

        watchEffect(() => {
            if (isHovered.value || isFocused.value) {
                ensureTooltip();
                if (tooltip.value) {
                    showTooltip(el, tooltip.value);
                }
                if (!scrollListenerActive) {
                    window.addEventListener("scroll", onScroll, { capture: true });
                    scrollListenerActive = true;
                }
            } else {
                if (scrollListenerActive) {
                    window.removeEventListener("scroll", onScroll, { capture: true });
                    scrollListenerActive = false;
                }
                if (tooltip.value) {
                    hideTooltip(tooltip.value);

                    setTimeout(() => {
                        // After the fade out, emit an event in case the user needs
                        // to perform any cleanup
                        el.dispatchEvent(new CustomEvent("tooltip-hide"));
                    }, 150);
                }
            }
        });

        const onMouseEnter = () => {
            isHovered.value = true;
        };
        const onMouseLeave = () => {
            isHovered.value = false;
        };
        const onFocus = () => {
            isFocused.value = true;
        };
        const onBlur = () => {
            isFocused.value = false;
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" || e.key === "Esc") {
                isHovered.value = false;
                isFocused.value = false;
            }
        };

        el.addEventListener("mouseenter", onMouseEnter);
        el.addEventListener("mouseleave", onMouseLeave);
        el.addEventListener("focus", onFocus);
        el.addEventListener("blur", onBlur);
        el.addEventListener("keydown", onKeyDown);

        ensureTooltip();

        // Since this is a directive, we need to store the variables on the element
        (el as any)._v_gtooltip = {
            onMouseEnter,
            onMouseLeave,
            onFocus,
            onBlur,
            onKeyDown,
            onScroll,
            tooltip,
            tooltipText,
            isHovered,
            isFocused,
            resizeObserver,
            tooltipId,
        };
    },
    updated(el: HTMLElement, binding: DirectiveBinding) {
        const data = (el as any)._v_gtooltip;
        if (data && data.tooltipText) {
            data.tooltipText.value = binding.value;
        }
    },
    unmounted(el: HTMLElement) {
        const data = (el as any)._v_gtooltip;
        if (data && data.tooltip && data.tooltip.value) {
            if (data.resizeObserver) {
                data.resizeObserver.disconnect();
            }
            data.tooltip.value.remove();
            data.tooltip.value = null;
        }
        if (data && data.onScroll) {
            window.removeEventListener("scroll", data.onScroll, { capture: true });
        }
        el.removeEventListener("mouseenter", data.onMouseEnter);
        el.removeEventListener("mouseleave", data.onMouseLeave);
        el.removeEventListener("focus", data.onFocus);
        el.removeEventListener("blur", data.onBlur);
        el.removeEventListener("keydown", data.onKeyDown);
        el.removeAttribute("aria-describedby");
    },
};

export default VGtooltip;
