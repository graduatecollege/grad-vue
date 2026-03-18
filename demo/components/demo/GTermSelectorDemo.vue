<script setup lang="ts">
import ComponentDemo from "../ComponentDemo.vue";
import { GTermSelector } from "@illinois-grad/grad-vue";
import { ref } from "vue";
import DemoResult from "~/components/DemoResult.vue";

const term = ref({ year: "2026", name: "Spring" });
const termYears = ref(["2026", "2025", "2024"]);
</script>

<template>
    <section id="term-selector" class="demo-section">
        <h2 class="demo-section__title">Term Selector</h2>
        <ComponentDemo
            description="A button to show and select a term."
            component="GTermSelector"
            :props-config="{
                title: {
                    type: 'string',
                    label: 'Title for the popover.',
                    default: 'Period Selection'
                },
                yearLabel: {
                    type: 'string',
                    label: 'Label for year select.',
                    default: 'Select Year'
                },
                periodLabel: {
                    type: 'string',
                    label: 'Label for period select.',
                    default: 'Term'
                }
            }"
        >
            <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Title for the popover.</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    title</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Label for year select.</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    yearLabel</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Label for period select.</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    periodLabel</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * List of possible term years</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    termYears</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">[];</span></span>
<span class="line"></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * List of possible term names</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    termNames</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">[];</span></span>
<span class="line"><span style="color:#000000">}</span></span></code></pre>
</figure>

</template>
            <template #docs><p>A button that shows the selected term. Clicking it opens a popover
that allows jumping to a different term.</p>
</template>
            <template #default="{ props }">
                <GTermSelector
                    v-bind="props"
                    v-model="term"
                    :term-years="termYears"
                >
                    <p>Example content</p>
                </GTermSelector>
                <DemoResult label="Selected">{{ term }}</DemoResult>
            </template>
        </ComponentDemo>
    </section>
</template>
