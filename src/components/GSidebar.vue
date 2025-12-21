<script setup lang="ts">
import { computed } from "vue";

interface Props {
    backgroundColor?: string;
    backgroundImage?: string;
    theme?: "light" | "dark";
}

const props = withDefaults(defineProps<Props>(), {
    backgroundColor: "",
    backgroundImage: "",
    theme: "dark",
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
</script>

<template>
    <div
        class="g-sidebar"
        :class="`g-sidebar__${theme}`"
        :style="{
            backgroundImage: bgImage,
            backgroundColor: bgColor,
        }"
    >
        <slot></slot>
    </div>
</template>

<style scoped>
.g-sidebar {
    background-size: cover;
    background-position: top;
}
</style>
