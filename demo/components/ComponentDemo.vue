<script setup lang="ts">
import { computed, ref } from "vue";
import { GButton, GPopover } from "@illinois-grad/grad-vue";
import componentResults from "../public/component-results.json";

interface Props {
    name: string;
    description?: string;
    propsConfig?: Record<string, PropConfig>;
    component?: string;
}

interface PropConfig {
    type: "string" | "boolean" | "number" | "select";
    default?: any;
    options?: any[];
    label?: string;
}

interface TestResult {
    title: string;
    status: "passed" | "failed" | "skipped" | "pending" | "todo" | "disabled";
    ancestors: string[];
}

interface ComponentResult {
    component: string;
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    status: string;
    tests: TestResult[];
}

interface TestResults {
    totalComponents: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    components: Record<string, ComponentResult>;
}

const props = withDefaults(defineProps<Props>(), {
    description: "",
    propsConfig: () => ({}),
    component: "",
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

// Load test results
const testResults = ref<TestResults>(componentResults as any);
const componentResult = computed<ComponentResult | null>(() => {
    if (!testResults.value || !props.component) {
        return null;
    }
    return testResults.value.components[props.component] || null;
});

const isPopoverOpen = ref(false);

const isTestSkipped = (status: TestResult["status"]) => {
    return status === "skipped" || status === "pending" || status === "todo";
};
</script>

<template>
    <div class="component-demo">
        <div class="component-demo__header">
            <h2 class="component-demo__title">{{ name }}</h2>
            <p v-if="description" class="component-demo__description">
                {{ description }}
            </p>
        </div>

        <div class="component-demo__content">
            <div class="component-demo__preview">
                <div class="component-demo__preview-inner">
                    <slot :props="dynamicProps" />
                </div>
            </div>

            <div v-if="hasPropsConfig" class="component-demo__controls">
                <h3 class="component-demo__controls-title">
                    Props Configuration
                </h3>
                <div class="component-demo__controls-form">
                    <div
                        v-for="(config, key) in propsConfig"
                        :key="key"
                        class="component-demo__control"
                    >
                        <label
                            :for="`prop-${key}`"
                            class="component-demo__label"
                        >
                            {{ config.label || key }}
                        </label>

                        <!-- Boolean input -->
                        <input
                            v-if="config.type === 'boolean'"
                            :id="`prop-${key}`"
                            v-model="dynamicProps[key]"
                            type="checkbox"
                            class="component-demo__checkbox"
                        />

                        <!-- String input -->
                        <input
                            v-else-if="config.type === 'string'"
                            :id="`prop-${key}`"
                            v-model="dynamicProps[key]"
                            type="text"
                            class="component-demo__input"
                        />

                        <!-- Number input -->
                        <input
                            v-else-if="config.type === 'number'"
                            :id="`prop-${key}`"
                            v-model.number="dynamicProps[key]"
                            type="number"
                            class="component-demo__input"
                        />

                        <!-- Select input -->
                        <select
                            v-else-if="config.type === 'select'"
                            :id="`prop-${key}`"
                            v-model="dynamicProps[key]"
                            class="component-demo__select"
                        >
                            <option
                                v-for="option in config.options"
                                :key="option"
                                :value="option"
                            >
                                {{ option }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="componentResult" class="component-demo__footer">
            <div class="component-demo__tests">
                <h3 class="component-demo__tests-title">Test Results</h3>
                <div class="component-demo__tests-summary">
                    <span
                        :class="{
                            'component-demo__tests-status': true,
                            'component-demo__tests-status--passed':
                                componentResult.status === 'passed',
                            'component-demo__tests-status--failed':
                                componentResult.status === 'failed',
                            'component-demo__tests-status--skipped':
                                componentResult.status === 'skipped',
                        }"
                    >
                        {{
                            componentResult.status === "passed"
                                ? "✓"
                                : componentResult.status === "failed"
                                  ? "✗"
                                  : "○"
                        }}
                    </span>
                    <span class="component-demo__tests-text">
                        {{ componentResult.passed }}/{{ componentResult.total }}
                        tests passed
                        <span
                            v-if="componentResult.failed > 0"
                            class="component-demo__tests-failed"
                        >
                            ({{ componentResult.failed }} failed)
                        </span>
                        <span
                            v-if="componentResult.skipped > 0"
                            class="component-demo__tests-skipped"
                        >
                            ({{ componentResult.skipped }} skipped)
                        </span>
                    </span>
                    <GPopover v-model="isPopoverOpen">
                        <template #trigger="{ onToggle }">
                            <GButton
                                size="small"
                                theme="secondary"
                                outlined
                                @click="onToggle"
                            >
                                {{ props.component }} Test Details
                            </GButton>
                        </template>
                        <template #content>
                            <div class="component-demo__tests-details">
                                <h2>{{ props.component }} Test Details</h2>
                                <div class="component-demo__tests-list">
                                    <div
                                        v-for="(
                                            test, index
                                        ) in componentResult.tests"
                                        :key="index"
                                        class="component-demo__test-item"
                                    >
                                        <span
                                            :class="{
                                                'component-demo__test-status': true,
                                                'component-demo__test-status--passed':
                                                    test.status === 'passed',
                                                'component-demo__test-status--failed':
                                                    test.status === 'failed',
                                                'component-demo__test-status--skipped':
                                                    isTestSkipped(test.status),
                                            }"
                                        >
                                            {{
                                                test.status === "passed"
                                                    ? "✓"
                                                    : test.status === "failed"
                                                      ? "✗"
                                                      : "○"
                                            }}
                                        </span>
                                        <div class="component-demo__test-info">
                                            <div
                                                v-if="test.ancestors.length > 0"
                                                class="component-demo__test-ancestors"
                                            >
                                                {{ test.ancestors.join(" > ") }}
                                            </div>
                                            <div
                                                class="component-demo__test-title"
                                            >
                                                {{ test.title }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </GPopover>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.component-demo {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 2rem;
    overflow: hidden;
}

.component-demo__header {
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
}

.component-demo__title {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
}

.component-demo__description {
    margin: 0;
    color: #6b7280;
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
    padding: 2rem;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.component-demo__preview-inner {
    width: 100%;
}

.component-demo__controls {
    padding: 1.5rem;
    background: #f9fafb;
    border-left: 1px solid #e5e7eb;
}

.component-demo__controls-title {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
}

.component-demo__controls-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.component-demo__control {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.component-demo__label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
}

.component-demo__input,
.component-demo__select {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.875rem;
}

.component-demo__checkbox {
    width: 20px;
    height: 20px;
}

.component-demo__footer {
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
}

.component-demo__tests-title {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
}

.component-demo__tests-summary {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.component-demo__tests-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-weight: bold;
    font-size: 0.875rem;
}

.component-demo__tests-status--passed {
    background-color: #d1fae5;
    color: #059669;
}

.component-demo__tests-status--failed {
    background-color: #fee2e2;
    color: #dc2626;
}

.component-demo__tests-status--skipped {
    background-color: #e5e7eb;
    color: #6b7280;
}

.component-demo__tests-text {
    font-size: 0.875rem;
    color: #374151;
}

.component-demo__tests-failed {
    color: #dc2626;
    font-weight: 500;
}

.component-demo__tests-skipped {
    color: #6b7280;
}

.component-demo__tests-details {
    max-height: 400px;
    overflow-y: auto;
    min-width: 400px;
}

.component-demo__tests-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.component-demo__test-item {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 4px;
    background-color: #f9fafb;
}

.component-demo__test-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: bold;
    flex-shrink: 0;
}

.component-demo__test-status--passed {
    background-color: #d1fae5;
    color: #059669;
}

.component-demo__test-status--failed {
    background-color: #fee2e2;
    color: #dc2626;
}

.component-demo__test-status--skipped {
    background-color: #e5e7eb;
    color: #6b7280;
}

.component-demo__test-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.component-demo__test-ancestors {
    font-size: 0.75rem;
    color: #6b7280;
}

.component-demo__test-title {
    font-size: 0.875rem;
    color: #1f2937;
}

.component-demo__tests-placeholder {
    margin: 0;
    color: #059669;
    font-size: 0.875rem;
}
</style>
