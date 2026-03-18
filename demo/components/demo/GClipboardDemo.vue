<script setup lang="ts">
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
</script>

<template>
    <ComponentSection title="Clipboard">
        <ComponentDemo
            description="Scaffolded demo for GClipboard."
            component="GClipboard"
            :props-config="{
                text: {
                    type: 'string',
                    label: 'Text',
                    default: 'This is some text to get copied'
                },
                hideText: {
                    type: 'boolean',
                    label: 'Hide the visible text',
                    default: null
                },
                copyLabel: {
                    type: 'string',
                    label: 'Copy button label',
                    default: null
                }
            }"
        >
            <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Text</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    text</span><span style="color:#000000">: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Hide the visible text</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    hideText</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Copy button label</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    copyLabel</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#000000">}</span></span></code></pre>
</figure>

</template>
            <template #docs><p>Displays text with a clipboard button that copies the text to the clipboard.
The text can be hidden in cases where it&#39;s already displayed differently.</p>
<p>If for some reason the user&#39;s browser doesn&#39;t support a clipboard,
the tooltip will indicate that when they try to copy.</p>
</template>
            <template #default="{ props }">
                <GClipboard v-bind="props" />
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
