import { useIntersectionObserver } from "@vueuse/core";
import { useActiveLinkStore } from "../stores/activeLink.store.ts";
import { Ref } from "vue";

/**
 * Monitor a list of elements' intersection with the viewport to update active links.
 *
 * This updates the activeLink store with the active content's ID for use in menus.
 *
 * @param elements Elements to observe
 * @param topOffset Offset from the top of the window to consider not visible
 */
export function useActiveLinkContent(
    elements: Ref<HTMLElement[]>,
    topOffset: number,
) {
    const activeLinkStore = useActiveLinkStore();
    const thresholds = [0, 0.25, 0.5, 0.75, 1];
    const rootMargin = `${-topOffset}px 0px 0px 0px`;

    const { stop } = useIntersectionObserver(
        elements,
        (entries) => {
            const isNearBottom =
                Math.abs(
                    window.innerHeight +
                        window.scrollY -
                        document.documentElement.scrollHeight,
                ) < 5;

            console.log("isNearBottom", isNearBottom);
            if (isNearBottom) {
                const lastElement = elements.value[elements.value.length - 1];
                const lastElementId = lastElement?.id;
                if (lastElementId) {
                    activeLinkStore.activeId = lastElementId;
                    return;
                }
            }
            // Track most visible section in viewport
            const visibility = new Map<Element, number>();

            for (const entry of entries) {
                // Use intersection ratio as visibility score
                visibility.set(
                    entry.target,
                    entry.isIntersecting ? entry.intersectionRatio : 0,
                );
            }
            console.log(entries, visibility);
            // Pick the element with highest visibility
            let bestEl: Element | null = null;
            let bestScore = 0;
            for (const el of visibility.keys()) {
                const score = visibility.get(el) || 0;
                if (score <= bestScore) {
                    continue;
                }
                const rect = (el as HTMLElement).getBoundingClientRect();
                if (rect.top < topOffset - 5) {
                    continue;
                }
                bestEl = el;
                bestScore = score;
            }
            console.log(bestScore, bestEl);
            if (isNearBottom) {
                const lastElement = elements.value[elements.value.length - 1];
                activeLinkStore.activeId = lastElement?.id || "";
            } else if (bestEl instanceof HTMLElement) {
                activeLinkStore.activeId = bestEl.id;
            } else {
                activeLinkStore.activeId = "";
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
