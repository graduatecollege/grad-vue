
export default defineNuxtConfig({
    imports: {
        autoImport: false,
    },
    components: {
        dirs: [],
    },
    compatibilityDate: "2025-12-01",
    devtools: { enabled: true },
    modules: ["@pinia/nuxt"],
    app: {
        head: {
            title: "grad-vue",
            htmlAttrs: {
                lang: "en",
            },
            link: [{ rel: "icon", type: "image/x-icon", href: (import.meta.env.NUXT_APP_BASE_URL ? import.meta.env.NUXT_APP_BASE_URL : "/") + "favicon.ico" }],
        },
    },
    vite: {
        build: {
            minify: false,
        },
    },
});
