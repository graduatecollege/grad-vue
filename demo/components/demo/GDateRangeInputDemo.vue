<script setup lang="ts">
import { ref } from "vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GDateRangeInput } from "@illinois-grad/grad-vue";

const dateRange = ref({ start: null, end: null });
</script>

<template>
    <section id="date-range-input" class="demo-section">
        <h2 class="demo-section__title">Date Range Input</h2>
        <ComponentDemo
            name="Basic Date Range Input"
            description="A date range input with start and end dates laid out horizontally."
            component="GDateRangeInput"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Label for the component',
                    default: null
                },
                startLabel: {
                    type: 'string',
                    label: 'Label for the start date input',
                    default: 'Start Date'
                },
                endLabel: {
                    type: 'string',
                    label: 'Label for the end date input',
                    default: 'End Date'
                },
                disabled: {
                    type: 'boolean',
                    label: 'Disabled',
                    default: false
                },
                instructions: {
                    type: 'string',
                    label: 'Instructions',
                    default: ''
                }
            }"
        >
            <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Label for the component</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    label</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Label for the start date input</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    startLabel</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Label for the end date input</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    endLabel</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Disabled</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    disabled</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Error messages array (supports multiple validation errors)</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    errors</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">[];</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Instructions</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    instructions</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Name for form registration</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    name</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Form channel key for custom elements mode</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    formKey</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#000000">};</span></span></code></pre>
</figure>

</template>
            <template #docs><p>A date range input component with start and end dates.</p>
<p>This component uses two GDateInput components laid out horizontally
to allow selecting a date range.</p>
<p>In standard Vue usage, this registers with the nearest parent <code>GForm</code> via
injection. In custom-elements mode, use matching <code>form-key</code> values to pair
with a <code>GForm</code>.</p>
</template>
            <template #default="{ props }">
                <GDateRangeInput
                    v-model="dateRange"
                    v-bind="props"
                />
                <DemoResult>{{ dateRange }}</DemoResult>
            </template>
        </ComponentDemo>
    </section>
</template>
