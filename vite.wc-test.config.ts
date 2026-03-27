import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// Vite config for the web components test page (wc-test.html)
export default defineConfig({
    plugins: [
        vue({
            features: {
                customElement: true,
            },
        }),
    ],
    resolve: {
        alias: {
            "@grad-vue": resolve(__dirname, "packages/grad-vue/src"),
            "@grad-vue-rte": resolve(__dirname, "packages/grad-vue-rte/src"),
        },
    },
});
