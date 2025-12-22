import { unrefElement, useIntersectionObserver, useMutationObserver } from "@vueuse/core";
import { ref, Ref } from "vue";

/**
 * Monitor a list of elements' intersection with the viewport to update active links.
 *
 * This updates the activeLink store with the active content's ID for use in menus.
 *
 * @param element Children of this element will be observed
 * @param topOffset Offset from the top of the window to consider not visible
 * @param activeId Ref to store the active element ID
 */
export function useActiveLinkContent(
    element: Ref<HTMLElement | null>,
    topOffset: number,
    activeId: Ref<string>,
) {
    const thresholds = [0, 0.25, 0.5, 0.75, 1];
    const rootMargin = `${-topOffset}px 0px 0px 0px`;
    // Track most visible section in viewport
    const visibility = new Map<Element, number>();

    // Get the children elements to observe
    const elements = ref<HTMLElement[]>(
        Array.from(unrefElement(element)?.children || []) as HTMLElement[],
    );

    // To maintain reactivity, observe for changes in child elements.
    // This works better with Nuxt's rendering than passing an array of refs.
    useMutationObserver(
        element,
        () => {
            elements.value = Array.from(
                unrefElement(element)?.children || [],
            ) as HTMLElement[];
        },
        { childList: true },
    );

    const { stop } = useIntersectionObserver(
        elements,
        (entries) => {
            const lastElement = elements.value[elements.value.length - 1];

            for (const entry of entries) {
                // Use intersection ratio as visibility score
                visibility.set(
                    entry.target,
                    entry.isIntersecting ? entry.intersectionRatio : 0,
                );
                if (
                    entry.target === lastElement &&
                    entry.intersectionRatio === 1
                ) {
                    // If last element is fully visible, prioritize that
                    visibility.set(entry.target, Number.POSITIVE_INFINITY);
                }
            }
            // Pick the element with highest visibility
            let bestEl: Element | null = null;
            let bestScore = 0;
            for (const el of visibility.keys()) {
                const score = visibility.get(el) || 0;
                if (score <= bestScore) {
                    continue;
                }
                const rect = (el as HTMLElement).getBoundingClientRect();
                bestEl = el;
                bestScore = score;
            }
            if (bestEl instanceof HTMLElement) {
                activeId.value = bestEl.id;
            } else {
                activeId.value = "";
            }
        },
        {
            threshold: thresholds,
            root: null,
            rootMargin,
            immediate: true,
        },
    );

    return { stop };
}
