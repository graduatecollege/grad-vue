<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
    name: string;
    description?: string;
    propsConfig?: Record<string, PropConfig>;
}

interface PropConfig {
    type: 'string' | 'boolean' | 'number' | 'select';
    default?: any;
    options?: any[];
    label?: string;
}

const props = withDefaults(defineProps<Props>(), {
    description: '',
    propsConfig: () => ({})
});

// Store the dynamic props values
const dynamicProps = ref<Record<string, any>>({});

// Initialize default values
Object.entries(props.propsConfig).forEach(([key, config]) => {
    dynamicProps.value[key] = config.default;
});

const hasPropsConfig = computed(() => Object.keys(props.propsConfig).length > 0);
</script>

<template>
    <div class="component-demo">
        <div class="component-demo__header">
            <h2 class="component-demo__title">{{ name }}</h2>
            <p v-if="description" class="component-demo__description">{{ description }}</p>
        </div>

        <div class="component-demo__content">
            <div class="component-demo__preview">
                <div class="component-demo__preview-inner">
                    <slot :props="dynamicProps" />
                </div>
            </div>

            <div v-if="hasPropsConfig" class="component-demo__controls">
                <h3 class="component-demo__controls-title">Props Configuration</h3>
                <div class="component-demo__controls-form">
                    <div
                        v-for="(config, key) in propsConfig"
                        :key="key"
                        class="component-demo__control"
                    >
                        <label :for="`prop-${key}`" class="component-demo__label">
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

        <div class="component-demo__footer">
            <div class="component-demo__tests">
                <h3 class="component-demo__tests-title">Test Results</h3>
                <p class="component-demo__tests-placeholder">
                    ✓ Test results will be displayed here
                </p>
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

.component-demo__tests-placeholder {
    margin: 0;
    color: #059669;
    font-size: 0.875rem;
}
</style>
