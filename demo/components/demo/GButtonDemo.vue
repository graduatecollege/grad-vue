<script setup lang="ts">
import { ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import { GButton } from "@illinois-grad/grad-vue";

const clickCount = ref(0);
const handleClick = () => {
    clickCount.value++;
};
</script>

<template>
    <ComponentSection title="Button">
        <ComponentDemo
            description="A versatile button component with multiple size and theme options."
            component="GButton"
            :props-config="{
                size: {
                    type: 'select',
                    label: 'Button size',
                    default: 'medium',
                    options: [
                        'small',
                        'medium',
                        'large'
                    ]
                },
                theme: {
                    type: 'select',
                    label: 'Button color theme',
                    default: 'primary',
                    options: [
                        'primary',
                        'secondary',
                        'accent',
                        'danger',
                        'none'
                    ]
                },
                outlined: {
                    type: 'boolean',
                    label: 'Use outlined style',
                    default: false
                },
                text: {
                    type: 'boolean',
                    label: 'Use text style',
                    default: false
                }
            }"
            docs=""
        >
            <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Button size</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    size</span><span style="color:#000000">?: </span><span style="color:#A31515">"small"</span><span style="color:#000000"> | </span><span style="color:#A31515">"medium"</span><span style="color:#000000"> | </span><span style="color:#A31515">"large"</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Button color theme</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    theme</span><span style="color:#000000">?: </span><span style="color:#A31515">"primary"</span><span style="color:#000000"> | </span><span style="color:#A31515">"secondary"</span><span style="color:#000000"> | </span><span style="color:#A31515">"accent"</span><span style="color:#000000"> | </span><span style="color:#A31515">"danger"</span><span style="color:#000000"> | </span><span style="color:#A31515">"none"</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Use outlined style</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    outlined</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Use text style</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    text</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * The to target for when using the button as a router-link</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    to</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000"> | </span><span style="color:#267F99">Record</span><span style="color:#000000">&#x3C;</span><span style="color:#267F99">string</span><span style="color:#000000">, </span><span style="color:#267F99">any</span><span style="color:#000000">>;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * The component to use for the button</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    component</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Optional icon classes to render an icon span before the label. Example: "fa-solid fa-plus" or "material-symbols:add". If a named slot `icon` is provided, it takes precedence over this prop.</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    icon</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Native button type</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    type</span><span style="color:#000000">?: </span><span style="color:#A31515">"button"</span><span style="color:#000000"> | </span><span style="color:#A31515">"submit"</span><span style="color:#000000"> | </span><span style="color:#A31515">"reset"</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#000000">}</span></span></code></pre>
</figure>

</template>
            <template #docs><p>The element or component can be set with the <code>component</code> prop, so it can be
a link or <code>router-link</code> component from vue-router. For example:</p>
<figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#800000">&#x3C;</span><span style="color:#267F99">GButton</span><span style="color:#E50000"> component</span><span style="color:#000000">=</span><span style="color:#0000FF">"router-link"</span><span style="color:#E50000"> to</span><span style="color:#000000">=</span><span style="color:#0000FF">"/some-route"</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#000000">    Click me</span></span>
<span class="line"><span style="color:#800000">&#x3C;/</span><span style="color:#267F99">GButton</span><span style="color:#800000">></span></span></code></pre>
</figure>

<p>Note that grad-vue doesn&#39;t include vue-router as a dependency.</p>
<p><strong>Icons</strong> can be added with either the <code>icon</code> prop or a named slot <code>icon</code>:</p>
<ul>
<li>Use the <code>icon</code> prop to pass an icon class string, e.g., &quot;fa-solid fa-plus&quot;.</li>
<li>If using the <code>icon</code> prop, the icon will be rendered as a span with the <code>aria-hidden</code> attribute set to <code>true</code>.</li>
<li>Use a named slot <code>icon</code> to provide custom icon content.</li>
<li>If both <code>icon</code> prop and named slot <code>icon</code> are provided, the named slot takes precedence.</li>
</ul>
</template>
            <template #default="{ props }">
                <GButton v-bind="props" @click="handleClick">
                    Click Me ({{ clickCount }})
                </GButton>
            </template>
        </ComponentDemo>

        <div class="additional-demos">
            <ComponentDemo additional name="Button Sizes">
                <div class="demo-variants">
                    <GButton size="small">Small Button</GButton>
                    <GButton size="medium">Medium Button</GButton>
                    <GButton size="large">Large Button</GButton>
                </div>
            </ComponentDemo>

            <ComponentDemo additional name="Button Themes">
                <div class="demo-variants">
                    <GButton theme="primary">Primary</GButton>
                    <GButton theme="secondary">Secondary</GButton>
                    <GButton theme="accent">Accent</GButton>
                    <GButton theme="danger">Danger</GButton>
                </div>
            </ComponentDemo>

            <ComponentDemo additional name="Button Variants">
                <div class="demo-variants">
                    <GButton outlined>Outlined</GButton>
                    <GButton text>Text Button</GButton>
                    <GButton>
                        <template #icon>
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                stroke="currentColor"
                                role="none presentation"
                            >
                                <path
                                    d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z"
                                />
                            </svg>
                        </template>
                        With SVG
                    </GButton>
                </div>
            </ComponentDemo>
        </div>
    </ComponentSection>
</template>

<style scoped>
.demo-variants {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
}
</style>
