import GradVue from '@illinois-grad/grad-vue';
import '@illinois-grad/grad-vue/grad-vue.css';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(GradVue);
})
