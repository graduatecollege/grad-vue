<script setup lang="ts">
import { ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GSelect } from "@illinois-grad/grad-vue";

const selectedValue = ref<string | number | undefined>(undefined);
const searchableValue = ref<string | number | undefined>(undefined);
const selectOptions = ref([
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
]);
</script>

<template>
    <ComponentSection title="Select">
        <ComponentDemo
            description="A dropdown select component with customizable options."
            component="GSelect"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Accessible label',
                    default: 'Select Option'
                },
                hiddenLabel: {
                    type: 'boolean',
                    label: 'Hide the label visually',
                    default: null
                },
                placeholder: {
                    type: 'string',
                    label: 'Placeholder',
                    default: null,
                    instructions: 'Only used if the component is searchable.'
                },
                disabled: {
                    type: 'boolean',
                    label: 'Disabled',
                    default: false
                },
                searchable: {
                    type: 'boolean',
                    label: 'Searchable',
                    default: false
                },
                clearButton: {
                    type: 'boolean',
                    label: 'Show clear button',
                    default: null
                },
                compact: {
                    type: 'boolean',
                    label: 'Compact',
                    default: false
                }
            }"
        >
            <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * List of options to choose from</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    options</span><span style="color:#000000">: </span><span style="color:#267F99">Array</span><span style="color:#000000">&#x3C;</span><span style="color:#267F99">string</span><span style="color:#000000"> | </span><span style="color:#267F99">OptionType</span><span style="color:#000000">>;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Accessible label</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    label</span><span style="color:#000000">: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Hide the label visually</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    hiddenLabel</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Placeholder</span></span>
<span class="line"><span style="color:#008000">     *</span></span>
<span class="line"><span style="color:#008000">     * Only used if the component is searchable.</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    placeholder</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Disabled</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    disabled</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Name for form registration</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    name</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Searchable</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    searchable</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Show clear button</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    clearButton</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Compact</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    compact</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Error messages array (supports multiple validation errors)</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    errors</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">[];</span></span>
<span class="line"><span style="color:#000000">}</span></span></code></pre>
</figure>

</template>
            <template #docs><p>By default, this component behaves like a normal select element with
custom styling.</p>
<p>The component can be marked <code>searchable</code> to enable search functionality.
This turns it into a text input that filters the options. Filtering is
done with a simple lower-case string search.</p>
<p>The <code>options</code> prop can be an array of strings or objects with <code>label</code>
and <code>value</code> properties.</p>
</template>
            <template #default="{ props }">
                <GSelect
                    v-bind="props"
                    :model-value="selectedValue"
                    @update:model-value="selectedValue = $event"
                    :options="selectOptions"
                    label="Select an option"
                />
                <DemoResult label="Selected">{{ selectedValue }}</DemoResult>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
