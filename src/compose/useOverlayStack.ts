import { ref, useId, onBeforeUnmount, computed } from "vue";

const stack = ref<string[]>([]);
const modalStack = ref<string[]>([]);

export function useOverlayStack(modal = false) {
    const id = useId();
    const stackRef = modal ? modalStack : stack;
    function push() {
        stackRef.value.push(id);
    }
    function pop() {
        const idx = stackRef.value.lastIndexOf(id);
        if (idx !== -1) {
            stackRef.value.splice(idx, 1);
        }
    }
    const isTop = computed(() => {
        if (!modal && modalStack.value.length > 0) {
            return false;
        }
        return stackRef.value.length > 0 && stackRef.value[stackRef.value.length - 1] === id;
    });
    onBeforeUnmount(pop);
    return { push, pop, isTop, id };
}

export function useOverlayStackState() {
    const hasModal = computed(() => modalStack.value.length > 0);
    const hasOverlay = computed(() => stack.value.length > 0 || modalStack.value.length > 0);
    return { hasModal, hasOverlay };
}
