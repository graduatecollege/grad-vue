import { nextTick, onBeforeUnmount, onMounted, Ref } from "vue";

export function useOverlayEscape(
    containers: Ref<Element | null>[],
    isTop: Ref<boolean>,
    open: Ref<boolean>,
    hide: () => void,
    pop: () => void,
) {
    function onDocumentClick(e: MouseEvent) {
        for (const ref of containers) {
            if (ref.value?.contains(e.target as Node)) {
                return;
            }
        }
        hide();
    }

    function onDocumentKeydown(e: KeyboardEvent) {
        if (e.key === "Escape" && open.value) {
            if (isTop.value) {
                e.preventDefault();
                nextTick(hide).catch((err) => {
                    console.error(err);
                })
            }
        }
    }

    onMounted(() => {
        document.addEventListener("mousedown", onDocumentClick);
        document.addEventListener("keydown", onDocumentKeydown);
    });
    onBeforeUnmount(() => {
        document.removeEventListener("mousedown", onDocumentClick);
        document.removeEventListener("keydown", onDocumentKeydown);
        pop();
    });
}
