<script lang="ts">
/**
 * Tells users that a newer version of the app has been deployed while their tab
 * stayed open, and offers to refresh the page.
 *
 * Build the app with the `appBuildVersion()` Vite plugin, which gives each build
 * a unique ID. The notice checks the deployed version when the tab regains focus
 * or visibility, and every 10 minutes while it is visible. It does nothing in
 * development or without the plugin.
 *
 * ```ts
 * // vite.config.ts
 * import { appBuildVersion } from "@illinois-grad/grad-vue/vite";
 *
 * export default defineConfig({
 *     plugins: [vue(), appBuildVersion()],
 * });
 * ```
 *
 * ```vue
 * <GAppUpdateNotice />
 * ```
 *
 * Serve `version.json` with `Cache-Control: no-store`, and optionally call
 * `reloadOnStaleChunks()` at startup to recover from lazily loaded chunks that
 * a deploy removed.
 */
export default {};
</script>

<script setup lang="ts">
import { ref } from "vue";
import GButton from "./GButton.vue";
import { useAppUpdateCheck } from "../compose/useAppUpdateCheck.ts";

type Props = {
    /**
     * Message shown when an update is available
     * @demo
     */
    message?: string;
    /**
     * Refresh button text
     * @demo
     */
    reloadLabel?: string;
    /**
     * Dismiss button text
     * @demo
     */
    dismissLabel?: string;
    /**
     * Milliseconds between checks while the tab is visible
     */
    intervalMs?: number;
    /**
     * URL of the deployed version file, defaults to the one set by `appBuildVersion()`
     */
    versionUrl?: string;
    /**
     * Build ID of the running app, defaults to the one set by `appBuildVersion()`
     */
    currentBuildId?: string;
};

const props = withDefaults(defineProps<Props>(), {
    message: "This app has been updated. Refresh the page to see the latest changes.",
    reloadLabel: "Refresh page",
    dismissLabel: "Not now",
    intervalMs: 10 * 60 * 1000,
});

const { updateAvailable, check, reload } = useAppUpdateCheck({
    intervalMs: props.intervalMs,
    versionUrl: props.versionUrl,
    currentBuildId: props.currentBuildId,
});
const dismissed = ref(false);

defineExpose({
    /** Checks for a new version immediately */
    check,
});
</script>

<template>
    <!-- The live region stays mounted so the notice is announced when it appears -->
    <div role="status">
        <div v-if="updateAvailable && !dismissed" class="g-app-update-notice">
            <span>{{ props.message }}</span>
            <div class="g-app-update-notice__actions">
                <GButton size="small" theme="accent" @click="reload">{{ props.reloadLabel }}</GButton>
                <GButton size="small" theme="primary" outlined @click="dismissed = true">
                    {{ props.dismissLabel }}
                </GButton>
            </div>
        </div>
    </div>
</template>

<style scoped>
.g-app-update-notice {
    position: fixed;
    z-index: 20;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    width: fit-content;
    margin-inline: auto;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    box-sizing: border-box;
    padding: 0.75rem 1rem;
    color: var(--g-primary-text);
    background: var(--g-primary-500);
    border-radius: var(--g-border-radius-m);
    box-shadow: 0 4px 12px rgb(0 0 0 / 20%);
}

.g-app-update-notice__actions {
    display: flex;
    gap: 0.5rem;
}

@media print {
    .g-app-update-notice {
        display: none;
    }
}
</style>
