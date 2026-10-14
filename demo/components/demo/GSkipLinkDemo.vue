<script setup lang="ts">
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
</script>

<template>
    <ComponentSection title="Skip Link">
        <ComponentDemo
            description="Hidden until focused. Tab into the preview to reveal it, then press Enter to move focus to the target."
            component="GSkipLink"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Link text',
                    default: 'Skip to main content'
                }
            }"
        >
            <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Id of the element to move focus to</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    target</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Link text</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    label</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#000000">};</span></span></code></pre>
</figure>

</template>
            <template #docs><p>A &quot;skip to main content&quot; link for keyboard and screen reader users.</p>
<p>Place it as the first focusable element in the app, before <code>GAppHeader</code>.
It stays hidden until it receives keyboard focus. Activating it moves
focus to the element with the <code>target</code> id (usually a <code>GMain</code>), falling
back to the first <code>&lt;main&gt;</code> element.</p>
<p>Focus is moved with JavaScript, so it works with client-side routers
and with targets that are rendered after the link.</p>
<figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#800000">&#x3C;GSkipLink</span><span style="color:#800000"> /></span></span>
<span class="line"><span style="color:#800000">&#x3C;GAppHeader></span><span style="color:#000000">...</span><span style="color:#800000">&#x3C;/GAppHeader></span></span>
<span class="line"><span style="color:#800000">&#x3C;RouterView</span><span style="color:#800000"> /></span></span></code></pre>
</figure>

</template>
            <template #default="{ props }">
                <div class="skip-link-demo">
                    <GSkipLink v-bind="props" target="skip-link-demo-target" />
                    <p>Header content and navigation would go here.</p>
                    <div id="skip-link-demo-target" class="skip-link-demo__target">
                        Main content
                    </div>
                </div>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>

<style scoped>
.skip-link-demo {
    position: relative;
    transform: translateZ(0);
    overflow: hidden;
    padding-top: 3.5rem;
}

.skip-link-demo__target {
    padding: 1rem;
    border: 1px dashed var(--g-surface-400);
}
</style>
