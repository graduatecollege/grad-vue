<script setup lang="ts">
import { ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import { GTreeMenu, GTreeMenuList, GTreeMenuItem } from "@illinois-grad/grad-vue";
</script>

<template>
    <ComponentSection title="Tree Menu">
        <ComponentDemo
            description="A hierarchical sidebar menu for book-like or nested-section navigation. Items with children collapse and expand individually. Supports keyboard navigation (↑↓ to move, →← to expand/collapse, Home/End)."
            component="GTreeMenu"
            padding="0"
            :props-config="{
                title: {
                    type: 'string',
                    label: 'Title and accessible name for the nav landmark',
                    default: 'Tree Menu'
                },
                listType: {
                    type: 'select',
                    label: 'List element type - use `ol` for numbered hierarchies like book chapters',
                    default: 'ul',
                    options: [
                        'ul',
                        'ol'
                    ]
                },
                theme: {
                    type: 'select',
                    label: 'Theme',
                    default: 'light',
                    options: [
                        'light',
                        'dark'
                    ]
                }
            }"
        >
            <template #default="{ props }">
                <div style="max-width: 300px;">
                    <GTreeMenu v-bind="props" style="min-height: 420px;">
                        <GTreeMenuList>
                            <GTreeMenuItem label="Chapter 1">
                                <a href="#ch1">Chapter 1</a>
                                <template #children>
                                    <GTreeMenuItem><a href="#ch1-s1">Section 1.1</a></GTreeMenuItem>
                                    <GTreeMenuItem><a href="#ch1-s2">Section 1.2</a></GTreeMenuItem>
                                </template>
                            </GTreeMenuItem>
                            <GTreeMenuItem label="Chapter 2">
                                <a href="#ch2">Chapter 2</a>
                                <template #children>
                                    <GTreeMenuItem><a href="#ch2-s1">Section 2.1</a></GTreeMenuItem>
                                    <GTreeMenuItem><a href="#ch2-s2">Section 2.2</a></GTreeMenuItem>
                                </template>
                            </GTreeMenuItem>
                            <GTreeMenuItem><a href="#refs">References</a></GTreeMenuItem>
                        </GTreeMenuList>
                    </GTreeMenu>
                </div>
            </template>
        <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Title and accessible name for the nav landmark</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    title</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * List element type - use `ol` for numbered hierarchies like book chapters</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    listType</span><span style="color:#000000">?: </span><span style="color:#A31515">"ul"</span><span style="color:#000000"> | </span><span style="color:#A31515">"ol"</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Theme</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    theme</span><span style="color:#000000">?: </span><span style="color:#A31515">"light"</span><span style="color:#000000"> | </span><span style="color:#A31515">"dark"</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#000000">};</span></span></code></pre>
</figure>

</template>
        <template #docs><p>A hierarchical sidebar menu component suitable for book-like or nested-section
navigation. Items with children start collapsed and can be expanded/collapsed
individually.</p>
<p>Links are authored directly in HTML for progressive enhancement — the page
works as a basic list of links even without JavaScript.</p>
<p>Use <code>GTreeMenuList</code> and <code>GTreeMenuItem</code> sub-components to build the menu:</p>
<figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#800000">&#x3C;</span><span style="color:#267F99">GTreeMenu</span><span style="color:#E50000"> title</span><span style="color:#000000">=</span><span style="color:#0000FF">"Contents"</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">    &#x3C;</span><span style="color:#267F99">GTreeMenuList</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">        &#x3C;</span><span style="color:#267F99">GTreeMenuItem</span><span style="color:#E50000"> label</span><span style="color:#000000">=</span><span style="color:#0000FF">"Chapter 1"</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">            &#x3C;a</span><span style="color:#E50000"> href</span><span style="color:#000000">=</span><span style="color:#0000FF">"#ch1"</span><span style="color:#800000">></span><span style="color:#000000">Chapter 1</span><span style="color:#800000">&#x3C;/a></span></span>
<span class="line"><span style="color:#800000">            &#x3C;template</span><span style="color:#000000"> #</span><span style="color:#E50000">children</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">                &#x3C;</span><span style="color:#267F99">GTreeMenuItem</span><span style="color:#800000">>&#x3C;a</span><span style="color:#E50000"> href</span><span style="color:#000000">=</span><span style="color:#0000FF">"#s1"</span><span style="color:#800000">></span><span style="color:#000000">Section 1.1</span><span style="color:#800000">&#x3C;/a>&#x3C;/</span><span style="color:#267F99">GTreeMenuItem</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">            &#x3C;/template></span></span>
<span class="line"><span style="color:#800000">        &#x3C;/</span><span style="color:#267F99">GTreeMenuItem</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">    &#x3C;/</span><span style="color:#267F99">GTreeMenuList</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">&#x3C;/</span><span style="color:#267F99">GTreeMenu</span><span style="color:#800000">></span></span></code></pre>
</figure>

<p><strong>Props</strong>:</p>
<ul>
<li><code>title</code> - optional heading and accessible name for the nav landmark.</li>
<li><code>listType</code> - <code>ul</code> (default) or <code>ol</code>. Use <code>ol</code> for numbered
hierarchies such as book chapters. Inherited by nested <code>GTreeMenuList</code>
components via provide/inject.</li>
<li><code>theme</code> - <code>light</code> (default) or <code>dark</code>.</li>
</ul>
<p><strong>Keyboard navigation</strong> (tree-view style):</p>
<ul>
<li><code>Up Arrow</code> / <code>Down Arrow</code> - move between visible menu items.</li>
<li><code>Right Arrow</code> - expand a collapsed item; if already expanded, move to its first child.</li>
<li><code>Left Arrow</code> - collapse an expanded item; if already collapsed, move focus to its
parent.</li>
<li><code>Home</code> / <code>End</code> - jump to the first or last visible item.</li>
</ul>
</template>
        </ComponentDemo>
    </ComponentSection>
</template>
