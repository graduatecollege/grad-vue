import type { Directive, DirectiveBinding } from "vue";
import { ref, watchEffect } from "vue";
import {
    appendTooltipEl,
    createTooltipEl,
    hideTooltip,
    resolveTooltipId,
    showTooltip,
} from "../compose/tooltipDom.ts";

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
        const tooltipId = resolveTooltipId(el);

        const ensureTooltip = () => {
            if (!tooltip.value) {
                tooltip.value = createTooltipEl(tooltipText.value, tooltipId);
                // Append to #modal-root (with document.body fallback) so the tooltip
                // shares the same DOM container as GModal and GPopover. This ensures
                // consistent z-index stacking context and avoids CSS transform issues
                // when the trigger is inside a transformed ancestor (e.g., GModal uses
                // transform: translate(-50%, -50%) for centering).
                appendTooltipEl(tooltip.value);
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
