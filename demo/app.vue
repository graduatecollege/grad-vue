<script setup lang="ts">

import Main from "~/components/Main.vue";
</script>

<template>
    <Main></Main>
    <div id="modal-root" role="region" aria-label="Overlays and Modals"></div>
</template>

<style>
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: var(--il-font-sans);
    background: #fff;
}
</style>
