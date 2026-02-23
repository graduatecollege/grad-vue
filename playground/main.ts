import { createApp } from 'vue'
import App from './App.vue'
import GradVue from '../packages/grad-vue/src/plugin'

// Use library styles directly from src during dev for fast iteration
import '../packages/grad-vue/src/css/main.css'
import '../packages/grad-vue-rte/src/css/main.css'
import { createPinia } from "pinia";

const app = createApp(App)
app.use(GradVue)

const pinia = createPinia()
app.use(pinia)

app.mount('#app')
