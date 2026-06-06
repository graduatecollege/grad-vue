<script setup lang="ts">
import { ref, onMounted } from "vue";
import { isCustomElementMode } from "../compose/useCustomElementAttrs.ts";

// We're not concerned with SSR in web-components mode, hence isCustomElementMode()
const isMounted = ref(isCustomElementMode());

onMounted(() => {
    isMounted.value = true;
});
</script>

<template>
    <slot v-if="isMounted" />
    <!-- Renders an empty comment placeholder on server to match client initial pass -->
    <slot v-else name="fallback" />
</template>
