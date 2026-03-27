import { computed, getCurrentInstance, useAttrs, type ComponentInternalInstance } from "vue";

type UseCustomElementAttrsOptions = {
    omitInCustomElement?: string[];
};

export function useCustomElementAttrs(options: UseCustomElementAttrsOptions = {}) {
    const attrs = useAttrs();
    const instance = getCurrentInstance() as (ComponentInternalInstance & {
        ce?: unknown;
        isCE?: boolean;
    }) | null;
    const isCustomElement = !!(instance?.isCE ?? instance?.ce);
    const omitInCustomElement = options.omitInCustomElement ?? [];

    const forwardedAttrs = computed(() => {
        if (!isCustomElement || omitInCustomElement.length === 0) {
            return attrs;
        }

        const attrObject = attrs as Record<string, unknown>;
        const filtered: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(attrObject)) {
            if (!omitInCustomElement.includes(key)) {
                filtered[key] = value;
            }
        }

        return filtered;
    });

    return {
        attrs,
        isCustomElement,
        forwardedAttrs,
    };
}