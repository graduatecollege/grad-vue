import { ref, onMounted, onUnmounted, type Ref } from "vue";
import { useSessionStorage } from "@vueuse/core";

/**
 * Composable to handle scroll position storage and automatic restoration for a component.
 * Saves the scroll top of the scrollable element itself, or its nearest scrollable
 * parent when the element is not scrollable, and restores it automatically on mount
 * or when the component becomes visible.
 *
 * @param elementRef Ref to the element whose scrollable element should be tracked.
 * @param storageKey Session storage key prefix. Scroll position is saved under `${storageKey}:scroll`.
 */
export function useScrollRestore(
    elementRef: Ref<HTMLElement | null>,
    storageKey: string | undefined,
) {
    const scrollStorage = storageKey
        ? useSessionStorage<number>(`${storageKey}:scroll`, 0, { writeDefaults: false })
        : null;

    /**
     * Whether the scroll position is currently being restored.
     * This is used to reduce the flash of an unscrolled position when first rendering.
     */
    const isPendingScrollRestore = ref(Boolean(scrollStorage?.value && scrollStorage.value > 0));

    let scrollableParent: HTMLElement | null = null;
    let scrollRestoreObserver: ResizeObserver | null = null;
    let scrollRestoreMutationObserver: MutationObserver | null = null;
    let hasRestoredScroll = false;

    function isScrollable(el: HTMLElement): boolean {
        const style = window.getComputedStyle(el);
        return style.overflowY === "auto" || style.overflowY === "scroll";
    }

    function getScrollableParent(el: HTMLElement): HTMLElement | null {
        if (typeof window === "undefined") {
            return null;
        }
        if (isScrollable(el)) {
            return el;
        }
        let parent = el.parentElement;
        while (parent && parent !== document.documentElement && parent !== document.body) {
            if (isScrollable(parent)) {
                return parent;
            }
            parent = parent.parentElement;
        }
        return null;
    }

    function handleParentScroll() {
        if (scrollStorage && scrollableParent) {
            scrollStorage.value = scrollableParent.scrollTop;
        }
    }

    function stopScrollRestoreObserver() {
        if (scrollRestoreObserver) {
            scrollRestoreObserver.disconnect();
            scrollRestoreObserver = null;
        }
        if (scrollRestoreMutationObserver) {
            scrollRestoreMutationObserver.disconnect();
            scrollRestoreMutationObserver = null;
        }
    }

    function finishScrollRestore() {
        isPendingScrollRestore.value = false;
    }

    function canMeasureScrollRestore() {
        if (!elementRef.value || !scrollableParent) {
            return false;
        }

        return elementRef.value.getClientRects().length > 0
            && scrollableParent.getClientRects().length > 0
            && scrollableParent.clientHeight > 0;
    }

    function restoreScrollPosition() {
        if (!scrollStorage || !scrollableParent || hasRestoredScroll) {
            finishScrollRestore();
            return;
        }

        if (scrollStorage.value <= 0) {
            finishScrollRestore();
            return;
        }

        if (!canMeasureScrollRestore()) {
            return;
        }

        const maxScrollTop = scrollableParent.scrollHeight - scrollableParent.clientHeight;
        if (maxScrollTop <= 0) {
            finishScrollRestore();
            stopScrollRestoreObserver();
            return;
        }

        scrollableParent.scrollTop = scrollStorage.value;
        hasRestoredScroll = scrollableParent.scrollTop > 0;
        if (hasRestoredScroll) {
            finishScrollRestore();
            stopScrollRestoreObserver();
        }
    }

    function observeVisibilityChanges(nav: HTMLElement) {
        if (typeof MutationObserver === "undefined") {
            return;
        }

        scrollRestoreMutationObserver = new MutationObserver(() => {
            restoreScrollPosition();
        });

        let current: HTMLElement | null = nav;
        while (current) {
            scrollRestoreMutationObserver.observe(current, {
                attributes: true,
                attributeFilter: ["class", "style", "hidden", "open"],
            });
            current = current.parentElement;
        }
    }

    onMounted(() => {
        if (!elementRef.value) {
            finishScrollRestore();
            return;
        }

        if (!scrollStorage) {
            finishScrollRestore();
            return;
        }
        scrollableParent = getScrollableParent(elementRef.value);
        if (!scrollableParent) {
            finishScrollRestore();
            return;
        }

        restoreScrollPosition();

        if (typeof ResizeObserver !== "undefined") {
            scrollRestoreObserver = new ResizeObserver(() => {
                restoreScrollPosition();
            });
            scrollRestoreObserver.observe(elementRef.value);
            scrollRestoreObserver.observe(scrollableParent);
        }
        observeVisibilityChanges(elementRef.value);

        scrollableParent.addEventListener("scroll", handleParentScroll);
    });

    onUnmounted(() => {
        stopScrollRestoreObserver();
        if (scrollableParent) {
            scrollableParent.removeEventListener("scroll", handleParentScroll);
            scrollableParent = null;
        }
        hasRestoredScroll = false;
    });

    return {
        isPendingScrollRestore,
    };
}
