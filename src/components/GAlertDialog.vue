<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from "vue";
import { useOverlayStack } from "../compose/useOverlayStack.ts";
import { useOverlayFocus } from "../compose/useOverlayFocus.ts";
import { useOverlayEscape } from "../compose/useOverlayEscape.ts";
import GButton from "./GButton.vue";

interface Props {
    label?: string;
    buttonText?: string;
    buttonColor?: "primary" | "secondary" | "danger";
}

const props = withDefaults(defineProps<Props>(), {
    label: "Confirmation",
    buttonText: "Continue",
    buttonColor: "primary"
});

const emit = defineEmits(["cancel", "confirm"]);

const dialog = ref<HTMLElement | null>(null);
const open = ref(true);

const { id, pop, push, isTop } = useOverlayStack(true);

const { deactivate, activate } = useOverlayFocus(dialog, isTop);

function close() {
    open.value = false;
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
        <div
            :id="'alertdialog-' + id"
            class="g-alertdialog"
            role="alertdialog"
            aria-modal="true"
            :aria-labelledby="'alertdialog-label-' + id"
            :aria-describedby="'alertdialog-description-' + id"
            ref="dialog"
        >
            <div class="g-alertdialog-inner">
                <h2 :id="'alertdialog-label-' + id" class="g-alertdialog-label">
                    {{ props.label }}
                </h2>
                <div :id="'alertdialog-description-' + id" class="g-alertdialog-content">
                    <slot />
                </div>
                <div class="g-alertdialog-actions">
                    <GButton outlined @click="emit('cancel')">Cancel</GButton>
                    <GButton :theme="props.buttonColor" @click="emit('confirm')">{{ props.buttonText }}</GButton>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.g-alertdialog {
    position: absolute;
    left: 50vw;
    top: 50vh;
    transform: translate(-50%, -50%);
    width: 400px;
    height: auto;
    background: var(--g-surface-50);
    border-top: 8px solid var(--g-accent-500);
    padding: 2rem;
}
.g-alertdialog-label {
    font-family: var(--il-font-heading);
    font-size: 2rem;
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
</style>
