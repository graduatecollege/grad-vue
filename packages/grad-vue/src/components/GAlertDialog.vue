<script setup lang="ts">
/**
 * Alert dialog for confirming or canceling actions.
 *
 * Clicking on the outside or pressing the escape key will close the dialog
 * and that counts as canceling.
 *
 * > [!IMPORTANT]
 * >
 * > The surrounding page **must** have an element with the id `modal-root`,
 * > this dialog will be teleported to it, so it can properly be over all
 * > other content. The `modal-root` should be somewhere near the end of the
 * > page structure.
 *
 * **Slot** `default` is used as the content of the alert, and also becomes
 * the ARIA description of the alert.
 */

import { onBeforeMount, onMounted, ref, useId } from "vue";
import { useOverlayStack } from "../compose/useOverlayStack.ts";
import { useOverlayFocus } from "../compose/useOverlayFocus.ts";
import { useOverlayEscape } from "../compose/useOverlayEscape.ts";
import GButton from "./GButton.vue";

interface Props {
    /**
     * Dialog label
     */
    label?: string;
    /**
     * Accept button text
     */
    buttonText?: string;
    /**
     * Accept button color
     */
    buttonColor?: "primary" | "secondary" | "danger";
}

const props = withDefaults(defineProps<Props>(), {
    label: "Confirmation",
    buttonText: "Continue",
    buttonColor: "primary",
});

const emit = defineEmits(["cancel", "confirm"]);

const dialog = ref<HTMLElement | null>(null);
const open = ref(true);

const id = useId();
const { pop, push, isTop, zIndex } = useOverlayStack(id, true, true);

const { deactivate, activate } = useOverlayFocus(dialog, isTop);

function close() {
    emit("cancel");
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
                :id="'alertdialog-' + id"
                class="g-alertdialog"
                role="alertdialog"
                aria-modal="true"
                :aria-labelledby="'alertdialog-label-' + id"
                :aria-describedby="'alertdialog-description-' + id"
                ref="dialog"
                :style="{ zIndex }"
            >
                <div class="g-alertdialog-inner">
                    <h2
                        :id="'alertdialog-label-' + id"
                        class="g-alertdialog-label"
                    >
                        {{ props.label }}
                    </h2>
                    <div
                        :id="'alertdialog-description-' + id"
                        class="g-alertdialog-content"
                    >
                        <slot />
                    </div>
                    <div class="g-alertdialog-actions">
                        <GButton outlined @click="emit('cancel')"
                            >Cancel</GButton
                        >
                        <GButton
                            :theme="props.buttonColor"
                            @click="emit('confirm')"
                            >{{ props.buttonText }}</GButton
                        >
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.g-alertdialog {
    position: fixed;
    left: 50vw;
    top: 50vh;
    transform: translate(-50%, -50%);
    max-width: 400px;
    min-width: 300px;
    height: auto;
    max-height: 90vh;
    overflow-y: auto;
    background: var(--g-surface-50);
    border-top: 8px solid var(--g-accent-500);
    padding: 2rem;
    box-shadow:
        0 0 2px rgba(0, 0, 0, 0.4),
        0 10px 20px rgba(0, 0, 0, 0.1);
}
.g-alertdialog-label {
    font-family: var(--il-font-heading);
    font-size: 2rem;
    margin-top: 0;
    color: var(--g-primary-500);
}
.g-alertdialog-content {
    margin-top: 1rem;
    font-size: 1.125rem;
    color: var(--g-surface-900);
}
.g-alertdialog-actions {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
