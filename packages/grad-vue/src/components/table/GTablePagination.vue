<script lang="ts">
/**
 * Pagination component for GTable.
 */
export default {};
</script>
<script setup lang="ts">
import { computed, useId } from "vue";
import GPopover from "../GPopover.vue";

const props = defineProps<{
    /**
     * The index of the first item
     */
    start: number;
    /**
     * The value of the page size control
     */
    pageSize: number;
    /**
     * The total number of items
     */
    total: number;
    /**
     * Available page sizes for the dropdown
     */
    pageSizes?: number[];
}>();

const totalPages = computed(() => {
    return Math.max(1, Math.ceil(props.total / props.pageSize));
});

const startModel = defineModel<number>("start");
const pageSizeModel = defineModel<number>("pageSize");
const inlinePageSizeSelectId = useId();
const overflowPageSizeSelectId = useId();

const startVal = computed(() => startModel.value ?? props.start);
const pageSizeVal = computed(() => pageSizeModel.value ?? props.pageSize);
const pageSizeOptions = computed(() => props.pageSizes || [10, 25, 50, 100]);
const isFirstPage = computed(() => currentPage.value === 1);
const isLastPage = computed(() => currentPage.value === totalPages.value);

const startDisplay = computed(() => {
    if (props.total === 0) {
        return 0;
    }
    return startVal.value + 1;
});

const end = computed(() => {
    if (props.total === 0) {
        return 0;
    }
    return Math.min(startVal.value + pageSizeVal.value, props.total);
});

const currentPage = computed(() => {
    return Math.floor(startVal.value / pageSizeVal.value) + 1;
});

function goToPage(p: number) {
    if (p < 1 || p > totalPages.value) {
        return;
    }
    startModel.value = (p - 1) * pageSizeVal.value;
}

function onPageSizeChange(e: Event) {
    pageSizeModel.value = parseInt((e.target as HTMLSelectElement).value, 10);
    startModel.value = 0;
}
</script>

