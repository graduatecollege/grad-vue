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
            <template #docs><p>This component is used with the <code>GDetailListItem</code> component to display
a list of key-value pairs in a grid or vertical layout.</p>
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
