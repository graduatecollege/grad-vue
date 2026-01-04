import { computed, onBeforeUnmount, Ref, ref, useId } from "vue";

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
                    } else {
                        document.body.style.paddingRight = `0`;
                        document.body.classList.remove("g-scroll-lock");
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
        return pos === -1 ? 0 : (modal ? 200 : 100) + pos;
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
