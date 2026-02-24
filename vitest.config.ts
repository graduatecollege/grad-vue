import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
    plugins: [
        vue(),
    ],
    optimizeDeps: {
        include: [
            "@tiptap/vue-3",
            "@tiptap/core",
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
    test: {
        testTimeout: 5000,
        browser: {
            enabled: true,
            instances: [
                {
                    browser: "chromium",
                },
            ],
            provider: playwright(),
        },
        setupFiles: ["./tests/setup.ts"],
        onConsoleLog(log: string) {
            // As much as I hate doing this, the unavoidable log spam is a big problem
            if (log.includes("decodeEntities option is passed but will be ignored in non-browser builds")) {
                return false;
            }
        },
        reporters: ["default", "json", "html"],
        outputFile: {
            json: "./test-results/results.json",
            html: "./test-results/index.html",
        }
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src"),
            "@grad-vue": resolve(__dirname, "./packages/grad-vue/src"),
            "@grad-vue-rte": resolve(__dirname, "./packages/grad-vue-rte/src"),
        },
    },
});
