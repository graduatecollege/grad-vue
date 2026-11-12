import { ref } from "vue";
import { useEventListener, useIntervalFn } from "@vueuse/core";

/** Name of the `<meta>` tag that `appBuildVersion()` from `@illinois-grad/grad-vue/vite` adds to `index.html`. */
export const APP_BUILD_ID_META = "app-build-id";

export interface AppUpdateCheckOptions {
    /** Milliseconds between checks while the tab is visible. Defaults to 10 minutes. */
    intervalMs?: number;
    /** URL of the deployed build's version file. Defaults to the one set by `appBuildVersion()`. */
    versionUrl?: string;
    /** Build ID of the running app. Defaults to the one set by `appBuildVersion()`. */
    currentBuildId?: string;
}

const isClient = typeof window !== "undefined" && typeof document !== "undefined";

interface BuildInfo {
    buildId?: string;
    versionUrl?: string;
}

function readBuildInfo(): BuildInfo {
    const meta = document.querySelector<HTMLMetaElement>(`meta[name="${APP_BUILD_ID_META}"]`);
    return {
        buildId: meta?.content || undefined,
        // Replaced by appBuildVersion() at build time; undefined otherwise
        versionUrl: (globalThis as { __GRAD_VUE_APP_VERSION_URL__?: string }).__GRAD_VUE_APP_VERSION_URL__,
    };
}

/**
 * Detects that a newer build was deployed while this tab stayed open, so the user can reload
 * instead of running stale code against an updated API.
 *
 * Checks when the tab regains focus or visibility, and periodically while it is visible.
 * Does nothing unless the app is built with `appBuildVersion()` from `@illinois-grad/grad-vue/vite`,
 * or `currentBuildId` and `versionUrl` are given.
 */
export function useAppUpdateCheck(options: AppUpdateCheckOptions = {}) {
    const buildInfo: BuildInfo = isClient ? readBuildInfo() : {};
    const intervalMs = options.intervalMs ?? 10 * 60 * 1000;
    const currentBuildId = options.currentBuildId ?? buildInfo.buildId;
    const versionUrl = options.versionUrl ?? buildInfo.versionUrl;
    const enabled = isClient && Boolean(currentBuildId && versionUrl);

    const updateAvailable = ref(false);
    let checking = false;

    async function check() {
        if (!enabled || updateAvailable.value || checking || document.visibilityState !== "visible") {
            return;
        }
        checking = true;
        try {
            const response = await fetch(versionUrl!, { cache: "no-store" });
            if (!response.ok) {
                return;
            }
            const { buildId } = (await response.json()) as { buildId?: unknown };
            if (typeof buildId === "string" && buildId !== currentBuildId) {
                updateAvailable.value = true;
            }
        } catch {
            // Offline or mid-deploy; the next check retries.
        } finally {
            checking = false;
        }
    }

    if (enabled) {
        useEventListener(document, "visibilitychange", check);
        useEventListener(window, "focus", check);
        useIntervalFn(check, intervalMs);
    }

    function reload() {
        window.location.reload();
    }

    return { updateAvailable, check, reload };
}

const STALE_CHUNK_RELOAD_KEY = "g-app-update:stale-chunk-reload-at";

/**
 * Reloads once when a lazily loaded chunk is missing because a newer build replaced it.
 * A second failure shortly after a reload is left to surface instead of looping.
 *
 * Call it once at startup, e.g. in `main.ts`.
 */
export function reloadOnStaleChunks() {
    if (!isClient) {
        return;
    }
    window.addEventListener("vite:preloadError", (event) => {
        try {
            const lastReloadAt = Number(sessionStorage.getItem(STALE_CHUNK_RELOAD_KEY) ?? 0);
            if (Date.now() - lastReloadAt < 10_000) {
                return;
            }
            sessionStorage.setItem(STALE_CHUNK_RELOAD_KEY, String(Date.now()));
        } catch {
            return;
        }
        event.preventDefault();
        window.location.reload();
    });
}
