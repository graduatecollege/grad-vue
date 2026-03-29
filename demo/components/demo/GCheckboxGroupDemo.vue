<script setup lang="ts">
import { ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GCheckboxGroup } from "@illinois-grad/grad-vue";

const selectedValues = ref<string[]>([]);
const radioValue = ref<string[]>([]);

const options = [
    { label: "Option A", value: "a" },
    { label: "Option B", value: "b" },
    { label: "Option C", value: "c", hint: "This option has a hint" },
    { label: "Option D (disabled)", value: "d", disabled: true },
];
</script>

<template>
    <ComponentSection title="Checkbox Group">
        <ComponentDemo
            description="A group of checkboxes with label, instructions, and error support."
            component="GCheckboxGroup"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Legend / accessible label for the group',
                    default: 'Checkbox Group'
                },
                instructions: {
                    type: 'string',
                    label: 'Instructions shown below the legend',
                    default: ''
                },
                required: {
                    type: 'boolean',
                    label: 'Mark the group as required',
                    default: false
                },
                radio: {
                    type: 'boolean',
                    label: 'Render as radio buttons (single-select)',
                    default: false
                }
            }"
        >
            <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Legend / accessible label for the group</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    label</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * List of checkbox options</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    options</span><span style="color:#000000">: </span><span style="color:#267F99">CheckboxOption</span><span style="color:#000000">[];</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Instructions shown below the legend</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    instructions</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Error messages array (supports multiple validation errors)</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    errors</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">[];</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Mark the group as required</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    required</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Render as radio buttons (single-select)</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    radio</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Name for form registration and native input `name` attribute</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    name</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Form channel key for custom elements mode</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    formKey</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#000000">};</span></span></code></pre>
</figure>

</template>
            <template #docs><p>A group of checkboxes (or radio buttons) with styling for a label,
instructions, and error messages.</p>
<p>When more than one option is provided (or <code>radio</code> mode is used), a
<code>fieldset</code> + <code>legend</code> provides semantic grouping. With a single checkbox
a plain <code>div</code> is rendered instead.</p>
<p>Each option renders as a native <code>&lt;input type=&quot;checkbox&quot;&gt;</code> (or
<code>type=&quot;radio&quot;</code> when <code>radio</code> is <code>true</code>) so that keyboard navigation and
browser/assistive-technology support come for free.</p>
<p>In standard Vue usage, this registers with the nearest parent <code>GForm</code> via
injection. In custom-elements mode, use matching <code>form-key</code> values to pair
with a <code>GForm</code>.</p>
<p>Errors are provided as an array of strings or computed values.
Multiple errors will all be displayed.</p>
</template>
            <template #default="{ props }">
                <GCheckboxGroup
                    v-bind="props"
                    v-model="selectedValues"
                    :options="options"
                    label="Choose options"
                />
                <DemoResult label="Selected">{{ selectedValues }}</DemoResult>
            </template>
        </ComponentDemo>

        <ComponentDemo
            description="Checkbox Group in radio mode (single-select)."
            component="GCheckboxGroup"
            :props-config="{}"
        >
            <template #default>
                <GCheckboxGroup
                    label="Pick one"
                    :options="options"
                    v-model="radioValue"
                    :radio="true"
                />
                <DemoResult label="Selected">{{ radioValue }}</DemoResult>
            </template>
        </ComponentDemo>

        <ComponentDemo
            description="Checkbox Group with error messages."
            component="GCheckboxGroup"
            :props-config="{}"
        >
            <template #default>
                <GCheckboxGroup
                    label="Required selection"
                    :options="options"
                    :model-value="[]"
                    :errors="['Please select at least one option']"
                    required
                />
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
