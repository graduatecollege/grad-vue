import { defineConfig } from "vite";
// @ts-ignore Not sure why WebStorm is complaining about this line
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
    plugins: [vue({ customElement: true })],
    build: {
        sourcemap: true,
        outDir: "dist",
        emptyOutDir: false,
        lib: {
            entry: resolve(__dirname, "src/web-components.ts"),
            formats: ["es"],
            fileName: () => "grad-vue-elements.js",
            name: "GradVueElements",
        },
    },
});
