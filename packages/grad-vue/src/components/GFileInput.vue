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
            v-if="props.instructions"
            :id="'instructions-' + id"
            class="g-file-input-instructions"
        >
            {{ props.instructions }}
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
            v-if="selectedFileNames.length > 1"
            class="g-file-input-file-list"
            aria-label="Selected files"
        >
            <li
                v-for="name in selectedFileNames"
                :key="name"
                class="g-file-input-file-list-item"
            >
                {{ name }}
            </li>
        </ul>
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

.g-file-input-instructions {
    margin: 0 0 0.75em 0.5em;
    color: var(--g-surface-800);
}

.g-file-input {
    font-size: 1em;
    font-family: var(--il-font-sans);
    border: 2px solid var(--g-primary-500);
    border-radius: 4px;
    background: var(--g-surface-0);
    color: var(--g-surface-950);
    padding: 0.4em 0.5em;
    cursor: pointer;
    width: 100%;
}

.g-file-input:focus-visible {
    outline: 2px solid var(--g-primary-500);
    outline-offset: 2px;
}

.g-file-input:disabled {
    cursor: not-allowed;
    color: var(--g-surface-700);
    background: var(--g-surface-100);
    border-color: var(--g-surface-400);
}

.g-file-input-has-error .g-file-input {
    border-color: var(--g-danger-600);
    background: var(--g-danger-100);
}

.g-file-input-file-list {
    margin: 0.5em 0 0;
    padding: 0 0 0 1.25em;
    color: var(--g-surface-800);
    font-size: 0.9em;
}

.g-file-input-file-list-item {
    margin: 0.2em 0;
    overflow-wrap: break-word;
}
</style>
