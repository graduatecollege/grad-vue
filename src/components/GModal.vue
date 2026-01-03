<script setup lang="ts">
/**
 * Generic modal component.
 *
 * Clicking on the outside or pressing the escape key will close the modal.
 *
 * > [!IMPORTANT]
 * >
 * > The surrounding page **must** have an element with the id `modal-root`,
 * > this modal will be teleported to it, so it can properly be over all
 * > other content. The `modal-root` should be somewhere near the end of the
 * > page structure.
 *
 * **Props**:
 *
 * - `label`: Modal accessible label.
 * - `describedby`: Element ID to pass to aria-describedby. Use this if there's
 *   specific important text to describe the modal.
 * - `hiddenLabel`: Hide label visually. It will still be used as `aria-label`.
 * - `size`: Modal size
 *
 * **Slot** `default` is used as the content of the modal.
 *
 * When the modal is opened, focus is placed on the H2 label element. This
 * can be overridden by providing a `popover-focus` attribute on an element
 * inside the modal.
 *
 * Adding a dimming overlay behind modals can be done by placing `GOverlay`
 * at the end of the page structure.
 *
 * > [!WARNING]
 * > There are some shenanigans in the modal and overlay implementation in order
 * > to support Nuxt without including it as a dependency. Specifically, the refs
 * > to store the state of the overlay stack is added to `window._g_overlay_stack_state`
 * > when `document` is defined. That makes it only load in the client.
 */

import { onBeforeMount, onMounted, ref, useTemplateRef } from "vue";
import { useOverlayStack } from "../compose/useOverlayStack.ts";
import { useOverlayFocus } from "../compose/useOverlayFocus.ts";
import { useOverlayEscape } from "../compose/useOverlayEscape.ts";

interface Props {
    /**
     * Modal label
     */
    label: string; // Demo: Basic Modal
    /**
     * ID for aria-describedby
     */
    describedby?: string;
    /**
     * Hide label
     */
    hiddenLabel?: boolean;
    /**
     * Modal size
     */
    size?: "small" | "medium" | "large" | "full";
}

const props = withDefaults(defineProps<Props>(), {
    describedby: undefined,
    hiddenLabel: false,
    size: "medium",
});

const emit = defineEmits(["close"]);

const dialog = useTemplateRef("dialog");
const open = ref(true);

const { id, pop, push, isTop, zIndex } = useOverlayStack(true, true);

const { deactivate, activate } = useOverlayFocus(dialog, isTop);

function close() {
    emit("close");
}

useOverlayEscape([dialog], isTop, open, close, pop);

onMounted(() => {
    push();
    activate();
});

onBeforeMount(() => {
    pop();
    deactivate();
});
</script>

<template>
    <Teleport to="#modal-root">
        <Transition name="g-fade" appear>
            <div
                :id="'modal-' + id"
                class="g-modal"
                :class="'g-modal--' + size"
                role="dialog"
                aria-modal="true"
                v-bind="{
                    'aria-labelledby': !hiddenLabel
                        ? 'modal-label-' + id
                        : undefined,
                    'aria-label': hiddenLabel ? label : undefined,
                    'aria-describedby': describedby ? describedby : undefined,
                }"
                ref="dialog"
                :style="{ zIndex }"
            >
                <div class="g-modal-inner">
                    <div class="g-modal-header">
                        <h2
                            v-if="!hiddenLabel"
                            :id="'modal-label-' + id"
                            class="g-modal-label"
                            tabindex="-1"
                        >
                            {{ label }}
                        </h2>
                        <button
                            class="g-modal-close"
                            @click="close"
                            aria-label="Close"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                aria-hidden="true"
                            >
                                <path
                                    fill="currentColor"
                                    d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                                />
                            </svg>
                        </button>
                    </div>
                    <div :id="'modal-description-' + id" class="g-modal-content">
                        <slot />
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.g-modal {
    position: fixed;
    left: 50vw;
    top: 50vh;
    transform: translate(-50%, -50%);
    height: auto;
    max-height: 90vh;
    overflow-y: auto;
    background: var(--g-surface-50);
    border-top: 8px solid var(--g-accent-500);
    padding: 2rem;
    box-sizing: border-box;
    box-shadow:
        0 0 2px rgba(0, 0, 0, 0.4),
        0 10px 20px rgba(0, 0, 0, 0.1);
}
.g-modal--small {
    width: 400px;
    max-width: 90vw;
}
.g-modal--medium {
    width: 600px;
    max-width: 90vw;
}
.g-modal--large {
    width: 900px;
    max-width: 90vw;
}
.g-modal--full {
    width: 100vw;
    height: 100vh;
    max-width: none;
    max-height: none;
    border-top: none;
}
.g-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}
.g-modal-label {
    font-family: var(--il-font-heading);
    font-size: 2rem;
    margin-top: 0;
    color: var(--g-primary-500);
}
.g-modal-close {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    margin: -1.25rem -1rem -1rem 1rem;
    color: var(--g-surface-600);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    &:hover {
        background: var(--g-primary-500);
        color: var(--g-primary-text);
    }
    &:focus {
        background: var(--ilw-color--focus--background);
        color: var(--ilw-color--focus--text);
    }
}

</style>
