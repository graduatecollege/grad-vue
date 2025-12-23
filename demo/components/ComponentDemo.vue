<script setup lang="ts">
import { computed, ref } from "vue";
import DemoControlCheckbox from "./controls/DemoControlCheckbox.vue";
import DemoControlText from "./controls/DemoControlText.vue";
import DemoControlNumber from "./controls/DemoControlNumber.vue";
import DemoControlSelect from "./controls/DemoControlSelect.vue";
import DemoTestResults from "./DemoTestResults.vue";
import componentResults from "../public/component-results.json";
import type { ComponentResult, SummaryResult } from "../../scripts/results";

interface Props {
    name: string;
    description?: string;
    propsConfig?: Record<string, PropConfig>;
    component?: string;
    additional?: boolean;
    padding?: string;
}

interface PropConfig {
    type: "string" | "boolean" | "number" | "select";
    default?: any;
    options?: any[];
    label?: string;
}

const props = withDefaults(defineProps<Props>(), {
    description: "",
    propsConfig: () => ({}),
    component: "",
    additional: false,
    padding: "1.5rem",
});

// Store the dynamic props values
const dynamicProps = ref<Record<string, any>>({});

// Initialize default values
Object.entries(props.propsConfig).forEach(([key, config]) => {
    dynamicProps.value[key] = config.default;
});

const hasPropsConfig = computed(
    () => Object.keys(props.propsConfig).length > 0,
);

// Add test results from parsed Vitest JSON
const testResults = ref<SummaryResult>(componentResults as any);
const componentResult = computed<ComponentResult | null>(() => {
    if (!testResults.value || !props.component) {
        return null;
    }
    return testResults.value.components[props.component] || null;
});
</script>

<template>
    <div
        class="component-demo"
        :class="{ 'component-demo--additional': props.additional }"
    >
        <div class="component-demo__header">
            <h2 class="component-demo__title">{{ name }}</h2>
            <p v-if="description" class="component-demo__description">
                {{ description }}
            </p>
        </div>

        <div class="component-demo__content">
            <div class="component-demo__preview" :style="{padding}">
                <div class="component-demo__preview-inner">
                    <slot :props="dynamicProps" />
                </div>
            </div>

            <div v-if="hasPropsConfig" class="component-demo__controls">
                <h3 class="component-demo__controls-title">
                    Props Configuration
                </h3>
                <div class="component-demo__controls-form">
                    <template v-for="(config, key) in propsConfig" :key="key">
                        <DemoControlCheckbox
                            v-if="config.type === 'boolean'"
                            :id="`prop-${key}`"
                            v-model="dynamicProps[key]"
                            :label="config.label || key"
                        />

                        <DemoControlText
                            v-else-if="config.type === 'string'"
                            :id="`prop-${key}`"
                            v-model="dynamicProps[key]"
                            :label="config.label || key"
                        />

                        <DemoControlNumber
                            v-else-if="config.type === 'number'"
                            :id="`prop-${key}`"
                            v-model="dynamicProps[key]"
                            :label="config.label || key"
                        />

                        <DemoControlSelect
                            v-else-if="config.type === 'select'"
                            :id="`prop-${key}`"
                            v-model="dynamicProps[key]"
                            :label="config.label || key"
                            :options="config.options || []"
                        />
                    </template>
                </div>
            </div>
        </div>

        <div v-if="componentResult" class="component-demo__footer">
            <DemoTestResults
                :component-name="props.component"
                :component-result="componentResult"
            />
        </div>
    </div>
</template>

<style>
.additional-demos {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-top: 1.5rem;
}

@media (min-width: 768px) {
    .additional-demos {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>

<style scoped>
.component-demo {
    background: white;
    border: 1px solid var(--il-storm-10);
    border-radius: 8px;
    margin-bottom: 2rem;
}

.component-demo__header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--il-storm-70);
    background: var(--il-storm-95);
    border-radius: 8px 8px 0 0;
}

.component-demo__title {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
}

.component-demo__description {
    margin: 0;
    line-height: 1.5;
}

.component-demo__content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
}

@media (min-width: 768px) {
    .component-demo__content {
        grid-template-columns: 2fr 1fr;
    }
}

.component-demo__preview {
    display: flex;
    align-items: center;
    justify-content: center;
}

.component-demo__preview-inner {
    width: 100%;
}

.component-demo__controls {
    padding: 1.5rem;
    background: var(--il-storm-95);
    border-left: 1px solid var(--il-storm-70);
}

.component-demo__controls-title {
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    font-weight: 600;
}

.component-demo__controls-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.component-demo__footer {
    padding: 1.5rem;
    border-top: 1px solid var(--il-storm-70);
    background: var(--il-storm-95);
    border-radius: 0 0 8px 8px;
}

.component-demo--additional {
    border: 1px solid var(--il-storm-80);
    margin: 0;

    .component-demo__header {
        border-bottom: 1px solid var(--il-storm-95);
        padding: 1rem;
    }
}
</style>
