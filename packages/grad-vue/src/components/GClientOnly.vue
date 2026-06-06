<script setup lang="ts">
import { ref, onMounted } from "vue";

const isMounted = ref(false);

onMounted(() => {
    isMounted.value = true;
});
</script>

<template>
    <slot v-if="isMounted" />
    <!-- Renders an empty comment placeholder on server to match client initial pass -->
    <slot v-else name="fallback" />
</template>
