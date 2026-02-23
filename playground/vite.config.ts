import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// Dedicated Vite config for the playground dev app.
// When running `vite playground`, Vite searches for a config inside the
// playground directory, so this ensures the Vue plugin is applied to .vue files.
export default defineConfig({
    plugins: [vue(), vueDevTools()],
})
