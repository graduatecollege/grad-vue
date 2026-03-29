<script lang="ts">
/**
 * A file input component for accessible file uploads.
 *
 * If `label` is omitted, an accessible label must be provided some other way.
 *
 * In standard Vue usage, this registers with the nearest parent `GForm` via
 * injection. In custom-elements mode, use matching `form-key` values to pair
 * with a `GForm`.
 *
 * Errors are provided as an array of strings. Multiple errors will all be
 * displayed. Client-side validation errors from `maxFileSize` and `maxFiles`
 * are shown alongside any provided `errors`.
 */
export default {};
</script>

<script lang="ts" setup>
import { computed, ref, useId, toRef } from "vue";
import { useFormField } from "../compose/useFormField.ts";
import GFormErrorMessages from "./form/GFormErrorMessages.vue";

defineOptions({
    inheritAttrs: false,
});

type Props = {
    /**
     * Label
     * @demo Upload File
     */
    label?: string;
    /**
     * Instructions
     * @demo
     */
    instructions?: string;
    /**
     * Disabled
     * @demo
     */
    disabled?: boolean;
    /**
     * Error messages array (supports multiple validation errors)
     */
    errors?: string[];
    /**
     * Required
     * @demo
     */
    required?: boolean;
    /**
     * Name for form registration
     */
    name?: string;
    /**
     * Form channel key for custom elements mode
     */
    formKey?: string;
    /**
     * Accepted file types (e.g. ".pdf,.docx" or "image/*")
     * @demo
     */
    accept?: string;
    /**
     * Allow multiple file selection
     * @demo
     */
    multiple?: boolean;
    /**
     * Maximum file size in bytes for client-side validation
     * @demo
     */
    maxFileSize?: number;
    /**
     * Maximum number of files allowed for client-side validation
     * @demo
     */
    maxFiles?: number;
};

const props = withDefaults(defineProps<Props>(), {
    label: undefined,
    instructions: "",
    disabled: false,
    errors: () => [],
    required: false,
    name: undefined,
    formKey: undefined,
    accept: undefined,
    multiple: false,
    maxFileSize: undefined,
    maxFiles: undefined,
});

const model = defineModel<File[]>({ default: () => [] });

const id = useId();

const { displayErrors } = useFormField({
    name: props.name,
    value: model,
    errors: toRef(props, "errors"),
    formKey: props.formKey,
});

const emit = defineEmits<{
    change: [files: File[]];
}>();

const validationErrors = ref<string[]>([]);

function validateFiles(files: File[]): string[] {
    const errs: string[] = [];

    if (props.maxFiles !== undefined && files.length > props.maxFiles) {
        errs.push(
            `You may select at most ${props.maxFiles} file${props.maxFiles === 1 ? "" : "s"}.`,
        );
    }

    if (props.maxFileSize !== undefined) {
        const oversized = files.filter((f) => f.size > props.maxFileSize!);
        if (oversized.length > 0) {
            const maxMB = (props.maxFileSize / (1024 * 1024)).toFixed(1);
            errs.push(
                `${oversized.length === 1 ? "One file exceeds" : `${oversized.length} files exceed`} the maximum size of ${maxMB} MB.`,
            );
        }
    }

    return errs;
}

function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    validationErrors.value = validateFiles(files);
    model.value = files;
    emit("change", files);
}

const allErrors = computed(() => [
    ...displayErrors.value,
    ...validationErrors.value,
]);

const hasErrors = computed(() => allErrors.value.length > 0);

const selectedFileNames = computed(() =>
    model.value.map((f) => f.name),
);
</script>

