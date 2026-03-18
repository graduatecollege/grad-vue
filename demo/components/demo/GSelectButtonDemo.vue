<script setup lang="ts">
import { ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GSelectButton } from "@illinois-grad/grad-vue";

const selectButtonValue = ref("option1");
const selectButtonOptions = ref([
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
]);
</script>

<template>
    <ComponentSection title="Select Button">
        <ComponentDemo
            description="A button-style select component for choosing between options."
            component="GSelectButton"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Accessible label',
                    default: 'Select Option'
                },
                size: {
                    type: 'select',
                    label: 'Size',
                    default: 'medium',
                    options: [
                        'small',
                        'medium',
                        'large'
                    ]
                },
                disabled: {
                    type: 'boolean',
                    label: 'Disabled',
                    default: false
                }
            }"
        >
            <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * List of options to select from</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    options</span><span style="color:#000000">: </span><span style="color:#267F99">Array</span><span style="color:#000000">&#x3C;</span><span style="color:#267F99">string</span><span style="color:#000000"> | </span><span style="color:#267F99">OptionType</span><span style="color:#000000">>;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Accessible label</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    label</span><span style="color:#000000">: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Size</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    size</span><span style="color:#000000">?: </span><span style="color:#A31515">"small"</span><span style="color:#000000"> | </span><span style="color:#A31515">"medium"</span><span style="color:#000000"> | </span><span style="color:#A31515">"large"</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Name for form registration</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    name</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Disabled</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    disabled</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Error messages array (supports multiple validation errors)</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    errors</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">[];</span></span>
<span class="line"><span style="color:#000000">}</span></span></code></pre>
</figure>

</template>
            <template #docs><p>This component is just a radio button group with special styling.</p>
<p>Use the <code>options</code> prop to provide a list of choices. Each option can
be a string or an object with <code>label</code> and <code>value</code> properties.</p>
<p>In addition to <code>v-model</code>, a <code>change</code> event is emitted when the
option changes from user interaction.</p>
</template>
            <template #default="{ props }">
                <GSelectButton
                    v-model="selectButtonValue"
                    v-bind="props"
                    :label="props.label"
                    :options="selectButtonOptions"
                    style="max-width: 300px;"
                />
                <DemoResult label="Selected">{{
                    selectButtonValue
                }}</DemoResult>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
