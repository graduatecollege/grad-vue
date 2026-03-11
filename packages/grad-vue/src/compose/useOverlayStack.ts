import { computed, onBeforeUnmount, Ref, ref, useId } from "vue";

const OVERLAY_Z_INDEX_BASE = 100;
const MODAL_Z_INDEX_BASE = 200;
const DEFAULT_TOOLTIP_Z_INDEX = 102;

export type OverlayStack = {
    push: () => void;
    pop: () => void;
    isTop: Ref<boolean>;
    zIndex: Ref<number>;
}

// add _g_state to window typescript type
declare global {
    interface Window {
        _g_overlay_stack_state: {
            stack: Ref<string[]>;
            modalStack: Ref<string[]>;
            scrollLockStack: Ref<string[]>;
            updateBodyScrollLock: () => void;
        };
    }
}

function setupStackState() {
    if (!window._g_overlay_stack_state) {
        window._g_overlay_stack_state = {
            stack: ref<string[]>([]),
            modalStack: ref<string[]>([]),
            scrollLockStack: ref<string[]>([]),
            updateBodyScrollLock() {
                if (typeof document !== "undefined") {
                    if (scrollLockStack.value.length > 0) {
                        // Account for possible vertical scrollbar reducing viewport width
                        const scrollbarWidth =
                            window.innerWidth -
                            document.documentElement.clientWidth;
                        document.body.classList.add("g-scroll-lock");
                        document.body.style.paddingRight = `${scrollbarWidth}px`;
                        document.body.style.setProperty('--g-scrollbar-width', `${scrollbarWidth}px`);
                    } else {
                        document.body.style.paddingRight = `0`;
                        document.body.classList.remove("g-scroll-lock");
                        document.body.style.removeProperty('--g-scrollbar-width');
                    }
                }
            },
        };
    }

    const { stack, modalStack, scrollLockStack, updateBodyScrollLock } =
        window._g_overlay_stack_state;

    return { stack, modalStack, scrollLockStack, updateBodyScrollLock };
}

export function useOverlayStack(id: string, modal = false, lockScroll = false): OverlayStack {
    if (!document) {
        return {} as any;
    }

    const { stack, modalStack, scrollLockStack, updateBodyScrollLock } =
        setupStackState();

    const stackRef = modal ? modalStack : stack;
    function push() {
        stackRef.value.push(id);
        if (lockScroll && !scrollLockStack.value.includes(id)) {
            scrollLockStack.value.push(id);
            updateBodyScrollLock();
        }
    }
    function pop() {
        const idx = stackRef.value.lastIndexOf(id);
        if (idx !== -1) {
            stackRef.value.splice(idx, 1);
        }
        const lockIdx = scrollLockStack.value.lastIndexOf(id);
        if (lockIdx !== -1) {
            scrollLockStack.value.splice(lockIdx, 1);
            updateBodyScrollLock();
        }
    }
    const isTop = computed(() => {
        if (!modal && modalStack.value.length > 0) {
            return false;
        }
        return (
            stackRef.value.length > 0 &&
            stackRef.value[stackRef.value.length - 1] === id
        );
    });
    const zIndex = computed(() => {
        const pos = stackRef.value.indexOf(id);
        return pos === -1 ? 0 : (modal ? MODAL_Z_INDEX_BASE : OVERLAY_Z_INDEX_BASE) + pos;
    });

    onBeforeUnmount(pop);

    return { push, pop, isTop, zIndex };
}

export type OverlayStackState = {
    hasModal: Ref<boolean>;
    hasOverlay: Ref<boolean>;
    hasScrollLock: Ref<boolean>;
};

export function useOverlayStackState(): OverlayStackState {
    if (!document) {
        return {} as any;
    }

    const { stack, modalStack, scrollLockStack, updateBodyScrollLock } =
        setupStackState();

    const hasModal = computed(() => modalStack.value.length > 0);
    const hasOverlay = computed(
        () => stack.value.length > 0 || modalStack.value.length > 0,
    );
    const hasScrollLock = computed(() => {
        return scrollLockStack.value.length > 0;
    });
    return { hasModal, hasOverlay, hasScrollLock };
}

/**
 * Returns a z-index value that is above all currently open overlays.
 * Uses the same base values as useOverlayStack: 100 + pos for non-modal,
 * 200 + pos for modal. Falls back to DEFAULT_TOOLTIP_Z_INDEX when no
 * overlays are open.
 *
 * This function can be called outside of a Vue component setup context,
 * which makes it suitable for use in Vue directives.
 */
export function getTopZIndex(): number {
    if (typeof window === "undefined" || !window._g_overlay_stack_state) {
        return DEFAULT_TOOLTIP_Z_INDEX;
    }
    const { stack, modalStack } = window._g_overlay_stack_state;
    let max = 0;
    stack.value.forEach((_, idx) => {
        max = Math.max(max, OVERLAY_Z_INDEX_BASE + idx);
    });
    modalStack.value.forEach((_, idx) => {
        max = Math.max(max, MODAL_Z_INDEX_BASE + idx);
    });
    return max > 0 ? max + 1 : DEFAULT_TOOLTIP_Z_INDEX;
}