<template>
    <div
        class="g-file-input-wrap"
        :class="{ 'g-file-input-has-error': hasErrors }"
    >
        <label
            v-if="props.label"
            :for="id"
            class="g-file-input-label"
        >
            {{ props.label }}
            <span
                v-if="props.required"
                class="g-file-input-required"
                aria-hidden="true"
            >*</span>
        </label>

        <div
            class="g-file-input-box"
            :class="{ 'g-file-input-box--disabled': props.disabled }"
        >
            <div class="g-file-input-box-header">
                <svg
                    class="g-file-input-upload-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 640"
                    aria-hidden="true"
                    focusable="false"
                >
                    <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                    <path
                        fill="currentColor"
                        d="M144 480C64.5 480 0 415.5 0 336C0 269.6 45.1 214 106.2 197.3C103.4 187.1 102 176.5 102 165.5C102 92.6 163.7 32 239.8 32C278.3 32 313.1 48.5 337.3 75.3C354.1 63.7 374.8 57 397 57C454.9 57 502 104.1 502 162C502 163.5 502 165 501.9 166.5C573.4 183.1 626 248.5 626 326C626 415.5 562.7 480 484 480L352 480 352 308.5 397.2 353.7C403.4 359.9 413.6 359.9 419.8 353.7 426 347.5 426 337.3 419.8 331.1L333.7 244.9C327.5 238.7 317.3 238.7 311.1 244.9L224.9 331.1C218.7 337.3 218.7 347.5 224.9 353.7 231.1 359.9 241.3 359.9 247.5 353.7L292 308.5 292 480 144 480z"
                    />
                </svg>
                <span
                    v-if="props.instructions"
                    :id="'instructions-' + id"
                    class="g-file-input-instructions"
                >{{ props.instructions }}</span>
            </div>

            <input
                :id="id"
                type="file"
                class="g-file-input"
                :disabled="props.disabled"
                :required="props.required"
                :accept="props.accept || undefined"
                :multiple="props.multiple"
                :aria-invalid="hasErrors ? 'true' : 'false'"
                :aria-describedby="
                    props.instructions ? 'instructions-' + id : undefined
                "
                :aria-errormessage="hasErrors ? 'error-message-' + id : undefined"
                @change="onFileChange"
            />

            <ul
                v-if="selectedFileNames.length > 0"
                class="g-file-input-pills"
                aria-label="Selected files"
            >
                <li
                    v-for="name in selectedFileNames"
                    :key="name"
                    class="g-file-input-pill"
                >
                    <svg
                        class="g-file-input-pill-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 384 512"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                        <path
                            fill="currentColor"
                            d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 288c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128z"
                        />
                    </svg>
                    {{ name }}
                </li>
            </ul>
        </div>

        <GFormErrorMessages
            :errors="allErrors"
            :id="'error-message-' + id"
        />
    </div>
</template>

<style scoped>
.g-file-input-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
}

.g-file-input-label {
    margin-bottom: 0.5em;
    font-size: 1.25em;
}

.g-file-input-required {
    color: var(--g-danger-600);
    margin-left: 0.2em;
}

.g-file-input-box {
    display: flex;
    flex-direction: column;
    gap: 0.75em;
    border: 2px solid var(--g-primary-500);
    border-radius: 4px;
    background: var(--g-surface-0);
    padding: 0.75em 1em;
}

.g-file-input-box--disabled {
    border-color: var(--g-surface-400);
    background: var(--g-surface-100);
}

.g-file-input-has-error .g-file-input-box {
    border-color: var(--g-danger-600);
    background: var(--g-danger-100);
}

.g-file-input-box-header {
    display: flex;
    align-items: center;
    gap: 0.5em;
    color: var(--g-surface-700);
}

.g-file-input-upload-icon {
    flex-shrink: 0;
    height: 1.4em;
    width: 1.4em;
    color: var(--g-primary-500);
}

.g-file-input-box--disabled .g-file-input-upload-icon {
    color: var(--g-surface-400);
}

.g-file-input-instructions {
    font-size: 0.9em;
    color: var(--g-surface-800);
}

.g-file-input {
    font-size: 1em;
    font-family: var(--il-font-sans);
    color: var(--g-surface-950);
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    width: 100%;
}

.g-file-input::file-selector-button {
    font-size: 0.9em;
    font-family: var(--il-font-sans);
    background: var(--g-primary-500);
    color: var(--g-primary-text);
    border: none;
    border-radius: 4px;
    padding: 0.35em 0.85em;
    margin-right: 0.75em;
    cursor: pointer;
    transition: background 0.15s;
}

.g-file-input::file-selector-button:hover {
    background: var(--g-primary-300);
}

.g-file-input:focus-visible {
    outline: 2px solid var(--g-primary-500);
    outline-offset: 2px;
    border-radius: 2px;
}

.g-file-input:disabled {
    cursor: not-allowed;
    color: var(--g-surface-600);
}

.g-file-input:disabled::file-selector-button {
    background: var(--g-surface-400);
    color: var(--g-surface-700);
    cursor: not-allowed;
}

.g-file-input-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4em;
    list-style: none;
    margin: 0;
    padding: 0;
}

.g-file-input-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    background: var(--g-info-300);
    color: var(--g-surface-950);
    border-radius: 999px;
    padding: 0.2em 0.7em;
    font-size: 0.85em;
    max-width: 24em;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.g-file-input-pill-icon {
    flex-shrink: 0;
    height: 0.85em;
    width: 0.85em;
    opacity: 0.7;
}
</style>
