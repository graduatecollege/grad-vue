<script setup lang="ts">
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import { GButton, GPopover } from "@illinois-grad/grad-vue";
</script>

<template>
    <ComponentSection title="Popover">
        <ComponentDemo
            description="A popover overlay component that appears relative to a trigger element."
            component="GPopover"
            :props-config="{
                minimal: {
                    type: 'boolean',
                    label: 'Render without padding',
                    default: false
                }
            }"
        >
            <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Render without padding</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    minimal</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * v-model binding for the open state. Also works as a plain prop/attribute in custom-element mode where `defineModel` would revert local state.</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    modelValue</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#000000">}</span></span></code></pre>
</figure>

</template>
            <template #docs><p>Popover that appears next to or over a trigger element, staying visible
in the viewport as much as possible.</p>
<p><strong>Slot</strong> <code>trigger</code> is optional. When provided, it should contain an
interactive element for opening the popover and it is used for
<code>aria-labelledby</code>. The trigger is passed a prop <code>toggle</code> which is a function
that toggles the popover&#39;s open state.</p>
<p>Without a trigger slot, open the popover programmatically via <code>show()</code> or
<code>toggle()</code> on the component instance / custom element.</p>
<p><strong>Slot</strong> <code>default</code> is the content of the popover.</p>
<p>Example:</p>
<figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#800000">&#x3C;</span><span style="color:#267F99">GPopover</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">    &#x3C;template</span><span style="color:#000000"> #</span><span style="color:#E50000">trigger</span><span style="color:#000000">=</span><span style="color:#000000">"</span><span style="color:#000000">&lcub; </span><span style="color:#001080">toggle</span><span style="color:#000000"> }</span><span style="color:#000000">"</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">        &#x3C;</span><span style="color:#267F99">GButton</span><span style="color:#000000"> @</span><span style="color:#E50000">click</span><span style="color:#000000">=</span><span style="color:#000000">"</span><span style="color:#001080">toggle</span><span style="color:#000000">"</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#000000">            Can Popovers have Popovers?</span></span>
<span class="line"><span style="color:#800000">        &#x3C;/</span><span style="color:#267F99">GButton</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">    &#x3C;/template></span></span>
<span class="line"><span style="color:#800000">    &#x3C;div></span><span style="color:#000000">In theory, but I wouldn't recommend it.</span><span style="color:#800000">&#x3C;/div></span></span>
<span class="line"><span style="color:#800000">&#x3C;/</span><span style="color:#267F99">GPopover</span><span style="color:#800000">></span></span></code></pre>
</figure>

</template>
            <template #default="{ props }">
                <GPopover v-bind="props">
                    <template #trigger="{ toggle }">
                        <GButton @click="toggle">Toggle Popover</GButton>
                    </template>
                    <div>
                        <p>This is popover content!</p>
                    </div>
                </GPopover>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>

<style scoped></style>
