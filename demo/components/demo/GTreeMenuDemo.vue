<script setup lang="ts">
import { ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import { GTreeMenu } from "@illinois-grad/grad-vue";
import type { TreeMenuItem } from "@illinois-grad/grad-vue";

const bookItems: TreeMenuItem[] = [
    {
        label: "Chapter 1: Introduction",
        children: [
            { label: "1.1 Background", href: "#ch1-background" },
            { label: "1.2 Motivation", href: "#ch1-motivation" },
            {
                label: "1.3 Overview",
                children: [
                    { label: "1.3.1 Part One", href: "#ch1-part1" },
                    { label: "1.3.2 Part Two", href: "#ch1-part2" },
                ],
            },
        ],
    },
    {
        label: "Chapter 2: Methods",
        children: [
            { label: "2.1 Data Collection", href: "#ch2-data" },
            { label: "2.2 Analysis", href: "#ch2-analysis" },
        ],
    },
    {
        label: "Chapter 3: Results",
        children: [
            { label: "3.1 Findings", href: "#ch3-findings" },
            { label: "3.2 Discussion", href: "#ch3-discussion" },
        ],
    },
    { label: "Appendix", href: "#appendix" },
];

const linkedParentItems: TreeMenuItem[] = [
    {
        label: "Chapter 1",
        href: "#ch1",
        children: [
            { label: "Section 1.1", href: "#ch1-s1" },
            { label: "Section 1.2", href: "#ch1-s2" },
        ],
    },
    {
        label: "Chapter 2",
        href: "#ch2",
        children: [
            { label: "Section 2.1", href: "#ch2-s1" },
            { label: "Section 2.2", href: "#ch2-s2" },
        ],
    },
    { label: "References", href: "#refs" },
];
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
                    <GTreeMenu v-bind="props" :items="linkedParentItems" style="min-height: 420px;" />
                </div>
            </template>
        <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Title and accessible name for the nav landmark</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    title</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Items for the menu</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    items</span><span style="color:#000000">: </span><span style="color:#267F99">TreeMenuItem</span><span style="color:#000000">[];</span></span>
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
<p><strong>Props</strong>:</p>
<ul>
<li><code>title</code> - optional heading and accessible name for the nav landmark.</li>
<li><code>items</code> - array of <code>TreeMenuItem</code> objects. Each item may have:<ul>
<li><code>label</code> - display text (required).</li>
<li><code>href</code> or <code>to</code> - link destination. When <code>to</code> is provided and <code>vue-router</code>
is present the link is rendered as a <code>&lt;router-link&gt;</code>.</li>
<li><code>children</code> - nested <code>TreeMenuItem[]</code> for sub-levels (unlimited depth).</li>
</ul>
</li>
<li><code>listType</code> - <code>ul</code> (default) or <code>ol</code>. Use <code>ol</code> for numbered
hierarchies such as book chapters.</li>
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

        <ComponentDemo
            description="Slot-based usage: the menu structure is provided as a plain nested ul/li/a tree in the default slot. Before JavaScript loads the raw list is shown; after mount the full interactive tree takes over."
            component="GTreeMenu"
            padding="0"
        >
            <template #default>
                <div style="max-width: 300px;">
                    <GTreeMenu title="Slot-based Menu" style="min-height: 260px;">
                        <ul>
                            <li>
                                <a href="#ch1">Chapter 1</a>
                                <ul>
                                    <li><a href="#ch1-s1">Section 1.1</a></li>
                                    <li><a href="#ch1-s2">Section 1.2</a></li>
                                </ul>
                            </li>
                            <li>
                                <a href="#ch2">Chapter 2</a>
                                <ul>
                                    <li><a href="#ch2-s1">Section 2.1</a></li>
                                    <li><a href="#ch2-s2">Section 2.2</a></li>
                                </ul>
                            </li>
                            <li><a href="#appendix">Appendix</a></li>
                        </ul>
                    </GTreeMenu>
                </div>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
