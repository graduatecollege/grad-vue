<script setup lang="ts">
import { ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import { GSidebarMenu } from "@illinois-grad/grad-vue";

const demoItems = [
    { label: "Overview", href: "#sidebar-menu-demo-overview" },
    { label: "Details", href: "#sidebar-menu-demo-details" },
    { label: "More", href: "#sidebar-menu-demo-more" },
    { label: "About", href: "#sidebar-menu-demo-more" },
    { label: "Help", href: "#sidebar-menu-demo-more" },
];
</script>

<template>
    <ComponentSection title="Sidebar Menu">
        <ComponentDemo
            description="A sidebar navigation menu with accessible in-page link focus management."
            component="GSidebarMenu"
            padding="0"
            :props-config="{
                title: {
                    type: 'string',
                    label: 'Title and accessible name',
                    default: 'Sidebar Menu'
                },
                theme: {
                    type: 'select',
                    label: 'Sidebar theme',
                    default: 'light',
                    options: [
                        'light',
                        'dark'
                    ]
                },
                compact: {
                    type: 'boolean',
                    label: 'Use compact layout',
                    default: false
                }
            }"
        >
            <template #default="{ props }">
                <div style="max-width: 300px;">
                    <GSidebarMenu v-bind="props" :items="demoItems" style="min-height: 400px;" />
                </div>
            </template>
            <template #docs><p>A sidebar menu component for use with <code>GSidebar</code>. Displays a title and
