
export default defineNuxtConfig({
    imports: {
        autoImport: false
    },
    components: {
        dirs: []
    },
    compatibilityDate: "2025-12-01",
    devtools: { enabled: true },
    modules: ["@pinia/nuxt"],
    app: {
        head: {
            title: "grad-vue"
        }
    }
});
