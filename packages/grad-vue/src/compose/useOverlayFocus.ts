import { nextTick, Ref, ref, watch } from "vue";
import { useFocusTrap } from "@vueuse/integrations/useFocusTrap";

const tabbableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
    "[contenteditable='true']",
].join(",");

export function useOverlayFocus(
    element: Ref<HTMLElement | null>,
    isTop: Ref<boolean>,
    clickOutsideDeactivates = false,
) {
    const unpausing = ref(false);

    const hasTabbableNodes = () =>
        !!element.value?.querySelector(tabbableSelector);

    const { activate, deactivate, pause, unpause } = useFocusTrap(element, {
        immediate: false,
        clickOutsideDeactivates,
        initialFocus: () => {
            if (unpausing.value) {
                return false;
            }
            const focus = element.value?.querySelector("[popover-focus]");
            if (focus) {
                return focus as HTMLElement;
            }
            const h2 = element.value?.querySelector("h2");
            if (h2) {
                return h2 as HTMLElement;
            }
            const selected = element.value?.querySelector(
                "[aria-selected='true']",
            );
            if (selected) {
                return selected as HTMLElement;
            }
        },
        onPostPause: () => (unpausing.value = true),
        onPostUnpause: () => {
            nextTick(() => {
                unpausing.value = false;
            }).catch((err) => {
                console.error(err);
            });
        },
    });

    watch(isTop, (top) => {
        if (top) {
            nextTick(() => {
                if (hasTabbableNodes()) {
                    unpause();
                }
            }).catch((err) => {
                console.error(err);
            });
        } else {
            pause();
        }
    });

    const activateWhenReady = () => {
        nextTick(() => {
            requestAnimationFrame(() => {
                if (hasTabbableNodes()) {
                    activate();
                }
            });
        }).catch((err) => {
            console.error(err);
        });
    };

    return { activate: activateWhenReady, deactivate, pause, unpause };
}
