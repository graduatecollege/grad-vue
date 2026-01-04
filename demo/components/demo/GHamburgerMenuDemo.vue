<script setup lang="ts">
import ComponentDemo from "../ComponentDemo.vue";
</script>

<template>
    <section id="hamburger-menu" class="demo-section">
        <h2 class="demo-section__title">Hamburger Menu</h2>
        <ComponentDemo
            description="A hamburger menu button."
            component="GHamburgerMenu"
            class="hamburgur-menu-demo"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Accessible label',
                    default: 'Main Navigation'
                }
            }"
        >
            <template #docs><p>A hamburger menu button that toggles a sidebar, intended for the
GAppHeader and GSidebar components.</p>
<p><span id="use-sidebar">Use with the <code>useSidebar</code></span> composable function
that takes care of passing state between the different components.</p>
<p>Here&#39;s an example, this could be your App.vue or a layout file:</p>
<figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#800000">&#x3C;script</span><span style="color:#E50000"> setup</span><span style="color:#E50000"> lang</span><span style="color:#000000">=</span><span style="color:#0000FF">"ts"</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#AF00DB">import</span><span style="color:#000000"> &lcub; </span><span style="color:#001080">computed</span><span style="color:#000000">, </span><span style="color:#001080">h</span><span style="color:#000000">, </span><span style="color:#001080">onMounted</span><span style="color:#000000">, </span><span style="color:#001080">provide</span><span style="color:#000000">, </span><span style="color:#001080">ref</span><span style="color:#000000">, </span><span style="color:#001080">useTemplateRef</span><span style="color:#000000"> } </span><span style="color:#AF00DB">from</span><span style="color:#A31515"> "vue"</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#AF00DB">import</span><span style="color:#000000"> &lcub; </span><span style="color:#001080">useSidebar</span><span style="color:#000000"> } </span><span style="color:#AF00DB">from</span><span style="color:#A31515"> "../src/compose/useSidebar"</span><span style="color:#000000">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#0000FF">const</span><span style="color:#0070C1"> sidebar</span><span style="color:#000000"> = </span><span style="color:#795E26">useSidebar</span><span style="color:#000000">();</span></span>
<span class="line"><span style="color:#795E26">provide</span><span style="color:#000000">(</span><span style="color:#A31515">"sidebar"</span><span style="color:#000000">, </span><span style="color:#001080">sidebar</span><span style="color:#000000">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#008000">// Or optionally a custom breakpoint</span></span>
<span class="line"><span style="color:#008000">// const sidebar = useSidebar("(max-width: 600px)");</span></span>
<span class="line"><span style="color:#800000">&#x3C;/script></span></span></code></pre>
</figure>

<p>As long as GHamburgerMenu and GSidebar are descendants of the component that
provides the sidebar, they will be able to communicate with each other.</p>
<div class="markdown-alert markdown-alert-note">
<p class="markdown-alert-title"><svg class="octicon octicon-info mr-2" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>Note</p>
<p>This button hides itself automatically according to the useSidebar media query.</p>
</div>
</template>
            <template #default="{ props }">
                <GHamburgerMenu v-bind="props">
                    <p>Example content</p>
                </GHamburgerMenu>
            </template>
        </ComponentDemo>
    </section>
</template>

<style>
.hamburgur-menu-demo {
    .g-hamburger-button {
        display: flex !important;
    }
}
</style>