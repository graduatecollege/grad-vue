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
     * Combined errors from both props and form field state
     */
    displayErrors: Ref<string[]>;
    /**
     * Whether the field has any errors
     */
    hasErrors: Ref<boolean>;
    /**
     * Field errors ref that can be updated by form validation
     */
    fieldErrors: Ref<string[]>;
}

/**
 * Composable to handle form field registration and error management.
 * 
 * This composable:
 * - Injects the form context
 * - Registers the field with the form on mount (if name is provided)
 * - Unregisters the field on unmount
 * - Combines errors from props and form field state
 * - Provides computed values for error display
 */
export function useFormField(options: UseFormFieldOptions): UseFormFieldReturn {
    const form = inject<UseFormReturn | null>("form", null);
    const fieldErrors = ref<string[]>([]);

    // Combine all error sources
    const displayErrors = computed(() => {
        const allErrors: string[] = [];
        
        // Add prop errors
        if (options.errors && options.errors.length > 0) {
            allErrors.push(...options.errors);
        }
        
        // Add field errors from reactive state
        if (fieldErrors.value.length > 0) {
            allErrors.push(...fieldErrors.value);
        }
        
        return allErrors;
    });

    const hasErrors = computed(() => displayErrors.value.length > 0);

    // Register field with form if name is provided
    if (form && options.name) {
        onMounted(() => {
            // Note: FormField interface requires name field for consistency,
            // even though it's also used as the registration key
            form.registerField(options.name!, {
                name: options.name!,
                value: options.value,
                errors: fieldErrors,
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
        hasErrors,
        fieldErrors,
    };
}
