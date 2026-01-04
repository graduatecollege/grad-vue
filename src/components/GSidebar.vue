<script setup lang="ts">
/**
 * A simple sidebar that's fixed to the left side of the viewport.
 *
 * This includes the CSS for the `fixed` position and sizing, so the element
 * should be fairly high in the DOM tree.
 *
 * If neither `top-offset` nor `top-offset-var` are defined, the sidebar will be
 * offset by `var(--g-toolbar-height)`. If there is no toolbar, just pass
 * `0` as the `top-offset`.
 *
 * The sidebar can be made collapsible by providing the `sidebar` injected
 * object from `useSidebar`. See the [Hamburger Menu Documentation](#use-sidebar)
 * for details.
 */
import {
    computed,
    inject,
    nextTick,
    onBeforeUnmount,
    onMounted, useId,
    useTemplateRef,
    watch,
} from "vue";
import { onClickOutside, useMediaQuery } from "@vueuse/core";
import { useSidebar } from "../compose/useSidebar.ts";

interface Props {
    /**
     * Custom background color
     */
    backgroundColor?: string;
    /**
     * Custom background image
     */
    backgroundImage?: string; // Demo: none
    /**
     * Sidebar theme
     */
    theme?: "light" | "dark";
    // Offset from the top of the viewport
    topOffset?: string;
    // Top offset variable to use instead of topOffset
    topOffsetVar?: string;
    /**
     * Width
     *
     * Width of the sidebar
     */
    width?: string;
}

const props = withDefaults(defineProps<Props>(), {
    backgroundColor: "",
    backgroundImage: "none",
    theme: "dark",
    width: "300px",
    topOffset: "",
    topOffsetVar: "",
});

const sidebar = inject<ReturnType<typeof useSidebar>>("sidebar");

const bgImage = computed(() => {
    if (props.backgroundImage) {
        return props.backgroundImage;
    }
    if (props.theme === "light") {
        return "none";
    }
    return "url('https://gradcdn.blob.core.windows.net/public/sidebar-bg2.jpg')";
});

const bgColor = computed(() => {
    if (props.backgroundColor) {
        return props.backgroundColor;
    }
    if (props.theme === "light") {
        return "#f9f9f9";
    }
    return "#030913";
});

const topOff = computed(() => {
    if (props.topOffsetVar) {
        return `var(${props.topOffsetVar})`;
    }
    return props.topOffset ? props.topOffset : "var(--g-toolbar-height)";
});

const fallbackId = useId();

function handleEscapeKey(event: KeyboardEvent) {
    if (event.key === "Escape") {
        if (sidebar?.isCollapsible?.value && sidebar?.open?.value) {
            sidebar.open.value = false;
            document.getElementById(`${sidebar.id}-hamburger`)?.focus();
        }
    }
}

</script>

<template>
    <div
        ref="sidebar-ref"
        :id="`${sidebar?.id ?? fallbackId}-sidebar`"
        class="g-sidebar"
        :class="[
            `g-sidebar__${theme}`,
            {
                'g-sidebar--collapsible': sidebar?.isCollapsible?.value,
                'g-sidebar--closed':
                    !sidebar?.open?.value && sidebar?.isCollapsible?.value,
                'g-sidebar--open': sidebar?.open?.value && sidebar?.isCollapsible?.value,
            },
        ]"
        :style="{
            backgroundImage: bgImage,
            backgroundColor: bgColor,
            '--g-sidebar-top-offset': topOff,
            '--g-sidebar-width': width ?? '300px',
            width: 'var(--g-sidebar-width)',
        }"
        @keydown="handleEscapeKey"
    >
        <slot></slot>
    </div>
</template>

<style scoped>
.g-sidebar {
    box-sizing: border-box;
    background-size: cover;
    background-position: top;
    position: fixed;
    left: 0;
    /*noinspection CssUnresolvedCustomProperty*/
    top: var(--g-sidebar-top-offset);
    /*noinspection CssUnresolvedCustomProperty*/
    height: calc(100vh - var(--g-sidebar-top-offset));
    /*noinspection CssUnresolvedCustomProperty*/
    width: var(--g-sidebar-width, 300px);
}
.g-sidebar--open {
    transition: opacity 0.1s ease-out;
    opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
    .g-sidebar--open {
        transition: none;
    }
}

.g-sidebar--closed {
    display: none;
}
.g-sidebar--collapsible {
    height: 100vh;
    top: 0;
    z-index: 198;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1), 0 0 10px rgba(0, 0, 0, 0.1);
}
@starting-style {
    .g-sidebar {
        opacity: 0;
    }
}
</style>
