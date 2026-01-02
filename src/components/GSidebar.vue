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
 */
import { computed } from "vue";

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
</script>

<template>
    <div
        class="g-sidebar"
        :class="`g-sidebar__${theme}`"
        :style="{
            backgroundImage: bgImage,
            backgroundColor: bgColor,
            '--g-sidebar-top-offset': topOff,
            width: width ?? '300px',
        }"
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
    top: var(--g-sidebar-top-offset);
    height: calc(100vh - var(--g-sidebar-top-offset));
    width: var(--g-sidebar-width, 300px);
}
</style>
