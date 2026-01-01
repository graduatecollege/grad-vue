<script setup lang="ts">
import { GButton, GPopover } from "@illinois-grad/grad-vue";
import type {
    ComponentResult,
    ComponentTestResult,
} from "../../scripts/results";

interface Props {
    componentName: string;
    componentResult: ComponentResult;
}

const props = defineProps<Props>();

const isTestSkipped = (status: ComponentTestResult["status"]) => {
    return status === "skipped" || status === "pending" || status === "todo";
};
</script>

<template>
    <div class="test">
        <h3 class="test__title">Test Results</h3>
        <div class="test__summary">
            <span
                :class="{
                    test__status: true,
                    'test__status--passed': componentResult.status === 'passed',
                    'test__status--failed': componentResult.status === 'failed',
                    'test__status--skipped':
                        componentResult.status === 'skipped',
                }"
            >
                {{
                    componentResult.status === "passed"
                        ? "Pass"
                        : componentResult.status === "failed"
                          ? "Fail"
                          : "Skipped"
                }}
            </span>
            <span class="test__text">
                {{ componentResult.passed }}/{{ componentResult.total }}
                tests passed
                <span v-if="componentResult.failed > 0" class="test__failed">
                    ({{ componentResult.failed }} failed)
                </span>
                <span v-if="componentResult.skipped > 0" class="test__skipped">
                    ({{ componentResult.skipped }} skipped)
                </span>
            </span>
            <GPopover>
                <template #trigger="{ toggle }">
                    <GButton
                        size="small"
                        theme="secondary"
                        outlined
                        @click="toggle"
                    >
                        {{ componentName }} Test Details
                    </GButton>
                </template>
                <div class="test__details">
                    <h2>{{ componentName }} Test Details</h2>
                    <ul class="test__list">
                        <li
                            v-for="(test, index) in componentResult.tests"
                            :key="index"
                            class="test__item"
                        >
                            <span
                                :class="{
                                    'test-status': true,
                                    'test-status--passed':
                                        test.status === 'passed',
                                    'test-status--failed':
                                        test.status === 'failed',
                                    'test-status--skipped': isTestSkipped(
                                        test.status,
                                    ),
                                }"
                            >
                                {{
                                    test.status === "passed"
                                        ? "Pass"
                                        : test.status === "failed"
                                          ? "Fail"
                                          : "Skip"
                                }}
                            </span>
                            <div class="test-info">
                                <div
                                    v-if="test.ancestors.length > 0"
                                    :class="{
                                        'test-ancestors': true,
                                        'test-ancestors--accessibility':
                                            test.ancestors[0] ===
                                            'Accessibility Tests',
                                    }"
                                >
                                    {{ test.ancestors.join(" > ") }}
                                </div>
                                <div class="test-title">
                                    {{ test.title }}
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </GPopover>
        </div>
    </div>
</template>

<style scoped>
.test__title {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
}

.test__summary {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.test__status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 24px;
    padding: 0 0.5rem;
    border-radius: 12px;
    font-weight: bold;
    font-size: 0.875rem;
}

.test__status--passed {
    background-color: var(--g-green-100);
    color: var(--g-green-500);
}

.test__status--failed {
    background-color: var(--g-danger-100);
    color: var(--g-danger-500);
}

.test__status--skipped {
    background-color: var(--g-surface-100);
    color: var(--g-surface-700);
}

.test__text {
    font-size: 0.875rem;
    color: var(--g-surface-700);
}

.test__failed {
    color: var(--g-danger-500);
    font-weight: 500;
}

.test__skipped {
    color: var(--g-surface-700);
}

.test__details {
    max-height: 400px;
    overflow-y: auto;
    min-width: 400px;
}

.test__list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
}

.test__item {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 4px;
    background-color: var(--g-surface-50);
}

.test-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    padding: 0 0.5rem;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: bold;
}

.test-status--passed {
    background-color: var(--g-green-100);
    color: var(--g-green-500);
}

.test-status--failed {
    background-color: var(--g-danger-100);
    color: var(--g-danger-500);
}

.test-status--skipped {
    background-color: var(--g-surface-100);
    color: var(--g-surface-700);
}

.test-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.test-ancestors {
    font-size: 0.875rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
}

.test-ancestors--accessibility::before {
    content: "♿";
    font-size: 0.875rem;
}
</style>
