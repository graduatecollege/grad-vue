import { ref, type Ref } from "vue";
import type { Editor } from "@tiptap/vue-3";

export function useToolbarNavigation(editor: Ref<Editor | undefined>, toolbarRef: Ref<HTMLElement | null>) {
    const activeButtonIndex = ref(0);

    function handleToolbarKeyDown(event: KeyboardEvent) {
        const toolbar = toolbarRef.value;
        if (!toolbar) return;

        const buttons = Array.from(
            toolbar.querySelectorAll("button"),
        ) as HTMLButtonElement[];
        const currentIndex = buttons.findIndex(
            (btn) => btn === document.activeElement,
        );

        // Handle Escape key - return focus to editor
        if (event.key === "Escape") {
            event.preventDefault();
            editor.value?.commands?.focus();
            return;
        }

        // Don't handle Tab - let it exit the toolbar naturally
        if (event.key === "Tab") {
            return;
        }

        let nextIndex = currentIndex;

        switch (event.key) {
            case "ArrowRight":
            case "ArrowDown":
                event.preventDefault();
                nextIndex =
                    currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
                break;
            case "ArrowLeft":
            case "ArrowUp":
                event.preventDefault();
                nextIndex =
                    currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
                break;
            case "Home":
                event.preventDefault();
                nextIndex = 0;
                break;
            case "End":
                event.preventDefault();
                nextIndex = buttons.length - 1;
                break;
            default:
                return;
        }

        // Update active button index and focus
        activeButtonIndex.value = nextIndex;
        buttons[nextIndex]?.focus();
    }

    function getButtonTabIndex(index: number): number {
        return index === activeButtonIndex.value ? 0 : -1;
    }

    return {
        activeButtonIndex,
        handleToolbarKeyDown,
        getButtonTabIndex,
    };
}
