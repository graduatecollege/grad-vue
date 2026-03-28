import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
    plugins: [
        vue({
            features: {
                customElement: true,
            },
        }),
    ],
    define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
    },
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
        rollupOptions: {
            output: {
                assetFileNames: "grad-vue-elements.[ext]",
            },
        },
    },
});
