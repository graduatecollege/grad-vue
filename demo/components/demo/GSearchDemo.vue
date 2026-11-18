<script setup lang="ts">
import { computed, ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import {
    GSearch,
    type GSearchAction,
    type GSearchGroup,
    type GSearchSubmitDetails,
} from "@illinois-grad/grad-vue";

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

function submit(query: string | null) {
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

interface StudentResult {
    id: string;
    title: string;
    term: string;
}

const allStudents: StudentResult[] = [
    { id: "s1", title: "Alex Rivera", term: "Fall 2026" },
    { id: "s2", title: "Alex Chen (Spring 2025)", term: "Spring 2025" },
    { id: "s3", title: "Jordan Taylor (Fall 2024)", term: "Fall 2024" },
    { id: "s4", title: "Samira Patel", term: "Fall 2026" },
];

const studentQuery = ref("");
const selectedStudent = ref("");
const allTermsMode = ref(false);
const studentResults = ref<GSearchGroup<StudentResult>[]>([]);

const studentActions = computed<GSearchAction[]>(() =>
    allTermsMode.value
        ? []
        : [{ id: "all-terms", label: "Search all terms" }],
);

function runStudentSearch(query: string, includeAllTerms: boolean) {
    const normalized = query.trim().toLowerCase();
    if (normalized.length < 2) {
        studentResults.value = [];
        return;
    }
    const matches = allStudents.filter(
        (s) =>
            (includeAllTerms || s.term === "Fall 2026") &&
            s.title.toLowerCase().includes(normalized),
    );
    studentResults.value = [
        {
            type: "students",
            label: includeAllTerms
                ? "Students – All Terms"
                : "Students – Fall 2026",
            items: matches,
        },
    ];
}

function submitStudents(query: string | null) {
    runStudentSearch(query ?? "", allTermsMode.value);
}

function handleStudentAction(action: GSearchAction) {
    if (action.id === "all-terms") {
        allTermsMode.value = true;
        runStudentSearch(studentQuery.value, true);
    }
}

function handleStudentClose() {
    if (allTermsMode.value) {
        allTermsMode.value = false;
        runStudentSearch(studentQuery.value, false);
    }
}

function selectStudent(student: StudentResult) {
    selectedStudent.value = student.title;
}

interface Department {
    id: string;
    title: string;
}

const departments: Department[] = [
    { id: "1434", title: "Computer Science (1434)" },
    { id: "1475", title: "Chemistry (1475)" },
    { id: "1588", title: "Physics (1588)" },
    { id: "1612", title: "Mathematics (1612)" },
];

const departmentQuery = ref("");
const departmentResults = ref<Department[]>([]);
const openedDepartment = ref("");

function submitDepartments(query: string | null, details: GSearchSubmitDetails) {
    const q = (query ?? "").trim().toLowerCase();
    if (details.trigger !== "auto") {
        const exact = departments.find((d) => d.id === q);
        if (exact) {
            openedDepartment.value = exact.title;
        }
    }
    departmentResults.value =
        q.length < 2
            ? []
            : departments.filter((d) => d.title.toLowerCase().includes(q));
}
</script>

<template>
    <ComponentSection title="Search">
        <ComponentDemo
            description="A search input component with autocomplete results."
            component="GSearch"
            :props-config="{
                actionsLabel: {
                    type: 'string',
                    label: 'Group label for actions',
                    default: 'Actions'
                },
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
                    label: 'Show search loading indicator',
                    default: null
                }
            }"
        >
            <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#001080">    results</span><span style="color:#000000">: </span><span style="color:#267F99">GSearchGroup</span><span style="color:#000000">&#x3C;</span><span style="color:#267F99">T</span><span style="color:#000000">>[] | </span><span style="color:#267F99">T</span><span style="color:#000000">[];</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Actions shown in their own group after search results</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    actions</span><span style="color:#000000">?: </span><span style="color:#267F99">GSearchAction</span><span style="color:#000000">[];</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Group label for actions</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    actionsLabel</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Default icon classes for a decorative leading icon on actions, or `false` to hide it. Overridden per action by `action.icon` or by the `action-icon` slot.</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    actionIcon</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000"> | </span><span style="color:#267F99">false</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Placeholder</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    placeholder</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Accessible label</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    label</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Automatic search</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    auto</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Show search loading indicator</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    loading</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#000000">};</span></span></code></pre>
</figure>

</template>
            <template #docs><p>A combobox-style search that shows a list of results as an auto
