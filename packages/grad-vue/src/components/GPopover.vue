<script lang="ts">
/**
 * Popover that appears next to or over a trigger element, staying visible
 * in the viewport as much as possible.
 *
 * **Slot** `trigger` is optional. When provided, it should contain an
 * interactive element for opening the popover and it is used for
 * `aria-labelledby`. The trigger is passed a prop `toggle` which is a function
 * that toggles the popover's open state.
 *
 * Without a trigger slot, open the popover programmatically via `show()` or
 * `toggle()` on the component instance / custom element.
 *
 * **Slot** `default` is the content of the popover.
 *
 * Example:
 *
 * ```vue-html
 * <GPopover>
 *     <template #trigger="{ toggle }">
 *         <GButton @click="toggle">
 *             Can Popovers have Popovers?
 *         </GButton>
 *     </template>
 *     <div>In theory, but I wouldn't recommend it.</div>
 * </GPopover>
 * ```
 */
export default {};
</script>

<script setup lang="ts">
import {
    computed,
    nextTick,
    onBeforeUnmount,
    ref,
    useId,
    useSlots,
    useTemplateRef,
    watch,
    toRef,
} from "vue";
import { useOverlayStack } from "../compose/useOverlayStack.ts";
import { useOverlayFocus } from "../compose/useOverlayFocus.ts";
import { useOverlayEscape } from "../compose/useOverlayEscape.ts";
import { calculatePopoverPosition } from "../compose/popoverPosition.ts";
import { useCustomElementAttrs } from "../compose/useCustomElementAttrs.ts";

type Props = {
    /**
     * Render without padding
     * @demo
     */
    minimal?: boolean;
    /**
     * v-model binding for the open state. Also works as a plain
     * prop/attribute in custom-element mode where `defineModel`
     * would revert local state.
     */
    modelValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    minimal: false,
    modelValue: false,
});
const emit = defineEmits(["show", "hide", "update:modelValue"]);

const open = ref(props.modelValue);
watch(toRef(props, "modelValue"), (v) => {
    open.value = v;
});
const slots = useSlots();
const hasTrigger = computed(() => !!slots.trigger);

const triggerRef = useTemplateRef<HTMLElement | null>("triggerRef");
const popoverRef = useTemplateRef<HTMLElement | null>("popoverRef");

// Disable Teleport inside custom elements: scoped named slots
// break CE slot distribution when content is teleported.
const { isCustomElement } = useCustomElementAttrs();
const disableTeleport = isCustomElement;

const id = useId();
const { push, pop, isTop, zIndex } = useOverlayStack(id, true);
const { activate, deactivate } = useOverlayFocus(popoverRef, isTop, true);
useOverlayEscape([popoverRef, triggerRef], isTop, open, hide, pop);

watch(open, (val) => {
    if (val) {
        nextTick(() => {
            nextTick(() => activate());
        });
        push();
        emit("show");
    } else {
        deactivate();
        pop();
        emit("hide");
    }
});

function show() {
    open.value = true;
    emit("update:modelValue", true);
}

function hide() {
    open.value = false;
    emit("update:modelValue", false);
}

function toggle() {
    open.value = !open.value;
    emit("update:modelValue", open.value);
}

const popoverPosition = ref<Record<string, any>>({ top: 0, left: 0 });
const arrowPosition = ref<Record<string, any>>({ left: "50%" });
const popoverAbove = ref(false);
const popoverOverlay = ref(false);
let resizeObserver: ResizeObserver | null = null;

function getAnchorElement() {
    if (triggerRef.value) {
        return triggerRef.value;
    }

    let host: HTMLElement | null = popoverRef.value?.parentElement ?? null;
    while (host && host.tagName.toLowerCase() !== "g-popover") {
        host = host.parentElement;
    }
    const previousSibling = host?.previousElementSibling;

    if (previousSibling instanceof HTMLElement) {
        return previousSibling;
    }

    return null;
}

function updatePopoverPosition() {
    if (!popoverRef.value) {
        return;
    }

    // Use offsetWidth/offsetHeight for popover dimensions to avoid getting
    // scaled values during the CSS scale() enter transition.
    const popoverRect = new DOMRect(0, 0, popoverRef.value.offsetWidth, popoverRef.value.offsetHeight);
    const viewportRect = new DOMRect(0, 0, window.innerWidth, window.innerHeight);

    const anchorEl = getAnchorElement();

    if (!anchorEl) {
        popoverPosition.value = {
            top: Math.max((viewportRect.height - popoverRect.height) / 2, 8),
            left: Math.max((viewportRect.width - popoverRect.width) / 2, 8),
        };
        popoverOverlay.value = false;
        popoverAbove.value = false;
        arrowPosition.value = { left: "50%" };
        return;
    }

    const triggerRect = anchorEl.getBoundingClientRect();

    const { top, left, xOffset, placedAbove, overlay } =
        calculatePopoverPosition(triggerRect, popoverRect, viewportRect, {
            gap: props.minimal ? 0 : 8,
        });
    popoverPosition.value = { top, left };
    arrowPosition.value = {
        left: `${popoverRect.width / 2 - xOffset}px`,
        top: placedAbove ? "auto" : undefined,
        bottom: placedAbove ? "-8px" : undefined,
    };
    popoverAbove.value = placedAbove;
    popoverOverlay.value = overlay;
}

