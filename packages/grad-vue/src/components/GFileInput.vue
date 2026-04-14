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
    instructions: "",
    disabled: false,
    errors: () => [],
    required: false,
    multiple: false,
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

const selectedFileNames = computed(() => model.value.map((f) => f.name));
</script>

<template>
    <div
        class="g-file-input-wrap"
        :class="{ 'g-file-input-has-error': hasErrors }"
    >
        <label v-if="label" :for="id" class="g-file-input-label">
            {{ label }}
            <span v-if="required" class="g-file-input-required">*</span>
        </label>

        <div
            class="g-file-input-box"
            :class="{ 'g-file-input-box--disabled': disabled }"
        >
            <div v-if="instructions" class="g-file-input-box-header">
                <span
                    :id="'instructions-' + id"
                    class="g-file-input-instructions"
                    >{{ instructions }}</span
                >
            </div>

            <input
                :id="id"
                type="file"
                class="g-file-input"
                :disabled="disabled"
                :required="required"
                :accept="accept || undefined"
                :multiple="multiple"
                :aria-invalid="hasErrors ? 'true' : 'false'"
                :aria-describedby="
                    instructions ? 'instructions-' + id : undefined
                "
                :aria-errormessage="
                    hasErrors ? 'error-message-' + id : undefined
                "
                @change="onFileChange"
            />

            <ul
                v-if="multiple && selectedFileNames.length > 0"
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
                        role="none presentation"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                    >
                        <!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                        <path
                            d="M192 64C156.7 64 128 92.7 128 128L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 234.5C512 217.5 505.3 201.2 493.3 189.2L386.7 82.7C374.7 70.7 358.5 64 341.5 64L192 64zM453.5 240L360 240C346.7 240 336 229.3 336 216L336 122.5L453.5 240z"
                        />
                    </svg>
                    {{ name }}
                </li>
            </ul>
        </div>

        <GFormErrorMessages :errors="allErrors" :id="'error-message-' + id" />
    </div>
</template>

<style>
g-file-input {
    display: block;
}
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
    max-width: 360px;
    flex-direction: column;
    gap: 0.75em;
    border: 1px solid var(--g-primary-500);
    background: var(--g-surface-50);
    padding: 0.75em;
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
    height: 2em;
    width: 2em;
    color: var(--g-primary-500);
}

.g-file-input-box--disabled .g-file-input-upload-icon {
    color: var(--g-surface-600);
}

.g-file-input-instructions {
    font-size: 0.9em;
    color: var(--g-surface-900);
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--il-font-sans);
    font-weight: 700;
    font-size: 19px;
    line-height: 20px;
    border: 2px solid var(--g-primary-500);
    background: var(--g-surface-0);
    color: var(--g-primary-500);
    cursor: pointer;
    padding: 12px 20px;
    border-radius: var(--g-border-radius-m);
    text-decoration: none;
}

.g-file-input::file-selector-button:hover {
    background: var(--g-primary-500);
    color: var(--g-surface-0);
}

.g-file-input:focus-visible {
    background: var(--ilw-color--focus--background);
    color: var(--ilw-color--focus--text);
    outline: 2px solid var(--g-primary-500);
    outline-offset: 2px;
    box-shadow: 0 0 0 2px var(--g-info-200);
    border-radius: var(--g-border-radius-s);
}

.g-file-input:disabled {
    cursor: not-allowed;
    color: var(--g-surface-800);
}

.g-file-input:disabled::file-selector-button {
    background: var(--g-surface-200);
    color: var(--g-surface-900);
    border-color: var(--g-surface-200);
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
    border: 1px solid var(--g-primary-500);
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
    height: 1em;
    width: 1em;
    opacity: 0.7;
}
</style>

