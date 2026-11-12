<script setup lang="ts">
import { useTemplateRef } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";

const notice = useTemplateRef<{ check: () => Promise<void> }>("notice");
const newerVersionUrl = `data:application/json,${encodeURIComponent(JSON.stringify({ buildId: "newer" }))}`;
</script>

<template>
    <ComponentSection title="App Update Notice">
        <ComponentDemo
            description="Appears at the bottom of the screen when a newer build is deployed. The demo simulates a deploy when you check for updates."
            component="GAppUpdateNotice"
            :props-config="{
                message: {
                    type: 'string',
                    label: 'Message shown when an update is available',
                    default: 'This app has been updated. Refresh the page to see the latest changes.'
                },
                reloadLabel: {
                    type: 'string',
                    label: 'Refresh button text',
                    default: 'Refresh page'
                },
                dismissLabel: {
                    type: 'string',
                    label: 'Dismiss button text',
                    default: 'Not now'
                }
            }"
        >
            <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Message shown when an update is available</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    message</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Refresh button text</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    reloadLabel</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Dismiss button text</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    dismissLabel</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Milliseconds between checks while the tab is visible</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    intervalMs</span><span style="color:#000000">?: </span><span style="color:#267F99">number</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * URL of the deployed version file, defaults to the one set by `appBuildVersion()`</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    versionUrl</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Build ID of the running app, defaults to the one set by `appBuildVersion()`</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    currentBuildId</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#000000">};</span></span></code></pre>
</figure>

</template>
            <template #docs><p>Tells users that a newer version of the app has been deployed while their tab
stayed open, and offers to refresh the page.</p>
<p>Build the app with the <code>appBuildVersion()</code> Vite plugin, which gives each build
a unique ID. The notice checks the deployed version when the tab regains focus
or visibility, and every 10 minutes while it is visible. It does nothing in
development or without the plugin.</p>
<figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#008000">// vite.config.ts</span></span>
<span class="line"><span style="color:#AF00DB">import</span><span style="color:#000000"> &lcub; </span><span style="color:#001080">appBuildVersion</span><span style="color:#000000"> } </span><span style="color:#AF00DB">from</span><span style="color:#A31515"> "@illinois-grad/grad-vue/vite"</span><span style="color:#000000">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#AF00DB">export</span><span style="color:#AF00DB"> default</span><span style="color:#795E26"> defineConfig</span><span style="color:#000000">(&lcub;</span></span>
<span class="line"><span style="color:#001080">    plugins:</span><span style="color:#000000"> [</span><span style="color:#795E26">vue</span><span style="color:#000000">(), </span><span style="color:#795E26">appBuildVersion</span><span style="color:#000000">()],</span></span>
<span class="line"><span style="color:#000000">});</span></span></code></pre>
</figure>

<figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#800000">&#x3C;GAppUpdateNotice</span><span style="color:#800000"> /></span></span></code></pre>
</figure>

<p>Serve <code>version.json</code> with <code>Cache-Control: no-store</code>, and optionally call
<code>reloadOnStaleChunks()</code> at startup to recover from lazily loaded chunks that
a deploy removed.</p>
</template>
            <template #default="{ props }">
                <div class="app-update-notice-demo">
                    <GButton size="small" theme="secondary" @click="notice?.check()">Check for updates</GButton>
                    <GAppUpdateNotice
                        ref="notice"
                        v-bind="props"
                        current-build-id="demo"
                        :version-url="newerVersionUrl"
                    />
                </div>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>

<style scoped>
.app-update-notice-demo {
    position: relative;
    transform: translateZ(0);
    min-height: 10rem;
}
</style>
