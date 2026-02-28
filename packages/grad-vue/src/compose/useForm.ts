import { ref, Ref, computed, ComputedRef, shallowReactive } from "vue";

export interface FormField {
    name: string;
    value: Ref<any>;
    errors: Ref<string[]> | ComputedRef<string[]>;
}

export interface UseFormReturn {
    fields: Record<string, FormField>;
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
    const fields: Record<string, FormField> = shallowReactive({});
    const isSubmitting = ref(false);

    const values = computed(() => {
        const vals: Record<string, any> = {};
        Object.entries(fields).forEach(([name, field]) => {
            if (field && field.value) {
                vals[name] = field.value.value;
            }
        });
        return vals;
    });

    const errors = computed(() => {
        const errs: Record<string, string[]> = {};
        Object.entries(fields).forEach(([name, field]) => {
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
        fields[name] = field;
    }

    function unregisterField(name: string) {
        delete fields[name];
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
