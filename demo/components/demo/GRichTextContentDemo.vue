<script setup lang="ts">
import { ref } from 'vue';
import ComponentDemo from "../ComponentDemo.vue";

const exampleJson = ref(JSON.stringify({
    type: "doc",
    content: [
        { type: "paragraph", content: [{ type: "text", text: "This is a rendered paragraph." }] }
    ],
}));
</script>

<template>
    <section id="rich-text-content" class="demo-section">
        <h2 class="demo-section__title">Rich Text Content</h2>
        <ComponentDemo
            description="Renders a JSON string of tiptap content as HTML. Supports all formatting produced by GChatInput and GNoteInput."
            component="GRichTextContent"
            :props-config="{
                error: {
                    type: 'string',
                    label: 'Error message when rendering fails',
                    default: null
                }
            }"
        >
            <template #docs><p>Renders a JSON string of tiptap content as HTML.
Supports all formatting produced by GChatInput and GNoteInput:
bold, italic, ordered lists, and bullet lists.</p>
<ul>
<li>Empty content is handled gracefully (renders nothing).</li>
<li>Displays an error message when the content cannot be parsed or rendered.</li>
</ul>
<p>The rendering only happens in the client when used with Nuxt.js.</p>
<p><strong>Security note</strong>: rendered HTML is produced by tiptap&#39;s <code>generateHTML</code>, which only
serializes recognized document nodes - it does not inject raw HTML from the JSON.</p>
<p><strong>Note</strong>: This component is part of the <code>@illinois-grad/grad-vue-rte</code> package, which includes Tiptap dependencies.</p>
</template>
            <template #default>
                <div class="demo-container">
                    <div class="demo-input">
                        <label for="json-input">Tiptap JSON string:</label>
                        <textarea
                            id="json-input"
                            v-model="exampleJson"
                            rows="10"
                            class="demo-textarea"
                        />
                    </div>
                    <div class="demo-output">
                        <p class="demo-output__label">Rendered output:</p>
                        <div class="demo-output__content">
                            <GRichTextContent :content="exampleJson" />
                        </div>
                    </div>
                </div>
            </template>
        </ComponentDemo>
    </section>
</template>

<style scoped>
.demo-container {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
}

.demo-input {
    flex: 1;
    min-width: 280px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
        font-weight: 600;
        font-size: 0.875rem;
    }
}

.demo-textarea {
    font-family: monospace;
    font-size: 0.75rem;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
}

.demo-output {
    flex: 1;
    min-width: 280px;
}

.demo-output__label {
    font-weight: 600;
    font-size: 0.875rem;
    margin: 0 0 0.5rem;
}

.demo-output__content {
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    min-height: 4rem;
    background: #fff;
}
</style>
