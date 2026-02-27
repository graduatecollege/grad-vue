<script setup lang="ts">
/**
 * Internal component for displaying form field error messages.
 * This component is used by form input components to display validation errors
 * in a consistent way across all form fields.
 */
interface Props {
    /**
     * Array of error messages to display
     */
    errors: string[];
    /**
     * ID for the error container (used for aria-describedby)
     */
    id: string;
}

defineProps<Props>();
</script>

<template>
    <div
        v-if="errors.length > 0"
        class="g-form-error-messages"
        :id="id"
        role="alert"
    >
        <div
            v-for="(errorMsg, index) in errors"
            :key="index"
            class="g-form-error-message"
        >
            <svg class="g-form-error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                <path
                    fill="currentColor"
                    d="M320 64C334.7 64 348.2 72.1 355.2 85L571.2 485C577.9 497.4 577.6 512.4 570.4 524.5C563.2 536.6 550.1 544 536 544L104 544C89.9 544 76.8 536.6 69.6 524.5C62.4 512.4 62.1 497.4 68.8 485L284.8 85C291.8 72.1 305.3 64 320 64zM320 416C302.3 416 288 430.3 288 448C288 465.7 302.3 480 320 480C337.7 480 352 465.7 352 448C352 430.3 337.7 416 320 416zM320 224C301.8 224 287.3 239.5 288.6 257.7L296 361.7C296.9 374.2 307.4 384 319.9 384C332.5 384 342.9 374.3 343.8 361.7L351.2 257.7C352.5 239.5 338.1 224 319.8 224z"
                />
            </svg>
            {{ errorMsg }}
        </div>
    </div>
</template>

<style scoped>
.g-form-error-messages {
    display: flex;
    flex-direction: column;
    gap: 0.25em;
    margin-top: 0.25em;
}

.g-form-error-message {
    background: var(--g-surface-0);
    color: var(--g-danger-600);
    padding: 0.25em 0.5em;
}

.g-form-error-icon {
    height: 1.2em;
    padding: 0.2em 0;
    display: inline;
    margin: 0 0.2em 0 0;
    vertical-align: middle;
}
</style>
