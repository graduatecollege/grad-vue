import { defineNuxtPlugin } from "#imports";
import GradVueRTE from '@illinois-grad/grad-vue-rte/plugin';
import '@illinois-grad/grad-vue-rte/grad-vue-rte.css';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(GradVueRTE);
})
