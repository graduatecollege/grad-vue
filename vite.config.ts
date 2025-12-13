import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'GradVue',
      fileName: (format) => `grad-vue.${format}.js`
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled into the library
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build for externalized deps
        globals: {
          vue: 'Vue'
        },
        exports: 'named'
      }
    }
  }
})
