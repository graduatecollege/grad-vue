<script lang="ts">
/**
 * The `<main>` landmark for a page, set up as the target for
 * `GSkipLink` and `useRouteAnnouncer`.
 *
 * Use one per page, inside each view rather than around `<RouterView>`,
 * so sidebars and other complementary content stay outside the landmark.
 *
 * ```vue
 * <template>
 *     <GSidebar>...</GSidebar>
 *     <GMain class="profile">
 *         <h1>Profile</h1>
 *     </GMain>
 * </template>
 * ```
 *
 * ## Accessible route changes
 *
 * Use the `useRouteAnnouncer` composable once in the root component.
 * After each navigation to a different page, it moves focus to the `<h1>`
 * inside `GMain` (or `GMain` itself) and announces the new page title.
 * Navigations that only change the query or hash are ignored.
 *
 * ```ts
 * // App.vue setup
 * import { useRouter } from "vue-router";
 * import { useRouteAnnouncer } from "@illinois-grad/grad-vue";
 *
 * useRouteAnnouncer(useRouter());
 * ```
 *
 * ```vue
 * <GSkipLink />
 * <GAppHeader>...</GAppHeader>
 * <RouterView />
 * ```
 *
 * Options can customize what counts as a new page (`isNewPage`), when focus
 * moves (`focus`), waiting for async page data (`ready`), and the
 * announcement text (`message`).
 */
export default {};
</script>

<script setup lang="ts">
type Props = {
    /**
     * Id used by `GSkipLink` and `useRouteAnnouncer` to find the landmark
     */
    id?: string;
};

const props = withDefaults(defineProps<Props>(), {
    id: "main-content",
});
</script>

<template>
    <main :id="props.id" class="g-main">
        <slot />
    </main>
</template>

<style scoped>
.g-main:focus:not(:focus-visible) {
    outline: none;
}
</style>
