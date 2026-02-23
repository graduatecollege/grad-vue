<script setup lang="ts">
/**
 * Client-side overlay for behind modal dialogs.
 */
import { useOverlayStackState } from "../compose/useOverlayStack.ts";

interface Props {

}

const { hasScrollLock } = useOverlayStackState();
</script>

<template>
    <Transition name="g-fade">
        <div v-if="hasScrollLock" class="g-scroll-lock-overlay"></div>
    </Transition>
</template>

<style>
@layer override {
    body.g-scroll-lock {
        overflow: hidden;
    }

    .g-scroll-lock-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.25);
        z-index: 199;
    }
}
</style>
