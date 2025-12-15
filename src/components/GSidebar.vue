<script setup lang="ts">

interface Props {
    backgroundColor?: string;
    backgroundImage?: string;
}

const props = withDefaults(defineProps<Props>(), {
    backgroundColor: "#030913",
    backgroundImage: "url('https://gradcdn.blob.core.windows.net/public/sidebar-bg2.jpg')"
});

</script>

<template>
    <div class="g-sidebar" :style="{
        backgroundImage,
        backgroundColor
    }">
        <slot></slot>
    </div>
</template>

<style scoped>
.g-sidebar {
    background-size: cover;
    background-position: top;
}
</style>
