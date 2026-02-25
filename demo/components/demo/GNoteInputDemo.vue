<script setup lang="ts">
import { ref } from 'vue';
import ComponentDemo from "../ComponentDemo.vue";

const note = ref<object | "">("");
</script>

<template>
    <section id="note-input" class="demo-section">
        <h2 class="demo-section__title">Note Input</h2>
        <ComponentDemo
            description="A rich text input component for writing notes and descriptions with an always-visible toolbar."
            component="GNoteInput"
            :props-config="{
                placeholder: {
                    type: 'string',
                    label: 'Placeholder text',
                    default: 'Write a note...'
                },
                label: {
                    type: 'string',
                    label: 'Accessible label',
                    default: 'Note input'
                }
            }"
        >
            <template #docs><p>The GNoteInput component provides a rich text editing experience using Tiptap for writing notes. It supports:</p>
<ul>
<li><strong>Bold</strong> and <em>italic</em> text formatting</li>
<li>Bullet and numbered lists</li>
<li>Always visible toolbar for formatting</li>
<li>Undo/redo support</li>
</ul>
<p> <strong>Note</strong>: This component is part of the <code>@illinois-grad/grad-vue-rte</code> package, which includes Tiptap dependencies.</p>
</template>
            <template #default="{ props }">
                <div class="demo-container">
                    <GNoteInput 
                        v-model="note"
                        v-bind="props"
                    />
                    
                    <div v-if="note && Object.keys(note).length > 0" class="note-preview">
                        <h3 class="note-preview__title">Current Note Content:</h3>
                        <pre class="note-preview__content">{{ JSON.stringify(note, null, 2) }}</pre>
                    </div>
                </div>
            </template>
        </ComponentDemo>
    </section>
</template>

<style scoped>
.demo-container {
    max-width: 600px;
}

.note-preview {
    margin-top: 2rem;
}

.note-preview__title {
    font-size: 1rem;
    margin-bottom: 0.5rem;
}

.note-preview__content {
    background: #f5f5f5;
    padding: 0.75rem;
    border-radius: 4px;
    font-size: 0.75rem;
    margin: 0;
    white-space: pre-wrap;
}
</style>
