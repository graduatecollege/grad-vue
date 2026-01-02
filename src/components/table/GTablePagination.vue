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
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                height="1.5em"
            >
                <!--!Font Awesome Pro v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.-->
                <path
                    fill="currentColor"
                    d="M105.4 297.4C92.9 309.9 92.9 330.2 105.4 342.7L297.4 534.7C309.9 547.2 330.2 547.2 342.7 534.7C355.2 522.2 355.2 501.9 342.7 489.4L173.3 320L342.6 150.6C355.1 138.1 355.1 117.8 342.6 105.3C330.1 92.8 309.8 92.8 297.3 105.3L105.3 297.3zM489.4 105.4L297.4 297.4C284.9 309.9 284.9 330.2 297.4 342.7L489.4 534.7C501.9 547.2 522.2 547.2 534.7 534.7C547.2 522.2 547.2 501.9 534.7 489.4L365.3 320L534.6 150.6C547.1 138.1 547.1 117.8 534.6 105.3C522.1 92.8 501.8 92.8 489.3 105.3z"
                />
            </svg>
        </button>
        <button
            class="prev-page g-pagination-button"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                role="img"
                aria-label="Previous Page"
                height="1.5em"
            >
                <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                <path
                    fill="currentColor"
                    d="M169.4 297.4C156.9 309.9 156.9 330.2 169.4 342.7L361.4 534.7C373.9 547.2 394.2 547.2 406.7 534.7C419.2 522.2 419.2 501.9 406.7 489.4L237.3 320L406.6 150.6C419.1 138.1 419.1 117.8 406.6 105.3C394.1 92.8 373.8 92.8 361.3 105.3L169.3 297.3z"
                />
            </svg>
        </button>
        <span class="page-range"> {{ startDisplay }} to {{ end }} </span>
        <button
            class="next-page g-pagination-button"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                role="img"
                aria-label="Next Page"
                height="1.5em"
            >
                <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                <path
                    fill="currentColor"
                    d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"
                />
            </svg>
        </button>
        <button
            class="last-page g-pagination-button"
            :disabled="currentPage === totalPages"
            @click="goToPage(totalPages)"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                role="img"
                aria-label="Last Page"
                height="1.5em"
            >
                <!--!Font Awesome Pro v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.-->
                <path
                    fill="currentColor"
                    d="M534.6 342.6C547.1 330.1 547.1 309.8 534.6 297.3L342.6 105.3C330.1 92.8 309.8 92.8 297.3 105.3C284.8 117.8 284.8 138.1 297.3 150.6L466.7 320L297.4 489.4C284.9 501.9 284.9 522.2 297.4 534.7C309.9 547.2 330.2 547.2 342.7 534.7L534.7 342.7zM150.6 534.6L342.6 342.6C355.1 330.1 355.1 309.8 342.6 297.3L150.6 105.3C138.1 92.8 117.8 92.8 105.3 105.3C92.8 117.8 92.8 138.1 105.3 150.6L274.7 320L105.4 489.4C92.9 501.9 92.9 522.2 105.4 534.7C117.9 547.2 138.2 547.2 150.7 534.7z"
                />
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
    gap: 0.5rem;
    font-size: 1rem;

    .g-pagination-button {
        background: transparent;
        border: none;
        color: var(--g-surface-900);
        padding: 0.2rem 0.7rem;
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
    min-width: 4rem;
    text-align: center;
}

.g-pagination .page-size-select {
    margin-left: 1rem;
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
@media (prefers-reduced-motion: reduce) {
    .g-pagination .page-size-select {
        transition: none;
    }
}
</style>
