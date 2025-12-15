import { ref } from "vue";
import { defineStore } from "pinia";

export const useActiveLinkStore = defineStore('activeLink', () => {
    const activeId = ref('');

    return { activeId };
});