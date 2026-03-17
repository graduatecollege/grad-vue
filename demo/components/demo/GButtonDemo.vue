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
                    default: null,
                    options: [
                        'small',
                        'medium',
                        'large'
                    ]
                },
                theme: {
                    type: 'select',
                    label: 'Button color theme',
                    default: null,
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
                    default: null
                },
                text: {
                    type: 'boolean',
                    label: 'Use text style',
                    default: null
                }
            }"
            docs=""
        >
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