watch(open, (val) => {
    if (val) {
        nextTick(() => {
            updatePopoverPosition();
            window.addEventListener("resize", updatePopoverPosition);
            window.addEventListener("scroll", updatePopoverPosition, { capture: true });
            if (popoverRef.value) {
                if (resizeObserver) {
                    resizeObserver.disconnect();
                }
                resizeObserver = new ResizeObserver(() =>
                    updatePopoverPosition(),
                );
                resizeObserver.observe(popoverRef.value);
            }
        });
    } else {
        window.removeEventListener("resize", updatePopoverPosition);
        window.removeEventListener("scroll", updatePopoverPosition, { capture: true });
        if (resizeObserver) {
            resizeObserver.disconnect();
        }
    }
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", updatePopoverPosition);
    window.removeEventListener("scroll", updatePopoverPosition, { capture: true });
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
});
defineExpose({
    show,
    hide,
    toggle
})

</script>

<template>
    <div class="g-popover-wrap">
        <div v-if="hasTrigger" ref="triggerRef" class="g-popover-trigger" :id="`${id}-trigger`">
            <slot name="trigger" :toggle="toggle"></slot>
        </div>
        <Teleport to="#modal-root" :disabled="disableTeleport">
            <transition name="g-popover-expand" appear>
                <div
                    v-if="isCustomElement || open" v-show="open"
                    ref="popoverRef"
                    :class="{
                        'g-popover': true,
                        'g-popover-above': popoverAbove,
                        'g-popover-below': !popoverAbove,
                        'g-popover-minimal': minimal,
                    }"
                    role="dialog"
                    aria-modal="true"
                    :aria-labelledby="hasTrigger ? `${id}-trigger` : undefined"
                    :aria-label="hasTrigger ? undefined : 'Popover'"
                    :style="{
                        top: popoverPosition.top + 'px',
                        left: popoverPosition.left + 'px',
                        zIndex,
                    }"
                >
                    <div
                        v-if="!popoverOverlay && !minimal"
                        class="g-popover-arrow"
                        :class="{ 'g-popover-arrow-above': popoverAbove }"
                        :style="arrowPosition"
                        aria-hidden="true"
                    ></div>
                    <slot></slot>
                    <button
                        v-if="!minimal"
                        class="g-popover-close"
                        type="button"
                        aria-label="Close popover"
                        @click="hide"
                    >
                        <svg
                            class="g-popover-close-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 51.26 51.26"
                            aria-hidden="true"
                        >
                            <path
                                fill="currentColor"
                                d="m37.84 32.94-7.63-7.63 7.63-7.63a3.24 3.24 0 0 0-4.58-4.58l-7.63 7.63L18 13.1a3.24 3.24 0 0 0-4.58 4.58L21 25.31l-7.62 7.63A3.24 3.24 0 1 0 18 37.52l7.63-7.63 7.63 7.63a3.24 3.24 0 0 0 4.58-4.58Z"
                            />
                        </svg>
                    </button>
                </div>
            </transition>
        </Teleport>
    </div>
</template>

<style>
.g-popover {
    h2 {
        font-size: 1.25rem;
        margin: 0 0 0.75rem 0;
    }
    p {
        margin: 0 0 0.5rem 0;
    }
}
.g-popover-trigger {
    display: inline-block;
}
</style>

<style scoped>
.g-popover {
    position: fixed;
    z-index: 1000;
    background: var(--g-surface-0);
    border: 1px solid var(--g-surface-200);
    color: var(--g-surface-900);
    font-weight: normal;
    font-size: 1rem;
    border-radius: 4px;
    box-shadow: var(--il-shadow);
    padding: 1.5rem 1rem 1rem;
    min-width: 200px;
    max-width: 500px;
    top: 0;
    left: 0;
    text-align: left;
}
.g-popover.g-popover-minimal {
    padding: 0;
    min-width: 0;
}

.g-popover-arrow {
    box-sizing: border-box;
    position: absolute;
    top: -8px;
    width: 20px;
    height: 8px;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
    z-index: 1;
}

.g-popover-arrow::after {
    box-sizing: border-box;
    content: "";
    display: block;
    margin: 0 auto;
    width: 16px;
    height: 8px;
    background: transparent;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid white;
    /* Add border for the arrow */
    position: relative;
    z-index: 2;
}

.g-popover-arrow::before {
    box-sizing: border-box;
    content: "";
    display: block;
    position: absolute;
    top: -1px;
    left: 1px;
    width: 18px;
    height: 9px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid var(--g-surface-200, #ccc);
    z-index: 1;
}

.g-popover-arrow-above {
    transform: translateX(-50%) rotate(180deg);
}
.g-popover-close {
    position: absolute;
    display: block;
    top: 1px;
    right: 1px;
    border: none;
    padding: 0.25rem 0.25rem;
    border-radius: 7px;
    background: transparent;
    cursor: pointer;

    &:hover {
        background: var(--g-primary-500);
        color: var(--g-surface-0);
    }
    &:focus-visible {
        background: var(--ilw-color--focus--background);
        color: var(--ilw-color--focus--text);
        outline-color: var(--g-primary-500);
    }

    .g-popover-close-icon {
        width: 1.25rem;
        height: 1.25rem;
        display: block;
    }
}

.g-popover-expand-enter-active,
.g-popover-expand-leave-active {
    transition:
        opacity 0.18s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}

.g-popover-expand-enter-from,
.g-popover-expand-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

.g-popover-expand-enter-to,
.g-popover-expand-leave-from {
    opacity: 1;
    transform: scale(1);
}

@media (prefers-reduced-motion: reduce) {
    .g-popover-expand-enter-active,
    .g-popover-expand-leave-active {
        transition: none !important;
    }
}
</style>
