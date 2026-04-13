<script lang="ts">
/**
 * Tooltip for concise contextual help text.
 *
 * The `trigger` slot is optional. Without a trigger slot, the tooltip anchors
 * to the previous sibling element and can still be controlled via exposed
 * methods.
 */
export default {};
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useSlots, useTemplateRef, watch } from "vue";
import {
    appendTooltipEl,
    createTooltipEl,
    hideTooltip,
    nextTooltipId,
    resolveTooltipId,
    showTooltip,
} from "../compose/tooltipDom.ts";

type Props = {
    /**
     * Tooltip text
     * @demo
     */
    text: string;
}

const props = defineProps<Props>();
const emit = defineEmits(["tooltip-hide"]);

const slots = useSlots();
const hasTrigger = computed(() => !!slots.trigger);

const hostRef = useTemplateRef<HTMLElement | null>("hostRef");
const triggerRef = useTemplateRef<HTMLElement | null>("triggerRef");
const tooltipEl = ref<HTMLElement | null>(null);
const isHovered = ref(false);
const isFocused = ref(false);

let resizeObserver: ResizeObserver | null = null;
let scrollListenerActive = false;
let hideTimer: number | null = null;
let tooltipId: string | null = null;
let anchorEl: HTMLElement | null = null;

function getAnchorElement() {
    if (hasTrigger.value && triggerRef.value) {
        const triggerChild = triggerRef.value.firstElementChild;
        if (triggerChild instanceof HTMLElement) {
            return triggerChild;
        }
        return triggerRef.value;
    }

    const host = hostRef.value;
    const previousSibling = host?.previousElementSibling ?? host?.parentElement?.previousElementSibling;

    if (previousSibling instanceof HTMLElement) {
        return previousSibling;
    }

    return null;
}

function ensureTooltip() {
    if (!anchorEl) {
        return;
    }

    if (!tooltipId) {
        tooltipId = hasTrigger.value ? nextTooltipId("g-tooltip") : resolveTooltipId(anchorEl, "g-tooltip");
        if (hasTrigger.value) {
            anchorEl.setAttribute("aria-describedby", tooltipId);
        }
    }

    if (!tooltipEl.value) {
        tooltipEl.value = createTooltipEl(props.text, tooltipId);
        appendTooltipEl(tooltipEl.value);
        resizeObserver = new ResizeObserver(() => {
            if (tooltipEl.value && (isHovered.value || isFocused.value) && anchorEl) {
                showTooltip(anchorEl, tooltipEl.value);
            }
        });
        resizeObserver.observe(tooltipEl.value);
    }
}

function onScroll() {
    if (tooltipEl.value && (isHovered.value || isFocused.value) && anchorEl) {
        showTooltip(anchorEl, tooltipEl.value);
    }
}

function show() {
    isHovered.value = true;
}

function hide() {
    isHovered.value = false;
    isFocused.value = false;
}

function toggle() {
    if (isHovered.value || isFocused.value) {
        hide();
        return;
    }
    show();
}

function attachAnchorEvents(nextAnchor: HTMLElement | null) {
    if (anchorEl === nextAnchor) {
        return;
    }

    detachAnchorEvents();
    anchorEl = nextAnchor;

    if (!anchorEl) {
        return;
    }

    anchorEl.addEventListener("mouseenter", onMouseEnter);
    anchorEl.addEventListener("mouseleave", onMouseLeave);
    anchorEl.addEventListener("focusin", onFocus);
    anchorEl.addEventListener("focusout", onBlur);
    anchorEl.addEventListener("keydown", onKeyDown);
}

function detachAnchorEvents() {
    if (!anchorEl) {
        return;
    }

    anchorEl.removeEventListener("mouseenter", onMouseEnter);
    anchorEl.removeEventListener("mouseleave", onMouseLeave);
    anchorEl.removeEventListener("focusin", onFocus);
    anchorEl.removeEventListener("focusout", onBlur);
    anchorEl.removeEventListener("keydown", onKeyDown);
    anchorEl = null;
}

function onMouseEnter() {
    isHovered.value = true;
}

function onMouseLeave() {
    isHovered.value = false;
}

function onFocus() {
    isFocused.value = true;
}

function onBlur() {
    isFocused.value = false;
}

function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape" || e.key === "Esc") {
        isHovered.value = false;
        isFocused.value = false;
    }
}

watch(
    () => [hostRef.value, triggerRef.value, hasTrigger.value],
    () => {
        attachAnchorEvents(getAnchorElement());
        ensureTooltip();
    },
    { immediate: true },
);

watch(
    () => props.text,
    (value) => {
        if (tooltipEl.value) {
            tooltipEl.value.textContent = value;
        }
    },
);

watch(
    () => isHovered.value || isFocused.value,
    (active) => {
        if (active) {
            ensureTooltip();
            if (tooltipEl.value && anchorEl) {
                showTooltip(anchorEl, tooltipEl.value);
            }
            if (!scrollListenerActive) {
                window.addEventListener("scroll", onScroll, { capture: true });
                scrollListenerActive = true;
            }
            return;
        }

        if (scrollListenerActive) {
            window.removeEventListener("scroll", onScroll, { capture: true });
            scrollListenerActive = false;
        }
        if (tooltipEl.value) {
            hideTooltip(tooltipEl.value);
            if (hideTimer) {
                clearTimeout(hideTimer);
            }
            hideTimer = window.setTimeout(() => {
                emit("tooltip-hide");
            }, 150);
        }
    },
);

onBeforeUnmount(() => {
    if (scrollListenerActive) {
        window.removeEventListener("scroll", onScroll, { capture: true });
    }
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
    if (tooltipEl.value) {
        tooltipEl.value.remove();
        tooltipEl.value = null;
    }
    if (hideTimer) {
        clearTimeout(hideTimer);
    }
    if (hasTrigger.value && anchorEl) {
        anchorEl.removeAttribute("aria-describedby");
    }
    detachAnchorEvents();
});

defineExpose({
    show,
    hide,
    toggle,
});
</script>

<template>
    <div ref="hostRef" class="g-tooltip-host">
        <div v-if="hasTrigger" ref="triggerRef" class="g-tooltip-trigger">
            <slot name="trigger"></slot>
        </div>
    </div>
</template>

<style>
g-tooltip {
    display: contents;
}
</style>

<style scoped>
.g-tooltip-host {
    display: contents;
}

.g-tooltip-trigger {
    display: inline-block;
}
</style>
