<script setup lang="ts">
import { useTemplateRef } from "vue";

type Props = {
    id: string;
    controlsId?: string;
    expanded: boolean;
    label: string;
    labelVisible: boolean;
    popover?: boolean;
    collapsible?: boolean;
};

defineProps<Props>();

const buttonRef = useTemplateRef<HTMLButtonElement | null>("buttonRef");

function focus() {
    buttonRef.value?.focus();
}

defineExpose({ focus });
</script>

<template>
    <button
        :id="id"
        ref="buttonRef"
        class="g-hamburger-button"
        :class="{
            'g-hamburger-button--open': expanded,
            'g-hamburger-button--popover': popover,
            'g-hamburger-button--collapsible': collapsible,
        }"
        :aria-controls="controlsId"
        :aria-expanded="expanded"
        :aria-haspopup="popover ? 'dialog' : undefined"
        :aria-label="labelVisible ? undefined : label"
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 51.26 51.26"
            role="none"
        >
            <g fill="currentColor">
                <path
                    d="M11.6 16.52h28.06a3.24 3.24 0 1 0 0-6.48H11.6a3.24 3.24 0 0 0 0 6.48ZM39.66 22.07H11.6a3.24 3.24 0 0 0 0 6.48h28.06a3.24 3.24 0 1 0 0-6.48ZM39.66 34.1H11.6a3.24 3.24 0 0 0 0 6.48h28.06a3.24 3.24 0 1 0 0-6.48Z"
                />
            </g>
        </svg>
        <span v-if="labelVisible" class="g-hamburger-label">{{ label }}</span>
    </button>
</template>
