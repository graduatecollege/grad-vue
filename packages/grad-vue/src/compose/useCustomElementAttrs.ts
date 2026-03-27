import { computed, useAttrs } from "vue";

type UseCustomElementAttrsOptions = {
    omitInCustomElement?: string[];
};

export function isCustomElementMode() {
    const globalScope = globalThis as typeof globalThis & {
        __GRAD_VUE_IS_WEB_COMPONENTS_BUILD__?: boolean;
    };
    return globalScope.__GRAD_VUE_IS_WEB_COMPONENTS_BUILD__ === true;
}

export function useCustomElementAttrs(options: UseCustomElementAttrsOptions = {}) {
    const attrs = useAttrs();
    const globalScope = globalThis as typeof globalThis & {
        __GRAD_VUE_IS_WEB_COMPONENTS_BUILD__?: boolean;
    };
    const isCustomElement = globalScope.__GRAD_VUE_IS_WEB_COMPONENTS_BUILD__ === true;
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