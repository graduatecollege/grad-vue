import { defineConfig } from "vite";
// @ts-ignore Not sure why WebStorm is complaining about this line
import vue from "@vitejs/plugin-vue";
import dts from 'vite-plugin-dts'
import { resolve } from "path";

export default defineConfig({
    plugins: [vue(), dts()],
    build: {
        sourcemap: true,
        lib: {
            entry: resolve(__dirname, "src/grad-vue.ts"),
            formats: ["es"],
            fileName: "grad-vue",
            name: "grad-vue",
        },
        rollupOptions: {
            external: ["vue", "@vueuse/core", "@vueuse/integrations", "focus-trap"],
        },
    },
});
