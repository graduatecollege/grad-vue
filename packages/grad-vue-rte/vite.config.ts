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
            entry: [resolve(__dirname, "src/grad-vue-rte.ts"), resolve(__dirname, "src/plugin.ts")],
            formats: ["es"],
            fileName(format, name) {
                return name + '.js';
            },
            name: "grad-vue-rte",
        },
        rollupOptions: {
            external: [
                "vue",
                "@tiptap/core",
                "@tiptap/vue-3",
                "@tiptap/extension-document",
                "@tiptap/extension-paragraph",
                "@tiptap/extension-text",
                "@tiptap/extension-bold",
                "@tiptap/extension-italic",
                "@tiptap/extension-list",
                "@tiptap/extension-placeholder",
                "@tiptap/extensions",
                "@tiptap/vue-3/menus",
            ],
        },
    },
});
