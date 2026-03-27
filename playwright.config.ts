import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests-wc",
    timeout: 15000,
    use: {
        baseURL: "http://localhost:5173",
        headless: true,
    },
    projects: [
        {
            name: "chromium",
            use: { headless: true },
        },
    ],
    webServer: {
        command: "npx vite . --config vite.wc-test.config.ts --port 5173",
        port: 5173,
        reuseExistingServer: !process.env.CI,
    },
});
