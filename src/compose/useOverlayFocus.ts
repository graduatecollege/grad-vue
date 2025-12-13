import { Ref, ref, watch } from "vue";
import { useFocusTrap } from "@vueuse/integrations/useFocusTrap";

export function useOverlayFocus(element: Ref<HTMLElement | null>, isTop: Ref<boolean>) {

    const unpausing = ref(false);

    const { activate, deactivate, pause, unpause } = useFocusTrap(element, {
        immediate: true,
        initialFocus: () => {
            if (unpausing.value) {
                return false;
            }
            const h2 = element.value?.querySelector("h2");
            if (h2) {
                return h2 as HTMLElement;
            }
            const focus = element.value?.querySelector("[popover-focus]");
            if (focus) {
                return focus as HTMLElement;
            }
            const selected = element.value?.querySelector("[aria-selected='true']");
            if (selected) {
                return selected as HTMLElement;
            }
        },
        onPostPause: () => (unpausing.value = true),
        onPostUnpause: () => {
            setTimeout(() => {
                unpausing.value = false;
            }, 0);
        },
    });

    watch(isTop, (top) => {
        if (top) {
            unpause();
        } else {
            pause();
        }
    });

    return { activate, deactivate, pause, unpause };
}
