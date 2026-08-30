<script lang="ts">
/**
 * A hamburger menu button that toggles a sidebar, intended for the
 * GAppHeader and GSidebar components.
 *
 * When `mode="popover"`, the default slot becomes the popover content.
 *
 * <span id="use-sidebar">Use with the `useSidebar`</span> composable function
 * that takes care of passing state between the different components.
 *
 * Here's an example, this could be your App.vue or a layout file:
 *
 * ```vue
 * <script setup lang="ts">
 * import { computed, h, onMounted, provide, ref, useTemplateRef } from "vue";
 * import { useSidebar } from "../src/compose/useSidebar";
 *
 * const sidebar = useSidebar();
 * provide("sidebar", sidebar);
 *
 * // Or optionally a custom breakpoint
 * // const sidebar = useSidebar("(max-width: 600px)");
 * &lt;/script>
 * ```
 *
 * As long as GHamburgerMenu and GSidebar are descendants of the component that
 * provides the sidebar, they will be able to communicate with each other.
 *
 * > [!NOTE]
 * > This button hides itself automatically according to the useSidebar media query.
 * > In web components mode, use the `sidebar-key` prop to pair this menu with a
 * > matching GSidebar instance and `media-query` to set the collapsible breakpoint.
 */
export default {};
</script>

<script setup lang="ts">
import { useSidebar } from "../compose/useSidebar.ts";
import { useWebComponentSidebar } from "../compose/useWebComponentSidebar.ts";
import { isCustomElementMode } from "../compose/useCustomElementAttrs.ts";
import {
    getFocusableElements,
    getFocusedItemIndex as findFocusedItemIndex,
} from "../compose/focusable.ts";
import GPopover from "./GPopover.vue";
import GHamburgerMenuButton from "./hamburger/GHamburgerMenuButton.vue";
import {
    computed,
    inject,
    nextTick,
    ref,
    toRef,
    useId,
    useTemplateRef,
    watch,
} from "vue";

type Props = {
    /**
     * Accessible label
     * @demo
     */
    label?: string;
    /**
     * Sidebar channel key for custom elements mode
     * @demo
     */
    sidebarKey?: string;
    /**
     * Sidebar media query for custom elements mode
     * @demo
     */
    mediaQuery?: string;

    /**
     * Show a visible label
     * @demo
     */
    labelVisible?: boolean;
    /**
     * Whether the menu controls a sidebar or shows a popover
     * @demo
     */
    mode?: "sidebar" | "popover";
    /**
     * Open state for popover mode
     */
    modelValue?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
    label: "Main Navigation",
    sidebarKey: "default",
    labelVisible: false,
    mode: "sidebar",
    modelValue: false,
});

const injectedSidebar = inject<ReturnType<typeof useSidebar> | undefined>(
    "sidebar",
    undefined,
);
const sidebar =
    injectedSidebar ??
    (isCustomElementMode()
        ? useWebComponentSidebar(props.sidebarKey, toRef(props, "mediaQuery"))
        : undefined);

const emit = defineEmits<{
    toggle: [];
    "update:modelValue": [value: boolean];
}>();

const isPopover = computed(() => props.mode === "popover");
const popoverOpen = ref(props.modelValue);
watch(toRef(props, "modelValue"), (value) => {
    popoverOpen.value = value;
});

const triggerButtonRef = useTemplateRef<InstanceType<
    typeof GHamburgerMenuButton
> | null>("triggerButtonRef");
const popoverMenuRef = useTemplateRef<HTMLElement | null>("popoverMenuRef");

function setPopoverOpen(value: boolean) {
    if (popoverOpen.value === value) {
        return;
    }

    popoverOpen.value = value;
    emit("update:modelValue", value);
}

function show() {
    if (isPopover.value) {
        setPopoverOpen(true);
        return;
    }

    if (sidebar?.open) {
        sidebar.open.value = true;
    }
}

function hide() {
    if (isPopover.value) {
        setPopoverOpen(false);
        return;
    }

    if (sidebar?.open) {
        sidebar.open.value = false;
    }
}

function toggle() {
    emit("toggle");

    if (isPopover.value) {
        setPopoverOpen(!popoverOpen.value);
        return;
    }

    sidebar?.toggle();
}

// Close menu on escape
function handleEscapeKey(event: KeyboardEvent) {
    if (event.key === "Escape") {
        hide();
    }
}

const fallbackId = useId();
const triggerId = computed(() => `${sidebar?.id ?? fallbackId}-hamburger`);
const expanded = computed(() =>
    isPopover.value ? popoverOpen.value : !!sidebar?.open?.value,
);
const controlsId = computed(() =>
    isPopover.value
        ? `${fallbackId}-popover`
        : sidebar
          ? `${sidebar.id}-sidebar`
          : undefined,
);

function getFocusedItemIndex() {
    return findFocusedItemIndex(getFocusableElements(popoverMenuRef.value));
}

async function focusItem(index: number) {
    if (index < 0) {
        return false;
    }

    await nextTick();

    const item = getFocusableElements(popoverMenuRef.value)[index];

    if (!item) {
        return false;
    }

    item.focus();
    return true;
}

function focusTrigger() {
    triggerButtonRef.value?.focus();
}

defineExpose({
    show,
    hide,
    toggle,
    focusItem,
    focusTrigger,
    getFocusedItemIndex,
});
</script>
<template>
    <GPopover
        v-if="isPopover"
        minimal
        :model-value="popoverOpen"
        @update:modelValue="setPopoverOpen"
    >
        <template #trigger>
            <GHamburgerMenuButton
                ref="triggerButtonRef"
                :id="triggerId"
                :controls-id="controlsId"
                :expanded="expanded"
                :label="label"
                :label-visible="labelVisible"
                popover
                @click="toggle"
                @keydown="handleEscapeKey"
            />
        </template>
        <div :id="controlsId" ref="popoverMenuRef" class="g-hamburger-popover">
            <slot></slot>
        </div>
    </GPopover>
    <GHamburgerMenuButton
        v-else
        ref="triggerButtonRef"
        :id="triggerId"
        :controls-id="controlsId"
        :expanded="expanded"
        :label="label"
        :label-visible="labelVisible"
        :collapsible="sidebar?.isCollapsible?.value"
        @click="toggle"
        @keydown="handleEscapeKey"
    />
</template>

<style>
g-hamburger-menu:not(:defined) {
    display: none;
}

.g-hamburger-button {
    min-width: 34px;
    height: 34px;
    padding: 0;
    display: none;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    column-gap: 0.25rem;
    border: 2px solid var(--g-primary-500);
    background: var(--g-primary-500);
    color: var(--g-primary-text);
    border-radius: 4px;
    cursor: pointer;

    svg {
        width: 1.6rem;
    }

    &:hover {
        background: var(--g-primary-text);
        color: var(--g-primary-500);
    }
    &:active {
        background: var(--g-accent-500);
        color: var(--g-primary-text);
    }
    &:focus-visible {
        color: var(--ilw-color--focus--text);
        background: var(--ilw-color--focus--background);
        outline-color: var(--g-primary-500);
    }
}
.g-hamburger-label {
    font-size: 20px;
    font-weight: 600;
    display: block;
    text-transform: uppercase;
    margin-right: 0.35rem;
}
.g-hamburger-popover {
    display: block;
}
.g-hamburger-button--collapsible,
.g-hamburger-button--popover {
    display: flex;
}
</style>
