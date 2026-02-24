import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// Root vite config is for the playground dev environment
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@grad-vue': resolve(__dirname, 'packages/grad-vue/src'),
            '@grad-vue-rte': resolve(__dirname, 'packages/grad-vue-rte/src'),
        }
    }
});
