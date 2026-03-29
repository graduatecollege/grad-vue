<script setup lang="ts">
import { ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GTextarea } from "@illinois-grad/grad-vue";

const textareaValue = ref("");
</script>

<template>
    <ComponentSection title="Textarea">
        <ComponentDemo
            description="A multi-line plain text input."
            component="GTextarea"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Label',
                    default: 'Example Label'
                },
                placeholder: {
                    type: 'string',
                    label: 'Placeholder text',
                    default: ''
                },
                disabled: {
                    type: 'boolean',
                    label: 'Disabled',
                    default: false
                },
                readonly: {
                    type: 'boolean',
                    label: 'Read-only',
                    default: false
                },
                required: {
                    type: 'boolean',
                    label: 'Required',
                    default: false
                },
                instructions: {
                    type: 'string',
                    label: 'Instructions',
                    default: ''
                },
                rows: {
                    type: 'number',
                    label: 'Number of visible text rows',
                    default: 4
                },
                maxlength: {
                    type: 'number',
                    label: 'Maximum number of characters allowed',
                    default: null
                },
                autoGrow: {
                    type: 'boolean',
                    label: 'Automatically grow the textarea height to fit content',
                    default: false
                }
            }"
        >
            <template #default="{ props }">
                <GTextarea
                    v-model="textareaValue"
                    v-bind="props"
                />
                <DemoResult>{{ textareaValue }}</DemoResult>
            </template>
        <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Label</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    label</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Placeholder text</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    placeholder</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Disabled</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    disabled</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Read-only</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    readonly</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Required</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    required</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Error messages array (supports multiple validation errors)</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    errors</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">[];</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Instructions</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    instructions</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Number of visible text rows</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    rows</span><span style="color:#000000">?: </span><span style="color:#267F99">number</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Maximum number of characters allowed</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    maxlength</span><span style="color:#000000">?: </span><span style="color:#267F99">number</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Automatically grow the textarea height to fit content</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    autoGrow</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
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
        <template #docs><p>A multi-line plain text input with styling for a label, instructions,
and error messages.</p>
<p>If <code>label</code> is omitted, an accessible label must be provided some other way.
All non-prop attributes are passed through to the textarea element, including
<code>id</code>.</p>
<p>In standard Vue usage, this registers with the nearest parent <code>GForm</code> via
injection. In custom-elements mode, use matching <code>form-key</code> values to pair
with a <code>GForm</code>.</p>
<p>Errors are provided as an array of strings or computed values.
Multiple errors will all be displayed.</p>
</template>
        </ComponentDemo>
    </ComponentSection>
</template>
