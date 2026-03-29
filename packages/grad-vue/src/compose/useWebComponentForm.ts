import { useForm, UseFormReturn } from "./useForm";

function getFormStore() {
    const globalScope = globalThis as typeof globalThis & {
        __GRAD_VUE_WC_FORMS__?: Map<string, UseFormReturn>;
    };

    if (!globalScope.__GRAD_VUE_WC_FORMS__) {
        globalScope.__GRAD_VUE_WC_FORMS__ = new Map();
    }

    return globalScope.__GRAD_VUE_WC_FORMS__;
}

export function useWebComponentForm(key = "default") {
    const forms = getFormStore();
    const formKey = key || "default";

    if (!forms.has(formKey)) {
        forms.set(formKey, useForm());
    }

    return forms.get(formKey)!;
}
