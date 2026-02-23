<script setup lang="ts">
/**
 * A button that shows the selected term. Clicking it opens a popover
 * that allows jumping to a different term.
 */
import GTermSelectorControl from "./term/GTermSelectorControl.vue";
import GButton from "./GButton.vue";
import GPopover from "./GPopover.vue";

interface Props {
    /**
     * Title for the popover.
     */
    title?: string; // Demo: Period Selection

    /**
     * Label for year select.
     */
    yearLabel?: string; // Demo: Select Year

    /**
     * Label for period select.
     */
    periodLabel?: string; // Demo: Term

    // list of possible term years
    termYears?: string[];

    // list of possible term names
    termNames?: string[];
}

const props = withDefaults(defineProps<Props>(), {
    title: "Period Selection",
    termYears: () => ["2026"],
    termNames: () => ["Spring", "Summer", "Fall"],
});

const term = defineModel<{year: string, name: string}>({
    default: () => ({year: "2026", name: "Spring"}),
});
</script>

<template>
    <div class="g-term-selector">
        <GPopover>
            <template #trigger="{ toggle }">
                <GButton class="g-term-selector-button" theme="none" outlined @click="toggle">
                    <span class="g-calendar-icon">
                        <svg role="none presentation" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M224 64C206.3 64 192 78.3 192 96L192 128L160 128C124.7 128 96 156.7 96 192L96 240L544 240L544 192C544 156.7 515.3 128 480 128L448 128L448 96C448 78.3 433.7 64 416 64C398.3 64 384 78.3 384 96L384 128L256 128L256 96C256 78.3 241.7 64 224 64zM96 288L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 288L96 288z"/></svg>
                    </span>
                    <span class="g-term-label"> {{ term?.name }} {{ term?.year }} </span>
                    <span class="g-caret">
                        <svg role="none presentation"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M300.3 440.8C312.9 451 331.4 450.3 343.1 438.6L471.1 310.6C480.3 301.4 483 287.7 478 275.7C473 263.7 461.4 256 448.5 256L192.5 256C179.6 256 167.9 263.8 162.9 275.8C157.9 287.8 160.7 301.5 169.9 310.6L297.9 438.6L300.3 440.8z"/></svg>
                    </span>
                </GButton>
            </template>
            <h2 class="popover-title" tabindex="-1">{{ title}}</h2>
            <GTermSelectorControl v-bind="$props" />
        </GPopover>
    </div>
</template>

<style scoped>

.popover-title {
    font-size: 1rem;
    display: block;
    margin: -1.5rem -1rem 0;
    padding: 0.5rem 1rem;
    background: var(--g-surface-50);
    font-weight: 600;
    color: var(--g-accent-700);
    text-align: center;
}
.g-term-selector .g-term-selector-button {
    background: var(--g-surface-0);
    color: var(--g-primary-500);
    border-color: var(--g-primary-500);
    height: 2.35rem;
    padding: 0 8px 0 0;
    text-decoration: none;
    font-size: 1rem;

    .g-calendar-icon {
        background: var(--g-primary-500);
        color: var(--g-surface-0);
        display: flex;
        align-items: center;

        padding: 0 10px;
        height: 100%;

        svg {
            width: 1.5rem;
            fill: currentColor;
            stroke: currentColor;
        }
    }

    &:hover .g-term-label {
        text-decoration: underline;
    }

    &:focus-visible {
        background: var(--ilw-color--focus--background);
        color: var(--ilw-color--focus--text);
    }

    .g-caret {
        pointer-events: none;
        color: var(--ilw-color--link-hover);
        width: 20px;
    }
}


.g-term-label {
    width: 120px;
    padding-top: 2px;
    @media screen and (max-width: 1000px) {
        width: 70px;
    }
}
</style>
