<script setup lang="ts">
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import { GButton, GPopover } from "@graduatecollege/grad-vue";
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
            <template #docs><p>Popover that appears next to or over a trigger element, staying visible
in the viewport as much as possible.</p>
<p><strong>Slot</strong> <code>trigger</code> must have an interactive element for which
the only interaction is to open the popover. The trigger element is also used
for <code>aria-labelledby</code>. The trigger is passed a prop <code>toggle</code> which is a function
that toggles the popover&#39;s open state.</p>
<p><strong>Slot</strong> <code>default</code> is the content of the popover.</p>
<p>Example:</p>
<figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#800000">&#x3C;</span><span style="color:#267F99">GPopover</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">    &#x3C;template</span><span style="color:#000000"> #</span><span style="color:#E50000">trigger</span><span style="color:#000000">=</span><span style="color:#000000">"</span><span style="color:#000000">&lcub; </span><span style="color:#001080">toggle</span><span style="color:#000000"> }</span><span style="color:#000000">"</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">        &#x3C;</span><span style="color:#267F99">GButton</span><span style="color:#000000"> @</span><span style="color:#E50000">click</span><span style="color:#000000">=</span><span style="color:#000000">"</span><span style="color:#001080">toggle</span><span style="color:#000000">"</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#000000">            Can Popovers' Popovers have Popovers?</span></span>
<span class="line"><span style="color:#800000">        &#x3C;/</span><span style="color:#267F99">GButton</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">    &#x3C;/template></span></span>
<span class="line"><span style="color:#800000">    &#x3C;div></span><span style="color:#000000">Even if they can, should they?</span><span style="color:#800000">&#x3C;/div></span></span>
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
                        <GPopover>
                            <template #trigger="{ toggle }">
                                <GButton @click="toggle">
                                    Can Popovers have Popovers?
                                </GButton>
                            </template>
                            <div>
                                <p>This is popover content 2!</p>
                                <GPopover>
                                    <template #trigger="{ toggle }">
                                        <GButton @click="toggle">
                                            Can Popovers' Popovers have
                                            Popovers?
                                        </GButton>
                                    </template>
                                    <div>Even if they can, should they?</div>
                                </GPopover>
                            </div>
                        </GPopover>
                    </div>
                </GPopover>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>

<style scoped></style>
