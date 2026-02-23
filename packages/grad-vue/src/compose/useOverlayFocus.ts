import { nextTick, Ref, ref, watch } from "vue";
import { useFocusTrap } from "@vueuse/integrations/useFocusTrap";

export function useOverlayFocus(element: Ref<HTMLElement | null>, isTop: Ref<boolean>) {

    const unpausing = ref(false);

    const { activate, deactivate, pause, unpause } = useFocusTrap(element, {
        immediate: true,
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
            const selected = element.value?.querySelector("[aria-selected='true']");
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
            })
        },
    });

    watch(isTop, (top) => {
        if (top) {
            // If the overlay is open immediately on mount, this can
            // fail if we don't wait for the next tick because there are no
            // focusable elements yet.
            nextTick(() => {
                unpause();
            }).catch((err) => {
                console.error(err);
            })
        } else {
            pause();
        }
    });

    return { activate, deactivate, pause, unpause };
}
