<script setup lang="ts">
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
</script>

<template>
    <ComponentSection title="Main">
        <ComponentDemo
            description="The main landmark for a page, used as the focus target by GSkipLink and useRouteAnnouncer. This page already has a main landmark, so there's no live preview."
            component="GMain"
        >
            <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Id used by `GSkipLink` and `useRouteAnnouncer` to find the landmark</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    id</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#000000">};</span></span></code></pre>
</figure>

</template>
            <template #docs><p>The <code>&lt;main&gt;</code> landmark for a page, set up as the target for
<code>GSkipLink</code> and <code>useRouteAnnouncer</code>.</p>
<p>Use one per page, inside each view rather than around <code>&lt;RouterView&gt;</code>,
so sidebars and other complementary content stay outside the landmark.</p>
<figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#800000">&#x3C;template></span></span>
<span class="line"><span style="color:#800000">    &#x3C;GSidebar></span><span style="color:#000000">...</span><span style="color:#800000">&#x3C;/GSidebar></span></span>
<span class="line"><span style="color:#800000">    &#x3C;GMain</span><span style="color:#E50000"> class</span><span style="color:#000000">=</span><span style="color:#0000FF">"profile"</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">        &#x3C;h1></span><span style="color:#000000">Profile</span><span style="color:#800000">&#x3C;/h1></span></span>
<span class="line"><span style="color:#800000">    &#x3C;/GMain></span></span>
<span class="line"><span style="color:#800000">&#x3C;/template></span></span></code></pre>
</figure>

<h2>Accessible route changes</h2>
<p>Use the <code>useRouteAnnouncer</code> composable once in the root component.
After each navigation to a different page, it moves focus to the <code>&lt;h1&gt;</code>
inside <code>GMain</code> (or <code>GMain</code> itself) and announces the new page title.
Navigations that only change the query or hash are ignored.</p>
<figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#008000">// App.vue setup</span></span>
<span class="line"><span style="color:#AF00DB">import</span><span style="color:#000000"> &lcub; </span><span style="color:#001080">useRouter</span><span style="color:#000000"> } </span><span style="color:#AF00DB">from</span><span style="color:#A31515"> "vue-router"</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#AF00DB">import</span><span style="color:#000000"> &lcub; </span><span style="color:#001080">useRouteAnnouncer</span><span style="color:#000000"> } </span><span style="color:#AF00DB">from</span><span style="color:#A31515"> "@illinois-grad/grad-vue"</span><span style="color:#000000">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#795E26">useRouteAnnouncer</span><span style="color:#000000">(</span><span style="color:#795E26">useRouter</span><span style="color:#000000">());</span></span></code></pre>
</figure>

<figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#800000">&#x3C;GSkipLink</span><span style="color:#800000"> /></span></span>
<span class="line"><span style="color:#800000">&#x3C;GAppHeader></span><span style="color:#000000">...</span><span style="color:#800000">&#x3C;/GAppHeader></span></span>
<span class="line"><span style="color:#800000">&#x3C;RouterView</span><span style="color:#800000"> /></span></span></code></pre>
</figure>

<p>Options can customize what counts as a new page (<code>isNewPage</code>), when focus
moves (<code>focus</code>), waiting for async page data (<code>ready</code>), and the
announcement text (<code>message</code>).</p>
</template>
            <template #default>
                <pre><code>&lt;GMain&gt;
    &lt;h1&gt;Page title&lt;/h1&gt;
&lt;/GMain&gt;</code></pre>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
