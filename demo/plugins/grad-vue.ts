import { defineNuxtPlugin } from "#imports";
import GradVue from '@graduatecollege/grad-vue/plugin';
import '@graduatecollege/grad-vue/grad-vue.css';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(GradVue);
})
