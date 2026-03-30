<script setup lang="ts">
import { ref } from "vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GFileInput } from "@illinois-grad/grad-vue";

const singleFile = ref<File[]>([]);
const multipleFiles = ref<File[]>([]);
const imageFiles = ref<File[]>([]);
const errorFiles = ref<File[]>([]);
</script>

<template>
    <section id="file-input" class="demo-section">
        <h2 class="demo-section__title">File Input</h2>

        <ComponentDemo
            name="Single File"
            description="A basic file input for selecting a single file."
            component="GFileInput"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Label',
                    default: 'Upload File'
                },
                instructions: {
                    type: 'string',
                    label: 'Instructions',
                    default: ''
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
                accept: {
                    type: 'string',
                    label: 'Accepted file types (e.g. \'.pdf,.docx\' or \'image/*\')',
                    default: null
                },
                multiple: {
                    type: 'boolean',
                    label: 'Allow multiple file selection',
                    default: false
                },
                maxFileSize: {
                    type: 'number',
                    label: 'Maximum file size in bytes for client-side validation',
                    default: null
                },
                maxFiles: {
                    type: 'number',
                    label: 'Maximum number of files allowed for client-side validation',
                    default: null
                }
            }"
        >
            <template #default="{ props }">
                <GFileInput
                    v-model="singleFile"
                    v-bind="props"
                />
                <DemoResult label="Selected">
                    {{ singleFile.length ? singleFile[0].name : 'None' }}
                </DemoResult>
            </template>
        <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Label</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    label</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Instructions</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    instructions</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Disabled</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    disabled</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Error messages array (supports multiple validation errors)</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    errors</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">[];</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Required</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    required</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Name for form registration</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    name</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Form channel key for custom elements mode</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    formKey</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Accepted file types (e.g. ".pdf,.docx" or "image/*")</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    accept</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Allow multiple file selection</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    multiple</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Maximum file size in bytes for client-side validation</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    maxFileSize</span><span style="color:#000000">?: </span><span style="color:#267F99">number</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Maximum number of files allowed for client-side validation</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    maxFiles</span><span style="color:#000000">?: </span><span style="color:#267F99">number</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#000000">};</span></span></code></pre>
</figure>

</template>
        <template #docs><p>A file input component for accessible file uploads.</p>
<p>If <code>label</code> is omitted, an accessible label must be provided some other way.</p>
<p>In standard Vue usage, this registers with the nearest parent <code>GForm</code> via
injection. In custom-elements mode, use matching <code>form-key</code> values to pair
with a <code>GForm</code>.</p>
<p>Errors are provided as an array of strings. Multiple errors will all be
displayed. Client-side validation errors from <code>maxFileSize</code> and <code>maxFiles</code>
are shown alongside any provided <code>errors</code>.</p>
</template>
        </ComponentDemo>

    </section>
</template>
