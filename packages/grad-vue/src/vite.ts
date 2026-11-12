import type { Plugin } from "vite";

/** Placeholder in grad-vue's code that `appBuildVersion()` replaces with the version file URL. */
export const VERSION_URL_PLACEHOLDER = "globalThis.__GRAD_VUE_APP_VERSION_URL__";

export interface AppBuildVersionOptions {
    /** Name of the emitted version file. Defaults to `version.json`. */
    fileName?: string;
}

/**
 * Gives each production build a unique ID so `GAppUpdateNotice` can tell when a newer build
 * has been deployed.
 *
 * Adds `<meta name="app-build-id">` to `index.html` and emits a version file with the same ID.
 * Serve the version file without caching, e.g. in nginx:
 *
 * ```nginx
 * location = /version.json {
 *     add_header Cache-Control "no-store" always;
 *     try_files $uri =404;
 * }
 * ```
 */
export function appBuildVersion(options: AppBuildVersionOptions = {}): Plugin {
    const fileName = options.fileName ?? "version.json";
    const buildId = globalThis.crypto.randomUUID();
    let ssr = false;
    let referenceId: string | undefined;

    return {
        name: "grad-vue:app-build-version",
        apply: "build",
        configResolved(config) {
            ssr = Boolean(config.build.ssr);
        },
        buildStart() {
            if (!ssr) {
                referenceId = this.emitFile({ type: "asset", fileName, source: JSON.stringify({ buildId }) });
            }
        },
        transform(code, _id, transformOptions) {
            if (!referenceId || transformOptions?.ssr || !code.includes(VERSION_URL_PLACEHOLDER)) {
                return;
            }
            // Resolved relative to the chunk's own URL, so it works with any base and on any route
            return {
                code: code.split(VERSION_URL_PLACEHOLDER).join(`import.meta.ROLLUP_FILE_URL_${referenceId}`),
                map: null,
            };
        },
        transformIndexHtml() {
            return [{ tag: "meta", attrs: { name: "app-build-id", content: buildId }, injectTo: "head" }];
        },
    };
}
