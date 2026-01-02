<script setup lang="ts">
import ComponentDemo from "../ComponentDemo.vue";
import { computed, h, ref } from "vue";
import type { TableColumn } from "@illinois-grad/grad-vue";
import { useFiltering } from "@illinois-grad/grad-vue";

interface TableEntry {
    code: string;
    name: string;
    abbr: string;
    collegeInName: boolean;
}

const columns = computed<TableColumn<TableEntry>[]>(() => {
    return [
        {
            key: "code",
            label: "Code",
            sortable: true,
        },
        {
            key: "name",
            label: "Name",
            sortable: true,
        },
        {
            key: "abbr",
            label: "Abbreviation",
            sortable: true,
        },
        {
            key: "collegeInName",
            label: "'College' in Name",
            sortable: true,
            display: (row) => h("span", row.collegeInName ? "Yes" : "No"),
            filter: {
                type: "select",
                options: [
                    { label: "Yes", value: "yes" },
                    { label: "No", value: "no" },
                ],
                placeholder: "Any",
            },
        },
    ];
});

const tableData = ref<TableEntry[]>([
    {
        code: "LT",
        name: "Carle Illinois College of Medicine",
        abbr: "COM",
        collegeInName: true,
    },
    {
        code: "KL",
        name: "College of Agricultural, Consumer and Environmental Sciences (ACES)",
        abbr: "ACES",
        collegeInName: true,
    },
    {
        code: "KY",
        name: "College of Applied Health Sciences",
        abbr: "AHS",
        collegeInName: true,
    },
    {
        code: "KN",
        name: "College of Education",
        abbr: "EDUC",
        collegeInName: true,
    },
    {
        code: "KR",
        name: "College of Fine and Applied Arts",
        abbr: "FAA",
        collegeInName: true,
    },
    {
        code: "KU",
        name: "College of Law",
        abbr: "LAW",
        collegeInName: true,
    },
    {
        code: "KV",
        name: "College of Liberal Arts and Sciences",
        abbr: "LAS",
        collegeInName: true,
    },
    {
        code: "KT",
        name: "College of Media",
        abbr: "Media",
        collegeInName: true,
    },
    {
        code: "LC",
        name: "College of Veterinary Medicine",
        abbr: "V MED",
        collegeInName: true,
    },
    {
        code: "KW",
        name: "Division of Exploratory Studies",
        abbr: "DES",
        collegeInName: false,
    },
    {
        code: "KM",
        name: "Gies College of Business",
        abbr: "BUS",
        collegeInName: true,
    },
    {
        code: "KS",
        name: "Graduate College",
        abbr: "GRAD",
        collegeInName: true,
    },
    {
        code: "KP",
        name: "Grainger College of Engineering",
        abbr: "ENGR",
        collegeInName: true,
    },
    {
        code: "LP",
        name: "School of Information Sciences",
        abbr: "SIS",
        collegeInName: false,
    },
    {
        code: "LG",
        name: "School of Labor and Employment Relations",
        abbr: "LER",
        collegeInName: false,
    },
    {
        code: "LL",
        name: "School of Social Work",
        abbr: "SOC W",
        collegeInName: false,
    },
]);

const filtering = useFiltering({
    code: undefined,
    name: undefined,
    abbr: undefined,
    collegeInName: undefined,
});

const { filters, isFiltered, clearFilters } = filtering;

const sortField = ref<string | undefined>(undefined);
const sortOrder = ref<1 | -1 | undefined>(undefined);
const start = ref(0);
const pageSize = ref(5);

const filteredData = computed(() => {
    let data = [...tableData.value];
    for (let [key, val] of Object.entries(filters.value)) {
        if (val) {
            data = data.filter((item) =>
                val === "yes"
                    ? item[key as keyof typeof item]
                    : !item[key as keyof typeof item],
            );
        }
    }
    return data;
});

const computedData = computed(() => {
    let data = [...filteredData.value];
    if (sortField.value) {
        data.sort((a: any, b: any) => {
            const aVal: any = a[sortField.value!];
            const bVal: any = b[sortField.value!];
            const sortVal = (aVal?.toString() ?? "").localeCompare(
                bVal?.toString() ?? "",
            );
            return sortOrder.value === 1 ? sortVal : sortVal * -1;
        });
    }

    data = data.slice(start.value, start.value + pageSize.value);

    return data;
});
</script>

<template>
    <section id="table" class="demo-section">
        <h2 class="demo-section__title">Table</h2>
        <ComponentDemo
            description="Highly efficient and accessible data table."
            component="GTable"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Accessible label',
                    default: 'Colleges',
                },
            }"
        >
            <template #docs
                ><p>
                    A data table component with support for grouping, sorting,
                    filtering, and pagination.
                </p>
                <p>
                    A heavy focus has been on performance. The table body
                    doesn&#39;t use any Vue components, it&#39;s pure render
                    functions. We&#39;ve used it with 4000 rows and 14 columns
                    loaded without issues.
                </p>
                <p>
                    This is a bit complicated to use, so an example has been
                    omitted here. Instead, look at the source for this demo:
                    <a
                        href="https://github.com/graduatecollege/grad-vue/blob/main/demo/components/demo/GTableDemo.vue"
                        >GTable Demo Source</a
                    >.
                </p>
                <p>Here are some of the key points.</p>
                <p>Table content is provided with:</p>
                <ul>
                    <li>
                        <code>columns</code> configuration using the
                        <code>TableColumn</code> type.
                        <ul>
                            <li>
                                At minimum the configuration must include
                                <code>key</code> for which field of the data
                                objects to use, and <code>label</code> for the
                                column header.
                            </li>
                            <li>
                                <code>sortable: true</code> makes the column
                                sortable.
                            </li>
                            <li>
                                <code>filter</code> can be used to provide a
                                <code>TableColumnFilter</code> configuration.
                            </li>
                            <li>
                                <code>display</code> accepts a custom render
                                function for the column data.
                            </li>
                            <li>
                                <code>trClass</code> and
                                <code>tdClass</code> can be used to provide
                                custom classes for table rows and cells.
                            </li>
                        </ul>
                    </li>
                    <li>
                        <code>data</code> array with objects containing fields
                        for the columns.
                    </li>
                </ul>
                <p>
                    Rows can be made clickable with <code>row-clickable</code>.
                    In this case, one of the cells must contain a link. Clicking
                    a row will emit a <code>row-click</code> event with the link
                    <code>href</code> from the first link in the row.
                </p>
                <p>
                    Grouping can be enabled by passing a column key to
                    <code>groupBy</code>.
                </p>
            </template>
            <template #default="{ props }">
                <GTable
                    :label="props.label"
                    :data="computedData"
                    :columns="columns"
                    :filtering="filtering"
                    :filter="filters"
                    :result-count="filteredData.length"
                    v-model:sort-field="sortField"
                    v-model:sort-order="sortOrder"
                >
                    <template #pagination>
                        <GTablePagination
                            v-model:start="start"
                            v-model:page-size="pageSize"
                            :total="filteredData.length"
                            :page-sizes="[5, 10, 50]"
                        />
                    </template>
                </GTable>
            </template>
        </ComponentDemo>
    </section>
</template>
