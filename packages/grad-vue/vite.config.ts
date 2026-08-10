import { defineConfig } from "vite";
// @ts-ignore Not sure why WebStorm is complaining about this line
import vue from "@vitejs/plugin-vue";
import dts from 'vite-plugin-dts'
import { resolve } from "path";

export default defineConfig({
    plugins: [vue(), dts({ exclude: ['**/grad-vue-elements.ts', '**/web-components.ts'] })],
    build: {
        sourcemap: true,
        lib: {
            entry: [resolve(import.meta.dirname, "src/grad-vue.ts"), resolve(import.meta.dirname, "src/plugin.ts")],
            formats: ["es"],
            fileName(format, name) {
                return name + '.js';
            },
            name: "grad-vue",
        },
        rollupOptions: {
            external: [
                "vue",
                "@vueuse/core",
                "@vueuse/integrations",
                "focus-trap",
            ],
        },
    },
});
