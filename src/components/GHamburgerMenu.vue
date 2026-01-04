<script setup lang="ts">
import { useSidebar } from "../compose/useSidebar.ts";
import { inject, useId } from "vue";

interface Props {
    /**
     * Accessible label
     */
    label?: string;
}

const props = withDefaults(defineProps<Props>(), {
    label: "Main Navigation",
});

const sidebar = inject<ReturnType<typeof useSidebar>>("sidebar")!;

const emit = defineEmits<{
    toggle: [];
}>();

function toggle() {
    emit("toggle");
    sidebar?.toggle();
}

// Close menu on escape
function handleEscapeKey(event: KeyboardEvent) {
    if (event.key === "Escape") {
        if (sidebar?.open?.value) {
            sidebar.open.value = false;
        }
    }
}

const fallbackId = useId();
</script>
<template>
    <button
        :id="`${sidebar?.id ?? fallbackId}-hamburger`"
        class="g-hamburger-button"
        @click="toggle"
        @keydown="handleEscapeKey"
        :aria-expanded="sidebar.open?.value ? 'true' : 'false'"
        :aria-label="label"
        :aria-controls="sidebar ? `${sidebar.id}-sidebar` : undefined"
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51.26 51.26">
            <g fill="currentColor">
                <path
                    d="M11.6 16.52h28.06a3.24 3.24 0 1 0 0-6.48H11.6a3.24 3.24 0 0 0 0 6.48ZM39.66 22.07H11.6a3.24 3.24 0 0 0 0 6.48h28.06a3.24 3.24 0 1 0 0-6.48ZM39.66 34.1H11.6a3.24 3.24 0 0 0 0 6.48h28.06a3.24 3.24 0 1 0 0-6.48Z"
                />
            </g>
        </svg>
    </button>
</template>

<style>
.g-hamburger-button {
    svg {
        width: 1.6rem;
    }
}
</style>

<style scoped>
.g-hamburger-button {
    width: 34px;
    height: 34px;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    border: 2px solid var(--g-primary-500);
    background: var(--g-primary-500);
    color: var(--g-primary-text);
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background: var(--g-primary-text);
        color: var(--g-primary-500);
    }
    &:active {
        background: var(--g-accent-500);
        color: var(--g-primary-text);
    }
    &:focus-visible {
        color: var(--ilw-color--focus--text);
        background: var(--ilw-color--focus--background);
    }
}
</style>