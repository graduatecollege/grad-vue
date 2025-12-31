import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
    plugins: [
        vue(),
    ],
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
        },
    },
});
