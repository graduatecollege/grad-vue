<script setup lang="ts">
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import { GHistoryScroller } from "@illinois-grad/grad-vue";
import { ref } from "vue";

const historyEntries = ref([
    { id: "twelve" },
    { id: "eleven" },
    { id: "ten" },
    { id: "nine" },
    { id: "eight" },
    { id: "seven" },
    { id: "six" },
    { id: "five" },
    { id: "four" },
    { id: "three" },
    { id: "two" },
    { id: "one" },
]);
</script>

<template>
    <ComponentSection title="History Scroller">
        <ComponentDemo
            description="Scroller that starts at the bottom."
            component="GHistoryScroller"
            padding="0"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Accessible label',
                    default: 'History',
                },
            }"
        >
            <template #docs
                ><p>
                    A scroller that is used for content that&#39;s typically
                    shown like a chat log, meaning it starts at the bottom, and
                    you scroll up for older entries.
                </p>
                <p>
                    The scroller automatically starts at the bottom. When
                    scrolled up, a button appears that jumps to the bottom. This
                    button is also the first focusable element for
                    accessibility.
                </p>
                <p>
                    If the <code>label</code> is provided, the scroller will
                    have the ARIA <code>role=&quot;log&quot;</code> and the
                    label as the <code>aria-label</code>.
                </p>
                <p>
                    <strong>Slot</strong> <code>default</code> is what will be
                    rendered for each entry in the <code>entries</code>. For
                    example:
                </p>
                <figure class="highlighted-code">
                    <pre
                        class="shiki light-plus"
                        style="background-color: #ffffff; color: #000000"
                        tabindex="0"
                    ><code><span class="line"><span style="color:#800000">&#x3C;</span><span style="color:#267F99">GHistoryScroller</span></span>
<span class="line"><span style="color:#E50000">    v-bind</span><span style="color:#000000">=</span><span style="color:#000000">"</span><span style="color:#001080">props</span><span style="color:#000000">"</span></span>
<span class="line"><span style="color:#000000">    :</span><span style="color:#E50000">entries</span><span style="color:#000000">=</span><span style="color:#000000">"</span><span style="color:#001080">historyEntries</span><span style="color:#000000">"</span></span>
<span class="line"><span style="color:#E50000">    class</span><span style="color:#000000">=</span><span style="color:#0000FF">"history-scroller"</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">    &#x3C;template</span><span style="color:#000000"> #</span><span style="color:#E50000">default</span><span style="color:#000000">=</span><span style="color:#000000">"</span><span style="color:#000000">&lcub; </span><span style="color:#001080">entry</span><span style="color:#000000"> }</span><span style="color:#000000">"</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">        &#x3C;div</span><span style="color:#E50000"> class</span><span style="color:#000000">=</span><span style="color:#0000FF">"history-entry"</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#000000">            This is history for: &lcub;&lcub; entry.id }}</span></span>
<span class="line"><span style="color:#800000">        &#x3C;/div></span></span>
<span class="line"><span style="color:#800000">    &#x3C;/template></span></span>
<span class="line"><span style="color:#800000">&#x3C;/</span><span style="color:#267F99">GHistoryScroller</span><span style="color:#800000">></span></span></code></pre>
                </figure>
            </template>
            <template #default="{ props }">
                <GHistoryScroller
                    v-bind="props"
                    :entries="historyEntries"
                    class="history-scroller"
                >
                    <template #default="{ entry }">
                        <div class="history-entry">
                            This is history for: {{ entry.id }}
                        </div>
                    </template>
                </GHistoryScroller>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>

<style scoped>
.history-scroller {
    height: 200px;
}
</style>