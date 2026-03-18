<script setup lang="ts">
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import { GSidebar } from "@illinois-grad/grad-vue";
</script>

<template>
    <ComponentSection title="Sidebar">
        <ComponentDemo
            description="A container component intended for persistent side navigation."
            component="GSidebar"
            padding="0"
            :props-config="{
                backgroundColor: {
                    type: 'string',
                    label: 'Custom background color',
                    default: ''
                },
                backgroundImage: {
                    type: 'string',
                    label: 'Custom background image',
                    default: 'none'
                },
                theme: {
                    type: 'select',
                    label: 'Sidebar theme',
                    default: 'dark',
                    options: [
                        'light',
                        'dark'
                    ]
                },
                width: {
                    type: 'string',
                    label: 'Width',
                    default: '300px',
                    instructions: 'Width of the sidebar'
                }
            }"
        >
            <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Custom background color</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    backgroundColor</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Custom background image</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    backgroundImage</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Sidebar theme</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    theme</span><span style="color:#000000">?: </span><span style="color:#A31515">"light"</span><span style="color:#000000"> | </span><span style="color:#A31515">"dark"</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Offset from the top of the viewport</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    topOffset</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Top offset variable to use instead of topOffset</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    topOffsetVar</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Width</span></span>
<span class="line"><span style="color:#008000">     *</span></span>
<span class="line"><span style="color:#008000">     * Width of the sidebar</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    width</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#000000">}</span></span></code></pre>
</figure>

</template>
            <template #docs><p>A simple sidebar that&#39;s fixed to the left side of the viewport.</p>
<p>This includes the CSS for the <code>fixed</code> position and sizing, so the element
should be fairly high in the DOM tree.</p>
<p>If neither <code>top-offset</code> nor <code>top-offset-var</code> are defined, the sidebar will be
offset by <code>var(--g-toolbar-height)</code>. If there is no toolbar, just pass
<code>0</code> as the <code>top-offset</code>.</p>
<p>The sidebar can be made collapsible by providing the <code>sidebar</code> injected
object from <code>useSidebar</code>. See the <a href="#use-sidebar">Hamburger Menu Documentation</a>
for details.</p>
</template>
            <template #default="{ props }">
                <div style="display: flex; gap: 1rem; flex-direction: column;">
                    <div v-if="props.breakpoint">
                        <button @click="props.open = !props.open">Toggle Sidebar (Simulated)</button>
                        <p>Breakpoint active: {{ props.breakpoint }}. Resize window or use button if matched.</p>
                    </div>
                    <GSidebar v-bind="props" v-model:open="props.open" class="sidebar-demo">
                        <div class="sidebar-content">
                            <h3 class="sidebar-title">Sample Heading</h3>
                            <button v-if="props.breakpoint" @click="props.open = false">Close</button>
                        </div>
                    </GSidebar>
                </div>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>

<style scoped>
.demo-section {
    :deep(.g-sidebar__light) {
        h3 {
            color: #000;
        }
    }
}
.sidebar-demo {
    width: 300px;
    height: 450px;
    position: static;
    overflow: hidden;
    color: #fff;
}

.sidebar-demo--compact {
    min-height: 180px;
}

.sidebar-content {
    padding: 1.25rem;
}

.sidebar-title {
    font-size: 1.75rem;
    font-family: var(--il-font-heading);
}

.sidebar-description {
    margin: 0.75rem 0 0;
}
</style>
