import { computed, nextTick, onBeforeUnmount, ref, watch, type Ref } from "vue";
import { useOverlayStack } from "./useOverlayStack.ts";

/**
 * A normalized select option with a label and a value.
 * Both GSelect and GMultiSelect accept `Array<string | SelectOption>` and
 * normalize the strings to this shape internally.
 */
export type SelectOption = {
    label: string;
    value: string | number;
};

/**
 * Normalizes a mixed `Array<string | SelectOption>` into a uniform
 * `SelectOption[]`.  Strings are converted to `{ label: s, value: s }`.
 */
export function normalizeSelectOptions(
    options: Array<string | SelectOption>,
): SelectOption[] {
    return options.map((opt) =>
        typeof opt === "string" ? { label: opt, value: opt } : opt,
    );
}

export interface UseSelectDropdownOptions {
    /** Reactive flag that is `true` when the dropdown is visible. */
    open: Ref<boolean>;
    /**
     * The element whose bounding rect is used to decide whether the dropdown
     * opens above or below (the trigger / combobox control).
     */
    anchorRef: Ref<HTMLElement | null>;
    /** The listbox element – used to measure its natural scroll-height. */
    listboxRef: Ref<HTMLElement | null>;
    /**
     * A stable unique id that doubles as the overlay-stack entry and the
     * prefix for option element ids (`${baseId}-option-${index}`).
     */
    baseId: string;
    /** The currently-highlighted option index, used by scrollOptionIntoView. */
    activeIndex: Ref<number>;
}

export interface UseSelectDropdownReturn {
    /** Current placement of the dropdown relative to the anchor. */
    menuPlacement: Ref<"below" | "above">;
    /** Inline styles to apply to the listbox element. */
    menuStyle: Readonly<Ref<Record<string, string>>>;
    /**
     * Whether this overlay is topmost in the global stack.
     * Use this to guard Escape-key handling.
     */
    isTop: Ref<boolean>;
    /** Scrolls the currently-active option into view. */
    scrollOptionIntoView: () => void;
}

/**
 * Shared dropdown behaviour for GSelect and GMultiSelect.
 *
 * Manages:
 *  - Menu placement (above / below) and max-height constraints
 *  - window resize / scroll listeners (added when open, removed when closed)
 *  - Overlay-stack registration (push on open, pop on close / unmount)
 *  - Scrolling the active option into view
 */
export function useSelectDropdown({
    open,
    anchorRef,
    listboxRef,
    baseId,
    activeIndex,
}: UseSelectDropdownOptions): UseSelectDropdownReturn {
    const { push, pop, isTop } = useOverlayStack(baseId);

    const menuPlacement = ref<"below" | "above">("below");
    const menuMaxHeight = ref<number | null>(null);

    const menuStyle = computed(() => {
        const style: Record<string, string> = {};
        if (menuMaxHeight.value !== null) {
            style.maxHeight = `${menuMaxHeight.value}px`;
        }
        if (menuPlacement.value === "above") {
            style.top = "auto";
            style.bottom = "100%";
        } else {
            style.top = "100%";
            style.bottom = "auto";
        }
        return style;
    });

    function updateMenuPlacement() {
        if (!open.value || !anchorRef.value) return;
        const rect = anchorRef.value.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const listboxFullHeight = listboxRef.value?.scrollHeight ?? 200;
        const minSpaceToOpenBelow = Math.min(200, listboxFullHeight);
        const gap = 8;

        if (spaceBelow >= minSpaceToOpenBelow) {
            menuPlacement.value = "below";
            menuMaxHeight.value = Math.max(0, Math.floor(spaceBelow - gap));
        } else if (spaceAbove > spaceBelow) {
            menuPlacement.value = "above";
            menuMaxHeight.value = Math.max(0, Math.floor(spaceAbove - gap));
        } else {
            menuPlacement.value = "below";
            menuMaxHeight.value = Math.max(0, Math.floor(spaceBelow - gap));
        }
    }

    let removeWindowListeners: (() => void) | null = null;

    function addWindowListeners() {
        if (removeWindowListeners) return;
        const onChange = () => updateMenuPlacement();
        window.addEventListener("resize", onChange, { passive: true });
        window.addEventListener("scroll", onChange, {
            passive: true,
            capture: true,
        });
        removeWindowListeners = () => {
            window.removeEventListener("resize", onChange);
            window.removeEventListener("scroll", onChange, true);
            removeWindowListeners = null;
        };
    }

    function removeListeners() {
        if (removeWindowListeners) removeWindowListeners();
    }

    watch(open, (val) => {
        if (val) {
            push();
            addWindowListeners();
            nextTick(() => updateMenuPlacement());
        } else {
            pop();
            removeListeners();
            menuPlacement.value = "below";
            menuMaxHeight.value = null;
        }
    });

    // useOverlayStack already registers onBeforeUnmount(pop); we only need
    // to ensure window listeners are cleaned up if the component is destroyed
    // while the dropdown is still open.
    onBeforeUnmount(() => {
        removeListeners();
    });

    function scrollOptionIntoView() {
        nextTick(() => {
            const el = document.getElementById(
                `${baseId}-option-${activeIndex.value}`,
            );
            if (el) el.scrollIntoView({ block: "nearest" });
        });
    }

    return {
        menuPlacement,
        menuStyle,
        isTop,
        scrollOptionIntoView,
    };
}
