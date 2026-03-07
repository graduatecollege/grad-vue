<script setup lang="ts">
import { ref } from 'vue';
import ComponentDemo from "../ComponentDemo.vue";

const exampleJson = ref(JSON.stringify({
    type: "doc",
    content: [
        { type: "paragraph", content: [{ type: "text", text: "This is a rendered paragraph." }] },
        { type: "paragraph", content: [
            { type: "text", text: "Bold", marks: [{ type: "bold" }] },
            { type: "text", text: " and " },
            { type: "text", text: "italic", marks: [{ type: "italic" }] },
            { type: "text", text: " text." }
        ]},
        { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "First item" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Second item" }] }] },
        ]},
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
                content: {
                    type: 'string',
                    label: 'Content (tiptap JSON string)',
                    default: ''
                }
            }"
        >
            <template #docs>
                <p>The <code>GRichTextContent</code> component renders a JSON-encoded tiptap document string as HTML. It supports all extensions used by <code>GChatInput</code> and <code>GNoteInput</code>:</p>
                <ul>
                    <li><strong>Bold</strong> and <em>italic</em> text</li>
                    <li>Ordered and bullet lists</li>
                </ul>
                <p>Empty strings are handled gracefully (nothing is rendered). Invalid JSON or render failures display an error message.</p>
                <p><strong>Note</strong>: This component is part of the <code>@illinois-grad/grad-vue-rte</code> package.</p>
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
