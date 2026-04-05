<script setup lang="ts">
import { ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GMultiSelect } from "@illinois-grad/grad-vue";

const selectedValues = ref<Array<string | number>>([]);
const formValues = ref<Array<string | number>>(["apple"]);

const fruitOptions = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Cherry", value: "cherry" },
    { label: "Date", value: "date" },
    { label: "Elderberry", value: "elderberry" },
    { label: "Fig", value: "fig" },
    { label: "Grape", value: "grape" },
];

const stringOptions = ["Option 1", "Option 2", "Option 3", "Option 4"];
</script>

<template>
    <ComponentSection title="Multi Select">
        <ComponentDemo
            description="A multi-select combobox with search/filter support and removable chip tags."
            component="GMultiSelect"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Accessible label',
                    default: 'Select Fruits'
                },
                hiddenLabel: {
                    type: 'boolean',
                    label: 'Hide the label visually',
                    default: false
                },
                placeholder: {
                    type: 'string',
                    label: 'Placeholder text shown when no values are selected',
                    default: null
                },
                disabled: {
                    type: 'boolean',
                    label: 'Disabled',
                    default: false
                },
                required: {
                    type: 'boolean',
                    label: 'Required',
                    default: false
                },
                instructions: {
                    type: 'string',
                    label: 'Instructions shown below the label',
                    default: null
                }
            }"
        >
            <template #default="{ props }">
                <GMultiSelect
                    v-bind="props"
                    v-model="selectedValues"
                    :options="fruitOptions"
                    :label="props.label"
                />
                <DemoResult label="Selected">{{ selectedValues }}</DemoResult>
            </template>
        <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * List of options to choose from</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    options</span><span style="color:#000000">: </span><span style="color:#267F99">Array</span><span style="color:#000000">&#x3C;</span><span style="color:#267F99">string</span><span style="color:#000000"> | </span><span style="color:#267F99">SelectOption</span><span style="color:#000000">>;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Accessible label</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    label</span><span style="color:#000000">: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Hide the label visually</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    hiddenLabel</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Placeholder text shown when no values are selected</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    placeholder</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Disabled</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    disabled</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Required</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    required</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Name for form registration</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    name</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Error messages array (supports multiple validation errors)</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    errors</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">[];</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Instructions shown below the label</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    instructions</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Form channel key for custom elements mode</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    formKey</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#000000">};</span></span></code></pre>
</figure>

</template>
        <template #docs><p>A multi-select combobox that allows selecting multiple values with
optional search/filter support.</p>
<p>Selected values are displayed as removable chips inside the control.
The dropdown listbox shows all (or filtered) options with a checkmark
next to each selected option.</p>
<p>The <code>options</code> prop accepts an array of strings or <code>&lcub; label, value }</code>
objects. The <code>v-model</code> binds to an array of <code>string | number</code> values.</p>
<p>In standard Vue usage, this registers with the nearest parent <code>GForm</code> via
injection. In custom-elements mode, use matching <code>form-key</code> values to pair
with a <code>GForm</code>.</p>
<p>Keyboard navigation:</p>
<ul>
<li><code>Down Arrow</code> / <code>Up Arrow</code>: move through options (opens menu if closed)</li>
<li><code>Enter</code>: toggle the focused option</li>
<li><code>Space</code>: toggle the focused option when the search field is empty</li>
<li><code>Escape</code>: close the dropdown</li>
<li><code>Home</code> / <code>End</code>: jump to first / last option</li>
<li><code>Backspace</code>: remove the last chip when the search field is empty</li>
</ul>
</template>
        </ComponentDemo>

        <ComponentDemo
            description="Multi Select with string options (no objects required)."
            component="GMultiSelect"
            :props-config="{}"
        >
            <template #default>
                <GMultiSelect
                    v-model="selectedValues"
                    :options="stringOptions"
                    label="String options"
                />
                <DemoResult label="Selected">{{ selectedValues }}</DemoResult>
            </template>
        </ComponentDemo>

        <ComponentDemo
            description="Multi Select with pre-selected values and error messages."
            component="GMultiSelect"
            :props-config="{}"
        >
            <template #default>
                <GMultiSelect
                    v-model="formValues"
                    :options="fruitOptions"
                    label="Favourite fruits"
                    :errors="['Please select at least 2 items']"
                    instructions="Pick your top fruits"
                />
                <DemoResult label="Selected">{{ formValues }}</DemoResult>
            </template>
        </ComponentDemo>

        <ComponentDemo
            description="Disabled Multi Select."
            component="GMultiSelect"
            :props-config="{}"
        >
            <template #default>
                <GMultiSelect
                    :model-value="['apple', 'banana']"
                    :options="fruitOptions"
                    label="Favourite fruits (disabled)"
                    disabled
                />
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
