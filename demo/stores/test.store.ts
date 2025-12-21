import { defineStore } from "pinia";
import { ref } from "vue";

export const useActiveLinkStore = defineStore("activeLink", () => {
    const activeId = ref("");

    return { activeId };
});