import { ref, Ref, computed, ComputedRef } from "vue";

export interface FormField {
    name: string;
    value: Ref<any>;
    errors: Ref<string[]> | ComputedRef<string[]>;
}

export interface UseFormReturn {
    fields: Ref<Map<string, FormField>>;
    values: Ref<Record<string, any>>;
    errors: Ref<Record<string, string[]>>;
    isSubmitting: Ref<boolean>;
    hasErrors: Ref<boolean>;
    registerField: (name: string, field: FormField) => void;
    unregisterField: (name: string) => void;
    submit: (handler: (values: Record<string, any>) => Promise<void> | void) => Promise<void>;
}

/**
 * Composable to manage form state and link form inputs together.
 * Uses reactive state pattern - errors are provided as reactive props to input components.
 */
export function useForm(): UseFormReturn {
    const fields: Ref<Map<string, FormField>> = ref(new Map());
    const isSubmitting = ref(false);

    const values = computed(() => {
        const vals: Record<string, any> = {};
        fields.value.forEach((field, name) => {
            if (field && field.value) {
                vals[name] = field.value.value;
            }
        });
        return vals;
    });

    const errors = computed(() => {
        const errs: Record<string, string[]> = {};
        fields.value.forEach((field, name) => {
            const errorValue = field.errors.value;
            if (errorValue && errorValue.length > 0) {
                errs[name] = errorValue;
            }
        });
        return errs;
    });

    const hasErrors = computed(() => {
        return Object.keys(errors.value).length > 0;
    });

    function registerField(name: string, field: FormField) {
        fields.value.set(name, field);
    }

    function unregisterField(name: string) {
        fields.value.delete(name);
    }

    async function submit(handler: (values: Record<string, any>) => Promise<void> | void) {
        if (isSubmitting.value) {
            return;
        }
        isSubmitting.value = true;
        try {
            await handler(values.value);
        } finally {
            isSubmitting.value = false;
        }
    }

    return {
        fields,
        values,
        errors,
        isSubmitting,
        hasErrors,
        registerField,
        unregisterField,
        submit,
    };
}
