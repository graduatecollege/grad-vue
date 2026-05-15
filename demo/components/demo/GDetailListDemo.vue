<script setup lang="ts">
import ComponentDemo from "../ComponentDemo.vue";
</script>

<template>
    <section id="detail-list" class="demo-section">
        <h2 class="demo-section__title">Detail List</h2>
        <ComponentDemo
            description="Displays labeled values in a grid or vertical layout."
            component="GDetailList"
            :props-config="{
                variant: {
                    type: 'select',
                    label: 'Layout style for the items.',
                    default: 'grid',
                    options: [
                        'grid',
                        'vertical'
                    ]
                }
            }"
        >
            <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Layout style for the items.</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    variant</span><span style="color:#000000">?: </span><span style="color:#A31515">"grid"</span><span style="color:#000000"> | </span><span style="color:#A31515">"vertical"</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#000000">}</span></span></code></pre>
</figure>

</template>
            <template #docs><p>This component is used with the <code>GDetailListItem</code> component to display
a list of key-value pairs in a grid or vertical layout.</p>
<div class="markdown-alert markdown-alert-warning">
<p class="markdown-alert-title"><svg class="octicon octicon-alert mr-2" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>Warning</p>
<p>This component is not accessible in Custom Elements mode because there
is no way to avoid the custom elements being nested in <code>&lt;dl&gt;</code> tags, which
is not valid HTML. You can use the classes instead for the same styling.</p>
</div>
<p>For example:</p>
<figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#800000">&#x3C;</span><span style="color:#267F99">GDetailList</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">    &#x3C;</span><span style="color:#267F99">GDetailListItem</span><span style="color:#E50000"> label</span><span style="color:#000000">=</span><span style="color:#0000FF">"Name"</span><span style="color:#800000">></span><span style="color:#000000">John Doe</span><span style="color:#800000">&#x3C;/</span><span style="color:#267F99">GDetailListItem</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">    &#x3C;</span><span style="color:#267F99">GDetailListItem</span><span style="color:#E50000"> label</span><span style="color:#000000">=</span><span style="color:#0000FF">"Age"</span><span style="color:#800000">></span><span style="color:#000000">30</span><span style="color:#800000">&#x3C;/</span><span style="color:#267F99">GDetailListItem</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">    &#x3C;</span><span style="color:#267F99">GDetailListItem</span><span style="color:#E50000"> label</span><span style="color:#000000">=</span><span style="color:#0000FF">"City"</span><span style="color:#800000">></span><span style="color:#000000">New York</span><span style="color:#800000">&#x3C;/</span><span style="color:#267F99">GDetailListItem</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">&#x3C;/</span><span style="color:#267F99">GDetailList</span><span style="color:#800000">></span></span></code></pre>
</figure>

</template>
            <template #default="{ props }">
                <GDetailList v-bind="props">
                    <GDetailListItem label="Description">Engineering: Energy Systems</GDetailListItem>
                    <GDetailListItem label="Major">Engineering</GDetailListItem>
                    <GDetailListItem label="Department Code">123</GDetailListItem>
                    <GDetailListItem label="College Name">Grainger Engineering</GDetailListItem>
                </GDetailList>
            </template>
        </ComponentDemo>
    </section>
</template>
