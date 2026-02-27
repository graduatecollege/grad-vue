import { ref, Ref, computed } from "vue";

export interface FormField {
    name: string;
    value: Ref<any>;
    error: Ref<string>;
    setValue: (value: any) => void;
    setError: (error: string) => void;
}

export interface UseFormReturn {
    fields: Ref<Map<string, FormField>>;
    values: Ref<Record<string, any>>;
    errors: Ref<Record<string, string>>;
    isSubmitting: Ref<boolean>;
    hasErrors: Ref<boolean>;
    registerField: (name: string, field: FormField) => void;
    unregisterField: (name: string) => void;
    setFieldValue: (name: string, value: any) => void;
    setFieldError: (name: string, error: string) => void;
    clearErrors: () => void;
    setErrors: (errors: Record<string, string>) => void;
    submit: (handler: (values: Record<string, any>) => Promise<void> | void) => Promise<void>;
}

/**
 * Composable to manage form state and link form inputs together.
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
        const errs: Record<string, string> = {};
        fields.value.forEach((field, name) => {
            const errorValue = field.error.value;
            if (errorValue) {
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

    function setFieldValue(name: string, value: any) {
        const field = fields.value.get(name);
        if (field) {
            field.setValue(value);
        }
    }

    function setFieldError(name: string, error: string) {
        const field = fields.value.get(name);
        if (field) {
            field.setError(error);
        }
    }

    function clearErrors() {
        fields.value.forEach((field) => {
            field.setError("");
        });
    }

    function setErrors(errors: Record<string, string>) {
        clearErrors();
        Object.entries(errors).forEach(([name, error]) => {
            setFieldError(name, error);
        });
    }

    async function submit(handler: (values: Record<string, any>) => Promise<void> | void) {
        if (isSubmitting.value) {
            return;
        }
        clearErrors();
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
        setFieldValue,
        setFieldError,
        clearErrors,
        setErrors,
        submit,
    };
}