complete dropdown.</p>
<p>The component doesn&#39;t perform any real searching. It emits events
that can be used to trigger searches, and then the results are
passed back to the component.</p>
<p><strong>Events</strong>:</p>
<ul>
<li><code>submit</code> event is emitted with <code>string | null</code> when a search should be performed.
The second argument is a <code>GSearchSubmitDetails</code> object whose <code>trigger</code> is
<code>&quot;auto&quot;</code> for the debounced submit while typing, or <code>&quot;enter&quot;</code> / <code>&quot;button&quot;</code> when
the user explicitly submits. Use an explicit submit to jump straight to an
item when the query is an exact identifier (e.g., an ID number).</li>
<li><code>select</code> event is emitted when a user selects a result in the dropdown.</li>
<li><code>action</code> event is emitted with the chosen <code>GSearchAction</code> when a user
activates an action in the dropdown, leaving the query and dropdown open.</li>
<li><code>close</code> event is emitted when the results dropdown closes.</li>
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
<li><code>actions</code> renders additional <code>GSearchAction</code> items
(<code>&lcub; id: string | number; label: string; icon?: string | false }</code>) in their own shaded
group after the results with a decorative leading icon. They are reachable with the
arrow keys, excluded from the result count, and announced to screen readers via a
polite status region.</li>
<li><code>actionsLabel</code> customizes the label of the actions group (defaults to <code>&quot;Actions&quot;</code>).</li>
<li><code>actionIcon</code> sets default icon classes (e.g., <code>&quot;fa-solid fa-arrow-right&quot;</code>) for the
decorative leading icon on actions, or <code>false</code> to hide it. Overridden per action by
<code>action.icon</code> or by the <code>action-icon</code> slot.</li>
<li><code>auto</code> makes search submit on user input. Defaults to <code>true</code>.
if <code>false</code>, submission happens on Enter or clicking the search button.</li>
<li><code>loading</code> shows a loading indicator. Use if the search may take longer.</li>
</ul>
<p><strong>Slot</strong>: <code>option</code> customizes how a result option is rendered.
It receives the current item as <code>option</code>.</p>
<p><strong>Slot</strong>: <code>action</code> customizes how an action option is rendered.
It receives the current action as <code>action</code>.</p>
<p><strong>Slot</strong>: <code>action-icon</code> customizes the decorative leading icon for an action.
It receives the current action as <code>action</code>.</p>
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
<span class="line"><span style="color:#0000FF">function</span><span style="color:#795E26"> submit</span><span style="color:#000000">(</span><span style="color:#001080">query</span><span style="color:#000000">: </span><span style="color:#267F99">string</span><span style="color:#000000"> | </span><span style="color:#267F99">null</span><span style="color:#000000">) &lcub;</span></span>
<span class="line"><span style="color:#0000FF">    const</span><span style="color:#0070C1"> q</span><span style="color:#000000"> = (</span><span style="color:#001080">query</span><span style="color:#000000"> ?? </span><span style="color:#A31515">""</span><span style="color:#000000">).</span><span style="color:#795E26">toLowerCase</span><span style="color:#000000">();</span></span>
<span class="line"><span style="color:#001080">    searchResults</span><span style="color:#000000">.</span><span style="color:#001080">value</span><span style="color:#000000"> = </span><span style="color:#001080">searchData</span><span style="color:#000000">.</span><span style="color:#001080">value</span><span style="color:#000000">.</span><span style="color:#795E26">filter</span><span style="color:#000000">((</span><span style="color:#001080">result</span><span style="color:#000000">) </span><span style="color:#0000FF">=></span></span>
<span class="line"><span style="color:#001080">        result</span><span style="color:#000000">.</span><span style="color:#001080">title</span><span style="color:#000000">.</span><span style="color:#795E26">toLowerCase</span><span style="color:#000000">().</span><span style="color:#795E26">includes</span><span style="color:#000000">(</span><span style="color:#001080">q</span><span style="color:#000000">),</span></span>
<span class="line"><span style="color:#000000">    );</span></span>
<span class="line"><span style="color:#000000">}</span></span>
<span class="line"><span style="color:#0000FF">function</span><span style="color:#795E26"> selected</span><span style="color:#000000">(</span><span style="color:#001080">item</span><span style="color:#000000">: </span><span style="color:#267F99">SearchResult</span><span style="color:#000000">) &lcub;</span></span>
<span class="line"><span style="color:#001080">    console</span><span style="color:#000000">.</span><span style="color:#795E26">log</span><span style="color:#000000">(</span><span style="color:#A31515">"Selected:"</span><span style="color:#000000">, </span><span style="color:#001080">item</span><span style="color:#000000">);</span></span>
<span class="line"><span style="color:#000000">}</span></span>
<span class="line"><span style="color:#800000">&#x3C;/script></span></span>
<span class="line"><span style="color:#800000">&#x3C;template></span></span>
<span class="line"><span style="color:#800000">    &#x3C;GSearch</span></span>
<span class="line"><span style="color:#000000">        :</span><span style="color:#E50000">results</span><span style="color:#000000">=</span><span style="color:#000000">"</span><span style="color:#001080">searchResults</span><span style="color:#000000">"</span></span>
<span class="line"><span style="color:#000000">        @</span><span style="color:#E50000">submit</span><span style="color:#000000">=</span><span style="color:#000000">"</span><span style="color:#001080">submit</span><span style="color:#000000">"</span></span>
<span class="line"><span style="color:#000000">        @</span><span style="color:#E50000">select</span><span style="color:#000000">=</span><span style="color:#000000">"</span><span style="color:#001080">selected</span><span style="color:#000000">"</span><span style="color:#800000">></span></span>
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

        <ComponentDemo
            description="Grouped search with actions (try searching 'Alex' or 'Jordan' and choosing 'Search all terms')."
            component="GSearch"
            :props-config="{}"
        >
            <template #default>
                <GSearch
                    v-model="studentQuery"
                    label="Search students"
                    placeholder="Search students..."
                    :results="studentResults"
                    :actions="studentActions"
                    @submit="submitStudents"
                    @action="handleStudentAction"
                    @close="handleStudentClose"
                    @select="selectStudent"
                />
                <DemoResult label="Selected student">{{
                    selectedStudent
                }}</DemoResult>
            </template>
        </ComponentDemo>

        <ComponentDemo
            description="Jump to an exact ID on Enter: the submit event's trigger tells typing apart from an explicit submit (try typing 1588 and pressing Enter)."
            component="GSearch"
            :props-config="{}"
        >
            <template #default>
                <GSearch
                    v-model="departmentQuery"
                    label="Search departments"
                    placeholder="Department name or ID..."
                    :results="departmentResults"
                    @submit="submitDepartments"
                    @select="(d: Department) => (openedDepartment = d.title)"
                />
                <DemoResult label="Opened department">{{
                    openedDepartment
                }}</DemoResult>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