<template>
    <nav class="g-pagination" aria-label="Pagination">
        <button
            class="first-page g-pagination-button"
            type="button"
            :disabled="isFirstPage"
            @click="goToPage(1)"
        >
            <svg
                role="img"
                aria-label="First Page"
                height="2em"
                xmlns="http://www.w3.org/2000/svg"
                width="2em"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <!-- MIT License https://github.com/tabler/tabler-icons -->
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M11 7l-5 5l5 5" />
                <path d="M17 7l-5 5l5 5" />
            </svg>
        </button>
        <button
            class="prev-page g-pagination-button"
            type="button"
            :disabled="isFirstPage"
            @click="goToPage(currentPage - 1)"
        >
            <svg
                role="img"
                aria-label="Previous Page"
                xmlns="http://www.w3.org/2000/svg"
                width="2em"
                height="2em"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <!-- MIT License https://github.com/tabler/tabler-icons -->
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M15 6l-6 6l6 6" />
            </svg>
        </button>
        <span class="page-range"> {{ startDisplay }} to {{ end }} </span>
        <button
            class="next-page g-pagination-button"
            type="button"
            :disabled="isLastPage"
            @click="goToPage(currentPage + 1)"
        >
            <svg
                role="img"
                aria-label="Next Page"
                xmlns="http://www.w3.org/2000/svg"
                width="2em"
                height="2em"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <!-- MIT License https://github.com/tabler/tabler-icons -->
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 6l6 6l-6 6" />
            </svg>
        </button>
        <button
            class="last-page g-pagination-button"
            type="button"
            :disabled="isLastPage"
            @click="goToPage(totalPages)"
        >
            <svg
                role="img"
                aria-label="Last Page"
                xmlns="http://www.w3.org/2000/svg"
                width="2em"
                height="2em"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <!-- MIT License https://github.com/tabler/tabler-icons -->
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M7 7l5 5l-5 5" />
                <path d="M13 7l5 5l-5 5" />
            </svg>
        </button>
        <div class="g-pagination-page-size">
            <div class="page-size-select-wrap">
                <select
                    :id="inlinePageSizeSelectId"
                    class="page-size-select"
                    :value="pageSizeVal"
                    @change="onPageSizeChange"
                >
                    <option
                        v-for="size in pageSizeOptions"
                        :key="size"
                        :value="size"
                    >
                        {{ size }}
                    </option>
                </select>
                <span class="page-size-select-caret" aria-hidden="true">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        width="1em"
                        height="1em"
                    >
                        <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                        <path
                            fill="currentColor"
                            d="M300.3 439.8C312.8 450.1 331.3 449.3 343.1 437.6L471.1 309.6C480.3 300.4 483 286.7 478 274.7C473 262.7 461.4 255 448.5 255L192.5 255C179.6 255 167.9 262.8 162.9 274.8C157.9 286.8 160.7 300.5 169.9 309.6L297.9 437.6L300.3 439.8z"
                        />
                    </svg>
                </span>
            </div>
            <label class="page-size-label" :for="inlinePageSizeSelectId">
                per page
            </label>
        </div>
        <div class="g-pagination-overflow">
            <GPopover>
                <template #trigger="{ toggle }">
                    <button
                        type="button"
                        class="g-pagination-button g-pagination-overflow-trigger"
                        aria-label="More pagination options"
                        @click="toggle"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                            width="2em"
                            height="2em"
                            aria-hidden="true"
                        >
                            <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                            <path
                                fill="currentColor"
                                d="M96 320C96 284.7 124.7 256 160 256C195.3 256 224 284.7 224 320C224 355.3 195.3 384 160 384C124.7 384 96 355.3 96 320zM256 320C256 284.7 284.7 256 320 256C355.3 256 384 284.7 384 320C384 355.3 355.3 384 320 384C284.7 384 256 355.3 256 320zM480 256C515.3 256 544 284.7 544 320C544 355.3 515.3 384 480 384C444.7 384 416 355.3 416 320C416 284.7 444.7 256 480 256z"
                            />
                        </svg>
                    </button>
                </template>
                <div class="g-pagination-overflow-popover">
                    <h2
                        class="g-pagination-overflow-title"
                        tabindex="-1"
                        popover-focus
                    >
                        Pagination options
                    </h2>
                    <div class="g-pagination-overflow-page-size">
                        <label
                            class="page-size-label"
                            :for="overflowPageSizeSelectId"
                        >
                            Rows per page
                        </label>
                        <div class="page-size-select-wrap">
                            <select
                                :id="overflowPageSizeSelectId"
                                class="page-size-select"
                                :value="pageSizeVal"
                                @change="onPageSizeChange"
                            >
                                <option
                                    v-for="size in pageSizeOptions"
                                    :key="`overflow-${size}`"
                                    :value="size"
                                >
                                    {{ size }}
                                </option>
                            </select>
                            <span class="page-size-select-caret" aria-hidden="true">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 640 640"
                                    width="1em"
                                    height="1em"
                                >
                                    <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                                    <path
                                        fill="currentColor"
                                        d="M300.3 439.8C312.8 450.1 331.3 449.3 343.1 437.6L471.1 309.6C480.3 300.4 483 286.7 478 274.7C473 262.7 461.4 255 448.5 255L192.5 255C179.6 255 167.9 262.8 162.9 274.8C157.9 286.8 160.7 300.5 169.9 309.6L297.9 437.6L300.3 439.8z"
                                    />
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div class="g-pagination-overflow-actions">
                        <button
                            type="button"
                            class="g-pagination-overflow-action"
                            :disabled="isFirstPage"
                            @click="goToPage(1)"
                        >
                            <span
                                class="g-pagination-overflow-action-icon"
                                aria-hidden="true"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1em"
                                    height="1em"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <!-- MIT License https://github.com/tabler/tabler-icons -->
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M11 7l-5 5l5 5" />
                                    <path d="M17 7l-5 5l5 5" />
                                </svg>
                            </span>
                            First Page
                        </button>
                        <button
                            type="button"
                            class="g-pagination-overflow-action"
                            :disabled="isLastPage"
                            @click="goToPage(totalPages)"
                        >
                            <span
                                class="g-pagination-overflow-action-icon"
                                aria-hidden="true"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1em"
                                    height="1em"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <!-- MIT License https://github.com/tabler/tabler-icons -->
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M7 7l5 5l-5 5" />
                                    <path d="M13 7l5 5l-5 5" />
                                </svg>
                            </span>
                            Last Page
                        </button>
                    </div>
                </div>
            </GPopover>
        </div>
    </nav>
