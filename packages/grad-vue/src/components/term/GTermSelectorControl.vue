<script setup lang="ts">/**
 * Prebuilt GSelect and GSelectButton components that can be used to
 * select a term.
 */
import GSelect from "../GSelect.vue";
import GSelectButton from "../GSelectButton.vue";

interface Props {
    /**
     * List of possible term years. Defaults to ["2026"].
     */
    termYears?: string[];
    /**
     * List of possible term names. Defaults to ["Spring", "Summer", "Fall"].
     */
    termNames?: string[];

    /**
     * Label for year select. Defaults to "Select Year".
     */
    yearLabel?: string;

    /**
     * Label for period select. Defaults to "Term".
     */
    periodLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
    termYears: () => ["2026"],
    termNames: () => ["Spring", "Summer", "Fall"],
    yearLabel: "Select Year",
    periodLabel: "Term",
});

const term = defineModel<{year: string, name: string}>({
    default: () => ({year: "2026", name: "Spring"}),
});
</script>

<template>
    <div class="popover-content">
        <div class="year-dropdown">
            <GSelect
                v-model="term.year"
                :options="termYears"
                :label="yearLabel"
            />
        </div>
        <div class="month-selector">
            <GSelectButton
                v-model="term.name"
                :options="termNames"
                :allow-empty="false"
                :label="periodLabel"
            />
        </div>
    </div>
</template>

<style scoped>
.year-dropdown {
    display: flex;
    justify-content: left;
    margin: 1rem 0;
}
</style>
