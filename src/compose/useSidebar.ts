import { onBeforeUnmount, Ref, ref, useId, watch } from "vue";
import { useMediaQuery } from "@vueuse/core";

/**
 * Composable to manage sidebar state and link components together.
 *
 * @param breakpoint Media query string for when the sidebar should be collapsible
 */
export function useSidebar(
    breakpoint: Ref<string> | string = "(max-width: 800px)",
) {
    const id = useId();
    const open = ref(false);
    const isCollapsible: Ref<boolean> = useMediaQuery(breakpoint);

    function onDocumentClick(e: MouseEvent) {
        if (!isCollapsible.value || !open.value) {
            return;
        }
        const target = e.target as HTMLElement;
        const sidebarEl = document.getElementById(`${id}-sidebar`);
        if (!sidebarEl) {
            return;
        }
        if (sidebarEl.contains(target)) {
            return;
        }
        // Very slight delay means if they click the menu button to close it,
        // it won't re-open
        setTimeout(() => {
            open.value = false;
        }, 5);
    }
    function onDocumentFocus(e: FocusEvent) {
        if (!isCollapsible.value || !open.value) {
            return;
        }
        const target = e.target as HTMLElement;
        const sidebarEl = document.getElementById(`${id}-sidebar`);
        const hamburgerEl = document.getElementById(`${id}-hamburger`);
        if (!sidebarEl) {
            return;
        }
        if (sidebarEl.contains(target) || hamburgerEl?.contains(target)) {
            return;
        }
        // Very slight delay means if they click the menu button to close it,
        // it won't re-open
        setTimeout(() => {
            open.value = false;
        }, 5);
    }

    if (document) {
        watch(
            isCollapsible,
            (val) => {
                if (val) {
                    document.addEventListener("mousedown", onDocumentClick);
                    document.addEventListener("focusin", onDocumentFocus);
                } else {
                    document.removeEventListener("mousedown", onDocumentClick);
                    document.removeEventListener("focusin", onDocumentFocus);
                }
            },
            { immediate: true },
        );
    }

    onBeforeUnmount(() => {
        document.removeEventListener("mousedown", onDocumentClick);
        document.removeEventListener("focusin", onDocumentFocus);
    });

    return {
        id,
        open,
        isCollapsible,
        toggle: () => (open.value = !open.value),
    };
}
