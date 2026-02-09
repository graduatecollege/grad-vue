<template>
    <Teleport to="body" :disabled="!visible || !errorMessage">
        <div
            v-if="visible && errorMessage"
            ref="overlayRef"
            class="g-table-error-overlay"
            role="alert"
            aria-live="assertive"
            :style="overlayStyle"
        >
            <div class="error-content">
                <svg
                    class="error-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                        clip-rule="evenodd"
                    />
                </svg>
                <span class="error-message">{{ errorMessage }}</span>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, CSSProperties, ref, watch } from 'vue';

const props = defineProps<{
    visible: boolean;
    errorMessage: string | undefined;
    tableRef: HTMLElement | null;
}>();

const overlayRef = ref<HTMLElement | null>(null);

const overlayStyle = computed<CSSProperties>(() => {
    if (!props.tableRef) {
        return {};
    }

    const tableRect = props.tableRef.getBoundingClientRect();
    
    // Position the overlay near the top of the table, with some padding
    return {
        position: 'fixed' as const,
        top: `${Math.max(tableRect.top + 16, 16)}px`,
        left: `${tableRect.left + 16}px`,
        maxWidth: `${Math.max(tableRect.width - 32, 200)}px`,
    };
});

// Update position when visibility changes
watch(() => props.visible, (isVisible) => {
    if (isVisible && props.tableRef) {
        // Force a layout recalculation to ensure proper positioning
        void overlayRef.value?.offsetHeight;
    }
});
</script>

<style scoped>
.g-table-error-overlay {
    z-index: 1000;
    background-color: #fef2f2;
    border: 2px solid #dc2626;
    border-radius: 0.375rem;
    padding: 0.75rem 1rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    pointer-events: none;
}

.error-content {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    color: #991b1b;
}

.error-icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
}

.error-message {
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 500;
}
</style>
