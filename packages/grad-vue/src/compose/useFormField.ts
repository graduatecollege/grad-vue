import { ref, Ref, computed, inject, onMounted, onBeforeUnmount } from "vue";
import { UseFormReturn } from "./useForm";

export interface UseFormFieldOptions {
    /**
     * The name of the field (required for form registration)
     */
    name?: string;
    /**
     * The model value ref to register with the form
     */
    value: Ref<any>;
    /**
     * Error messages from props (optional)
     */
    errors?: string[];
}

export interface UseFormFieldReturn {
    /**
     * Combined filtered errors array
     */
    displayErrors: Ref<string[]>;
    /**
     * Whether the field has any errors
     */
    hasErrors: Ref<boolean>;
}

/**
 * Composable to handle form field registration and error management.
 */
export function useFormField(options: UseFormFieldOptions): UseFormFieldReturn {
    const form = inject<UseFormReturn | null>("form", null);

    const displayErrors = computed(() => {
        const allErrors: string[] = [];
        
        // Add prop errors
        if (options.errors) {
            allErrors.push(...options.errors.filter(Boolean));
        }
        return allErrors;
    });

    const hasErrors = computed(() => displayErrors.value.length > 0);

    // Register field with form if name is provided
    const name = options.name;
    if (form && name) {
        onMounted(() => {
            // Note: FormField interface requires name field for consistency,
            // even though it's also used as the registration key
            form.registerField(name, {
                name: name,
                value: options.value,
                errors: displayErrors,
            });
        });

        onBeforeUnmount(() => {
            if (options.name) {
                form.unregisterField(options.name);
            }
        });
    }

    return {
        displayErrors,
        hasErrors
    };
}
