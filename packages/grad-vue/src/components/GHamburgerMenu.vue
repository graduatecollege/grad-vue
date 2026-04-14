<script lang="ts">
/**
 * A hamburger menu button that toggles a sidebar, intended for the
 * GAppHeader and GSidebar components.
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
 * > matching GSidebar instance.
 */
export default {};
</script>

<script setup lang="ts">
import { useSidebar } from "../compose/useSidebar.ts";
import { useWebComponentSidebar } from "../compose/useWebComponentSidebar.ts";
import { isCustomElementMode } from "../compose/useCustomElementAttrs.ts";
import { inject, useId } from "vue";

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
}

const props = withDefaults(defineProps<Props>(), {
    label: "Main Navigation",
    sidebarKey: "default",
});

const injectedSidebar = inject<ReturnType<typeof useSidebar>>("sidebar");
const sidebar =
    injectedSidebar ??
    (isCustomElementMode() ? useWebComponentSidebar(props.sidebarKey) : undefined);

const emit = defineEmits<{
    toggle: [];
}>();

function toggle() {
    emit("toggle");
    sidebar?.toggle();
}

// Close menu on escape
function handleEscapeKey(event: KeyboardEvent) {
    if (event.key === "Escape") {
        if (sidebar?.open?.value) {
            sidebar.open.value = false;
        }
    }
}

const fallbackId = useId();
</script>
<template>
    <button
        :id="`${sidebar?.id ?? fallbackId}-hamburger`"
        class="g-hamburger-button"
        :class="{
            'g-hamburger-button--open': sidebar?.open?.value,
            'g-hamburger-button--collapsible': sidebar?.isCollapsible?.value
        }"
        @click="toggle"
        @keydown="handleEscapeKey"
        :aria-expanded="sidebar?.open?.value ? 'true' : 'false'"
        :aria-label="label"
        :aria-controls="sidebar ? `${sidebar.id}-sidebar` : undefined"
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51.26 51.26">
            <g fill="currentColor">
                <path
                    d="M11.6 16.52h28.06a3.24 3.24 0 1 0 0-6.48H11.6a3.24 3.24 0 0 0 0 6.48ZM39.66 22.07H11.6a3.24 3.24 0 0 0 0 6.48h28.06a3.24 3.24 0 1 0 0-6.48ZM39.66 34.1H11.6a3.24 3.24 0 0 0 0 6.48h28.06a3.24 3.24 0 1 0 0-6.48Z"
                />
            </g>
        </svg>
    </button>
</template>

<style>
g-hamburger-menu:not(:defined) {
    display: none;
}

.g-hamburger-button {
    svg {
        width: 1.6rem;
    }
}
.g-hamburger-button {
    width: 34px;
    height: 34px;
    padding: 0;
    display: none;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    border: 2px solid var(--g-primary-500);
    background: var(--g-primary-500);
    color: var(--g-primary-text);
    border-radius: 4px;
    cursor: pointer;

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
.g-hamburger-button--collapsible {
    display: flex;
}
</style>