</template>

<style>
.g-pagination {
    display: flex;
    align-items: center;
    gap: 0.1rem;
    font-size: 1rem;

    .g-pagination-button {
        background: transparent;
        border: none;
        color: var(--g-surface-900);
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        cursor: pointer;

        &:not(:disabled) {
            &:hover {
                background: var(--g-primary-500);
                color: var(--g-primary-text);
            }

            &:focus {
                background: var(--ilw-color--focus--background);
                color: var(--ilw-color--focus--text);
                outline-color: var(--g-primary-500);
            }
        }

        svg {
            display: block;
        }
    }
}
.g-pagination button:disabled {
    cursor: auto;
    color: var(--g-surface-600);
}
.g-pagination .page-range {
    min-width: 3rem;
    text-align: center;
}

.g-pagination .g-pagination-page-size {
    display: inline-flex;
    align-items: center;
    margin-left: 1rem;
    gap: 0.5rem;
}

.page-size-select-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
}

.page-size-select {
    appearance: none;
    min-height: 2.1rem;
    padding: 0.2rem 2rem 0.2rem 0.6rem;
    border-radius: var(--g-border-radius-m);
    border: 2px solid var(--g-primary-500);
    background: var(--g-surface-0);
    color: var(--g-surface-900);
    cursor: pointer;
    font-size: 1rem;
    font-family: var(--il-font-sans);
    line-height: 1.2;
    box-sizing: border-box;
}
.page-size-select:hover {
    border-color: var(--g-accent-700);
}
.page-size-select:focus {
    background: var(--ilw-color--focus--background);
    color: var(--ilw-color--focus--text);
    outline-color: var(--g-primary-500);
    border-color: var(--g-primary-500);
}

.page-size-select-caret {
    position: absolute;
    right: 0.6rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--g-accent-700);
    pointer-events: none;
}
.page-size-label {
    line-height: 1.2;
}

.g-pagination .g-pagination-overflow {
    display: none;
    align-items: center;
}

.g-pagination .g-pagination-overflow-trigger {
    padding: 0.2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    align-self: center;
}

.g-pagination-overflow-popover {
    min-width: 14rem;
    display: grid;
    gap: 0.75rem;
}

.g-pagination-overflow-title {
    margin: 0;
    font-weight: 700;
}

.g-pagination-overflow-page-size {
    display: grid;
    gap: 0.35rem;
}

.g-pagination-overflow-page-size .page-size-select-wrap {
    width: 100%;
}

.g-pagination-overflow-page-size .page-size-select {
    margin: 0;
    width: 100%;
}

.g-pagination-overflow-actions {
    display: grid;
    gap: 0.35rem;
}

.g-pagination-overflow-action {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border: 0;
    background: transparent;
    color: var(--g-primary-500);
    font: inherit;
    font-weight: 600;
    padding: 0.25rem 0;
    text-align: left;
    cursor: pointer;
}

.g-pagination-overflow-action-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
}

.g-pagination-overflow-action:hover {
    color: var(--g-accent-700);
    text-decoration: underline;
}

.g-pagination-overflow-action:focus {
    background: var(--ilw-color--focus--background);
    color: var(--ilw-color--focus--text);
    outline-color: var(--g-primary-500);
}

.g-pagination-overflow-action:disabled {
    color: var(--g-surface-600);
    cursor: auto;
    text-decoration: none;
}

@container g-table (max-width: 720px) {
    .g-pagination .first-page,
    .g-pagination .last-page,
    .g-pagination .g-pagination-page-size {
        display: none;
    }

    .g-pagination .g-pagination-overflow {
        display: inline-flex;
    }
}

@media (prefers-reduced-motion: reduce) {
    .g-pagination .page-size-select {
        transition: none;
    }
}
</style>
