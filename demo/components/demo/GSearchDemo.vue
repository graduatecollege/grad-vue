<script setup lang="ts">
import { computed, ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import GSearch from "../../../src/components/GSearch.vue";

const searchQuery = ref("");
const select = ref("");
const searchLoading = ref(false);

interface SearchResult {
    id: string;
    title: string;
}

const searchData = ref<SearchResult[]>([
    { id: "1", title: "The Quick Fox" },
    { id: "2", title: "The Lazy Dog" },
    { id: "3", title: "The Brown Bear" },
    { id: "4", title: "The Quick Brown Fox" },
    { id: "5", title: "The Quick Brown Fox Jumps Over The Lazy Dog" },
]);
const searchResults = ref<SearchResult[]>([]);

function submit(query: string) {
    if (!query || query.length < 2) {
        searchLoading.value = false;
        return;
    }
    searchLoading.value = true;
    setTimeout(() => {
        searchResults.value = searchData.value.filter((result) =>
            result.title.toLowerCase().includes(query.toLowerCase()),
        );
        searchLoading.value = false;
    }, 1000);
}
function selected(item: SearchResult) {
    console.log("Selected:", item);
    select.value = item.title;
}
</script>

<template>
    <ComponentSection title="Search">
        <ComponentDemo
            description="A search input component with autocomplete results."
            component="GSearch"
            :props-config="{
                placeholder: {
                    type: 'string',
                    label: 'Placeholder',
                    default: 'Search...'
                },
                label: {
                    type: 'string',
                    label: 'Accessible label',
                    default: 'Search'
                },
                auto: {
                    type: 'boolean',
                    label: 'Automatic search',
                    default: true
                },
                loading: {
                    type: 'boolean',
                    label: 'Show search loading indicator'
                }
            }"
        >
            <template #docs><p>A combobox-style search that shows a list of results as an auto
