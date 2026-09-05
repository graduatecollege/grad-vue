<script setup lang="ts">
import ComponentDemo from "../ComponentDemo.vue";
</script>

<template>
    <section id="toggle" class="demo-section">
        <h2 class="demo-section__title">Toggle</h2>
        <ComponentDemo
            description="A compact toggle with off and on states."
            component="GToggle"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Accessible label',
                    default: 'Toggle'
                },
                error: {
                    type: 'string',
                    label: 'Error message',
                    default: null
                },
                disabled: {
                    type: 'boolean',
                    label: 'Disabled',
                    default: null
                }
            }"
        >
            <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Accessible label</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    label</span><span style="color:#000000">: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * ID of an element that describes the input</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    describedby</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Error message</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    error</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Disabled</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    disabled</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#000000">};</span></span></code></pre>
</figure>

</template>
            <template #docs><p>A compact two-state toggle for boolean values.</p>
<p>Arrow keys and the &#39;y&#39; and &#39;n&#39; keys can be used to set the value when the
toggle has focus. A <code>describedby</code> prop can be passed with an ID to an
element to be used as the <code>aria-describedby</code> for the toggle group.</p>
<p>When the value changes, <code>v-model</code> is updated. A <code>change</code> event is also
emitted if the value changed from user interaction.</p>
<p>Slots:</p>
<ul>
<li><code>label</code>: Custom label content. Defaults to <code>label</code> prop if not provided.</li>
</ul>
</template>
            <template #default="{ props }">
                <div style="max-width: 200px">
                    <GToggle v-bind="props" />
                </div>
            </template>
        </ComponentDemo>
    </section>
</template>
