import type { Plugin } from "vite";

/**
 * Vite plugin that extracts component CSS from Vue's custom element inline
 * style modules and emits them into the CSS output file instead.
 *
 * When Vue compiles SFCs with `customElement: true`, component styles are
 * inlined as JS string constants and attached to each component's `styles`
 * array.  At runtime the entry script then collects those strings and injects
 * a `<style>` tag into `<head>`, which causes a flash of unstyled content
 * because the CSS only becomes available after the JS has been parsed and
 * executed.
 *
 * This plugin intercepts the inline style virtual modules (identifiable by
 * the `?vue&type=style&…&inline` query string that `@vitejs/plugin-vue`
 * adds) **after** the Vue plugin has already compiled them.  It:
 *
 *   1. Extracts the CSS text from the `export default "…"` that the Vue
 *      plugin produces.
 *   2. Collects it into an internal buffer.
 *   3. Replaces the module's export with an empty string so the JS bundle
 *      no longer carries inline CSS.
 *   4. In the `generateBundle` hook, appends all collected CSS to the
 *      existing CSS asset (which already contains global styles from
 *      `main.css`).
 *
 * The result is a single CSS file that contains **all** styles – global and
 * per-component (including scoped selectors) – which can be loaded via a
 * regular `<link>` tag and is available before JS executes.
 */
export function extractCustomElementStyles(): Plugin {
    const collectedCSS: string[] = [];

    return {
        name: "extract-ce-styles",
        enforce: "post",

        transform(code: string, id: string) {
            if (!id.includes("type=style") || !id.includes("inline")) {
                return;
            }

            const match = code.match(/export\s+default\s+("(?:[^"\\]|\\.)*")/s);
            if (!match) {
                return;
            }

            let css: string;
            try {
                css = JSON.parse(match[1]);
            } catch {
                return;
            }

            if (css && css.trim()) {
                collectedCSS.push(css);
            }

            return { code: 'export default ""', map: null };
        },

        generateBundle(_, bundle) {
            if (collectedCSS.length === 0) {
                return;
            }

            const componentCSS = collectedCSS.join("\n");

            for (const fileName in bundle) {
                const asset = bundle[fileName];
                if (asset.type === "asset" && fileName.endsWith(".css")) {
                    asset.source += "\n" + componentCSS;
                    return;
                }
            }

            this.emitFile({
                type: "asset",
                fileName: "grad-vue-elements.css",
                source: componentCSS,
            });
        },
    };
}
