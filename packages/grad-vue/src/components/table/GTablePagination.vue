<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
    start: number;
    pageSize: number;
    total: number;
    pageSizes?: number[];
}>();

const totalPages = computed(() => {
    return Math.max(1, Math.ceil(props.total / props.pageSize));
});

const startModel = defineModel<number>("start");
const pageSizeModel = defineModel<number>("pageSize");

const startVal = computed(() => startModel.value ?? props.start);
const pageSizeVal = computed(() => pageSizeModel.value ?? props.pageSize);

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
}
</script>

<template>
    <nav class="g-pagination" aria-label="Pagination">
        <button
            class="first-page g-pagination-button"
            :disabled="currentPage === 1"
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
            :disabled="currentPage === 1"
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
            :disabled="currentPage === totalPages"
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
            :disabled="currentPage === totalPages"
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
        <select
            id="page-size-select"
            class="page-size-select"
            :value="pageSizeModel"
            @change="onPageSizeChange"
        >
            <option
                v-for="size in props.pageSizes || [10, 25, 50, 100]"
                :key="size"
                :value="size"
            >
                {{ size }}
            </option>
        </select>
        <label class="page-size-label" for="page-size-select">per page</label>
    </nav>
</template>

<style scoped>
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
            }
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

.g-pagination .page-size-select {
    margin-left: 1rem;
    margin-right: 0.5rem;
    padding: 0.2em 0.5em 0.2em 0.5em;
    border-radius: 0.2em;
    border: 2px solid var(--g-primary-500);
    background: var(--g-surface-0);
    color: var(--g-surface-900);
    cursor: pointer;
    font-size: 1rem;
    font-family: var(--il-font-sans);
}
.g-pagination .page-size-select:hover {
}
.g-pagination .page-size-select:focus {
    background: var(--ilw-color--focus--background);
    color: var(--ilw-color--focus--text);
}
.page-size-label {
    line-height: 1.2;
}

@media (prefers-reduced-motion: reduce) {
    .g-pagination .page-size-select {
        transition: none;
    }
}
</style>