a list of links.</p>
<p>This component also supports showing active links for in-page navigation.</p>
<p><strong>Props</strong>:</p>
<ul>
<li><code>items</code> with a list of <code>MenuItem</code> objects. The objects should have:<ul>
<li><code>label</code> for the link text</li>
<li><code>href</code> or <code>to</code> for the destination. If <code>to</code> is used, the links will
be rendered as <code>router-link</code> for vue-router.</li>
</ul>
</li>
<li><code>spy</code> to enable tracking active links for in-page navigation</li>
<li><code>offset</code> to adjust the active link tracking position</li>
<li><code>theme</code> to set the menu theme</li>
</ul>
<p>For tracking the active link, the <code>spy</code> prop must be set to <code>true</code> and
a <code>v-model</code> must be provided that has the ID of the target element (without #).</p>
<p>The composable function <code>useActiveLinkContent</code> can be used to track active links.
It takes the following parameters:</p>
<ul>
<li><code>Ref&lt;HTMLElement&gt;</code> Children of this element will be observed</li>
<li><code>number</code> Offset from the top of the window to consider not visible</li>
<li><code>Ref&lt;string&gt;</code> Ref to store the active element ID</li>
</ul>
<p>The direct children of the element must all have an ID to properly work with
in-page navigation, and the matching menu item&#39;s <code>href</code> should be set to
<code>#&lt;id&gt;</code>.</p>
<p>Here&#39;s a minimal example of a page using <code>useActiveLinkContent</code>:</p>
<figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#800000">&#x3C;script</span><span style="color:#E50000"> setup</span><span style="color:#E50000"> lang</span><span style="color:#000000">=</span><span style="color:#0000FF">"ts"</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#AF00DB">import</span><span style="color:#000000"> &lcub; </span><span style="color:#001080">computed</span><span style="color:#000000">, </span><span style="color:#001080">onMounted</span><span style="color:#000000">, </span><span style="color:#001080">ref</span><span style="color:#000000">, </span><span style="color:#001080">useTemplateRef</span><span style="color:#000000"> } </span><span style="color:#AF00DB">from</span><span style="color:#A31515"> "vue"</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#AF00DB">import</span><span style="color:#000000"> &lcub; </span><span style="color:#001080">useActiveLinkContent</span><span style="color:#000000"> } </span><span style="color:#AF00DB">from</span><span style="color:#A31515"> "@illinois-grad/grad-vue"</span><span style="color:#000000">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#0000FF">const</span><span style="color:#0070C1"> activeId</span><span style="color:#000000"> = </span><span style="color:#795E26">ref</span><span style="color:#000000">&#x3C;</span><span style="color:#267F99">string</span><span style="color:#000000">>(</span><span style="color:#A31515">""</span><span style="color:#000000">);</span></span>
<span class="line"><span style="color:#0000FF">const</span><span style="color:#0070C1"> main</span><span style="color:#000000"> = </span><span style="color:#795E26">useTemplateRef</span><span style="color:#000000">(</span><span style="color:#A31515">"main"</span><span style="color:#000000">);</span></span>
<span class="line"><span style="color:#008000">// onMounted is for Nuxt compatibility</span></span>
<span class="line"><span style="color:#795E26">onMounted</span><span style="color:#000000">(() </span><span style="color:#0000FF">=></span><span style="color:#000000"> &lcub;</span></span>
<span class="line"><span style="color:#795E26">    useActiveLinkContent</span><span style="color:#000000">(</span><span style="color:#001080">main</span><span style="color:#000000">, </span><span style="color:#098658">70</span><span style="color:#000000">, </span><span style="color:#001080">activeId</span><span style="color:#000000">);</span></span>
<span class="line"><span style="color:#000000">});</span></span>
<span class="line"><span style="color:#800000">&#x3C;/script></span></span>
<span class="line"></span>
<span class="line"><span style="color:#800000">&#x3C;template></span></span>
<span class="line"><span style="color:#800000">  &#x3C;GSidebar></span></span>
<span class="line"><span style="color:#800000">      &#x3C;GSidebarMenu</span></span>
<span class="line"><span style="color:#E50000">          :items</span><span style="color:#000000">=</span><span style="color:#0000FF">"[</span></span>
<span class="line"><span style="color:#0000FF">              &lcub; label: 'Buttons', href: '#buttons' },</span></span>
<span class="line"><span style="color:#0000FF">              &lcub; label: 'More Buttons', href: '#more-buttons' }</span></span>
<span class="line"><span style="color:#0000FF">          ]"</span></span>
<span class="line"><span style="color:#E50000">          v-model</span><span style="color:#000000">=</span><span style="color:#0000FF">"activeId"</span></span>
<span class="line"><span style="color:#800000">      /></span></span>
<span class="line"><span style="color:#800000">  &#x3C;/GSidebar></span></span>
<span class="line"><span style="color:#800000">  &#x3C;main</span><span style="color:#E50000"> class</span><span style="color:#000000">=</span><span style="color:#0000FF">"main"</span><span style="color:#E50000"> ref</span><span style="color:#000000">=</span><span style="color:#0000FF">"main"</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">      &#x3C;section</span><span style="color:#E50000"> id</span><span style="color:#000000">=</span><span style="color:#0000FF">"buttons"</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">          &#x3C;h2></span><span style="color:#000000">Buttons</span><span style="color:#800000">&#x3C;/h2></span></span>
<span class="line"><span style="color:#800000">          &#x3C;p></span><span style="color:#000000">Some buttons</span><span style="color:#800000">&#x3C;/p></span></span>
<span class="line"><span style="color:#800000">      &#x3C;/section></span></span>
<span class="line"><span style="color:#800000">      &#x3C;section</span><span style="color:#E50000"> id</span><span style="color:#000000">=</span><span style="color:#0000FF">"more-buttons"</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">          &#x3C;h2></span><span style="color:#000000">More Buttons</span><span style="color:#800000">&#x3C;/h2></span></span>
<span class="line"><span style="color:#800000">          &#x3C;p></span><span style="color:#000000">Some more buttons</span><span style="color:#800000">&#x3C;/p></span></span>
<span class="line"><span style="color:#800000">      &#x3C;/section></span></span>
<span class="line"><span style="color:#800000">  &#x3C;/main></span></span>
<span class="line"><span style="color:#800000">&#x3C;/template></span></span></code></pre>
</figure>

</template>
        </ComponentDemo>
    </ComponentSection>
</template>
