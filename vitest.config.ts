import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => false,
                },
            },
        }),
    ],
    test: {
        globals: true,
        browser: {
            enabled: true,
            instances: [
                {
                    browser: "chromium",
                },
            ],
            provider: playwright(),
            headless: true,
        },
        setupFiles: ["./tests/setup.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            include: ["src/**/*.{vue,ts}"],
        },
        reporters: ["default", "json", "html"],
        outputFile: {
            json: "./test-results/results.json",
            html: "./test-results/index.html",
        },
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src"),
        },
    },
    define: {
        "process.env": {},
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
    },
});
