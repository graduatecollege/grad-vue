import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// Vite config for the web components test page (wc-test.html).
// We do NOT set features.customElement here. Without it, Vue compiles SFCs
// normally and Vite handles scoped CSS via its standard pipeline (injected
// as <style> elements in dev mode, extracted to a CSS file in build mode).
// defineCustomElement() still works on normally-compiled SFCs; the only
// difference is that the component's .styles array stays empty, which means
// Vue never tries to inject styles into shadow roots and emits no warnings.
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "@grad-vue": resolve(__dirname, "packages/grad-vue/src"),
            "@grad-vue-rte": resolve(__dirname, "packages/grad-vue-rte/src"),
        },
    },
});