complete dropdown.</p>
<p>The component doesn&#39;t perform any real searching. It emits events
that can be used to trigger searches, and then the results are
passed back to the component.</p>
<p><strong>Events</strong>:</p>
<ul>
<li><code>submit</code> event is emitted when a search should be performed.</li>
<li><code>select</code> event is submitted when a user makes a selection
in the dropdown.</li>
</ul>
<div class="markdown-alert markdown-alert-note">
<p class="markdown-alert-title"><svg class="octicon octicon-info mr-2" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>Note</p>
<p>The <code>v-model</code> value should <em>not</em> be used to trigger a search,
but it can be used to get the current user input.</p>
</div>
<p><strong>Props</strong>:</p>
<ul>
<li><code>results</code> will be rendered in the dropdown. There are two options:<ul>
<li>Pass an array of objects that extend <code>&lcub; id: string | number; title: string; }</code>.</li>
<li>Pass an array of <code>GSearchGroup&lt;T&gt;</code> objects, where the <code>items</code> property extends the above type.
In this case the results are grouped.</li>
</ul>
</li>
<li><code>auto</code> makes search submit on user input. Defaults to <code>true</code>.
if <code>false</code>, submission happens on Enter or clicking the search button.</li>
<li><code>loading</code> shows a loading indicator. Use if the search may take longer.</li>
</ul>
<p><strong>Slot</strong>: <code>option</code> customizes how an option is rendered.
It receives the current item as <code>option</code>.</p>
<p><strong>Slot</strong>: <code>group</code> customizes the group label for each group.</p>
<p>Here is a minimal implementation:</p>
<figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#800000">&#x3C;script</span><span style="color:#E50000"> setup</span><span style="color:#E50000"> lang</span><span style="color:#000000">=</span><span style="color:#0000FF">"ts"</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#0000FF">interface</span><span style="color:#267F99"> SearchResult</span><span style="color:#000000"> &lcub;</span></span>
<span class="line"><span style="color:#001080">    id</span><span style="color:#000000">: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#001080">    title</span><span style="color:#000000">: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#000000">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#0000FF">const</span><span style="color:#0070C1"> searchData</span><span style="color:#000000"> = </span><span style="color:#795E26">ref</span><span style="color:#000000">&#x3C;</span><span style="color:#267F99">SearchResult</span><span style="color:#000000">[]>([</span></span>
<span class="line"><span style="color:#000000">    &lcub; </span><span style="color:#001080">id:</span><span style="color:#A31515"> "1"</span><span style="color:#000000">, </span><span style="color:#001080">title:</span><span style="color:#A31515"> "The Quick Fox"</span><span style="color:#000000"> },</span></span>
<span class="line"><span style="color:#000000">    &lcub; </span><span style="color:#001080">id:</span><span style="color:#A31515"> "2"</span><span style="color:#000000">, </span><span style="color:#001080">title:</span><span style="color:#A31515"> "The Lazy Dog"</span><span style="color:#000000"> },</span></span>
<span class="line"><span style="color:#000000">    &lcub; </span><span style="color:#001080">id:</span><span style="color:#A31515"> "3"</span><span style="color:#000000">, </span><span style="color:#001080">title:</span><span style="color:#A31515"> "The Brown Bear"</span><span style="color:#000000"> },</span></span>
<span class="line"><span style="color:#000000">]);</span></span>
<span class="line"><span style="color:#0000FF">const</span><span style="color:#0070C1"> searchResults</span><span style="color:#000000"> = </span><span style="color:#795E26">ref</span><span style="color:#000000">&#x3C;</span><span style="color:#267F99">SearchResult</span><span style="color:#000000">[]>([]);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#0000FF">function</span><span style="color:#795E26"> submit</span><span style="color:#000000">(</span><span style="color:#001080">query</span><span style="color:#000000">: </span><span style="color:#267F99">string</span><span style="color:#000000">) &lcub;</span></span>
<span class="line"><span style="color:#001080">    searchResults</span><span style="color:#000000">.</span><span style="color:#001080">value</span><span style="color:#000000"> = </span><span style="color:#001080">searchData</span><span style="color:#000000">.</span><span style="color:#001080">value</span><span style="color:#000000">.</span><span style="color:#795E26">filter</span><span style="color:#000000">((</span><span style="color:#001080">result</span><span style="color:#000000">) </span><span style="color:#0000FF">=></span></span>
<span class="line"><span style="color:#001080">        result</span><span style="color:#000000">.</span><span style="color:#001080">title</span><span style="color:#000000">.</span><span style="color:#795E26">toLowerCase</span><span style="color:#000000">().</span><span style="color:#795E26">includes</span><span style="color:#000000">(</span><span style="color:#001080">query</span><span style="color:#000000">.</span><span style="color:#795E26">toLowerCase</span><span style="color:#000000">()),</span></span>
<span class="line"><span style="color:#000000">    );</span></span>
<span class="line"><span style="color:#000000">}</span></span>
<span class="line"><span style="color:#0000FF">function</span><span style="color:#795E26"> selected</span><span style="color:#000000">(</span><span style="color:#001080">item</span><span style="color:#000000">: </span><span style="color:#267F99">SearchResult</span><span style="color:#000000">) &lcub;</span></span>
<span class="line"><span style="color:#001080">    console</span><span style="color:#000000">.</span><span style="color:#795E26">log</span><span style="color:#000000">(</span><span style="color:#A31515">"Selected:"</span><span style="color:#000000">, </span><span style="color:#001080">item</span><span style="color:#000000">);</span></span>
<span class="line"><span style="color:#000000">}</span></span>
<span class="line"><span style="color:#800000">&#x3C;/script></span></span>
<span class="line"><span style="color:#800000">&#x3C;template></span></span>
<span class="line"><span style="color:#800000">    &#x3C;GSearch</span></span>
<span class="line"><span style="color:#E50000">        :results</span><span style="color:#000000">=</span><span style="color:#0000FF">"searchResults"</span></span>
<span class="line"><span style="color:#E50000">        @submit</span><span style="color:#000000">=</span><span style="color:#0000FF">"submit"</span></span>
<span class="line"><span style="color:#E50000">        @select</span><span style="color:#000000">=</span><span style="color:#0000FF">"selected"</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">    &#x3C;/GSearch></span></span>
<span class="line"><span style="color:#800000">&#x3C;/template></span></span></code></pre>
</figure>

</template>
            <template #default="{ props }">
                <GSearch
                    v-bind="props"
                    v-model="searchQuery"
                    @submit="submit"
                    @select="selected"
                    :results="searchResults"
                    :loading="props.loading || searchLoading"
                />
                <DemoResult label="Search query">{{ searchQuery }}</DemoResult>
                <DemoResult label="Selected result">{{ select }}</DemoResult>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
