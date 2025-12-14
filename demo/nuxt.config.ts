// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  ssr: false,
  
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/grad-vue/' : '/',
    buildAssetsDir: '/assets/'
  },
  
  nitro: {
    prerender: {
      routes: [
        '/',
        '/button',
        '/text-input',
        '/select',
        '/select-button',
        '/search',
        '/progress',
        '/popover',
        '/alert-dialog',
        '/app-header'
      ]
    }
  }
})
