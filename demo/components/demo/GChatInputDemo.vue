<script setup lang="ts">
import { ref } from 'vue';
import ComponentDemo from "../ComponentDemo.vue";

const comment = ref<object | "">("");
const sentComments = ref<any[]>([]);

function handleSend(content: object) {
    console.log('Comment sent:', content);
    sentComments.value.unshift({
        id: Date.now(),
        content: JSON.stringify(content, null, 2),
        timestamp: new Date().toLocaleTimeString()
    });
    comment.value = "";
}
</script>

<template>
    <section id="chat-input" class="demo-section">
        <h2 class="demo-section__title">Chat Input</h2>
        <ComponentDemo
            name="Basic Chat Input"
            description="A rich text input component for chat and comments with formatting support."
            component="GChatInput"
            :props-config="{
                placeholder: {
                    type: 'string',
                    label: 'Placeholder text',
                    default: 'Type a comment...'
                },
                label: {
                    type: 'string',
                    label: 'Accessible label',
                    default: 'Comment input'
                },
                disabled: {
                    type: 'boolean',
                    label: 'Disabled',
                    default: false
                }
            }"
        >
            <template #docs>
                <p>The <strong>GChatInput</strong> component provides a rich text editing experience using Tiptap. It supports:</p>
                <ul>
                    <li><strong>Bold</strong> and <em>italic</em> text formatting</li>
                    <li>Bullet and numbered lists</li>
                    <li>Bubble menu for formatting (appears when text is selected)</li>
                    <li>Press <kbd>Enter</kbd> to send, <kbd>Shift+Enter</kbd> for new line</li>
                    <li>Undo/redo support</li>
                </ul>
                <p><strong>Note:</strong> This component is part of the <code>@illinois-grad/grad-vue-rte</code> package, which includes Tiptap dependencies.</p>
            </template>
            <template #default="{ props }">
                <div style="max-width: 600px;">
                    <GChatInput 
                        v-model="comment"
                        v-bind="props"
                        @send="handleSend"
                    />
                    
                    <div v-if="sentComments.length > 0" style="margin-top: 2rem;">
                        <h3 style="font-size: 1rem; margin-bottom: 0.5rem;">Sent Comments:</h3>
                        <div 
                            v-for="sent in sentComments" 
                            :key="sent.id"
                            style="background: #f5f5f5; padding: 0.75rem; margin-bottom: 0.5rem; border-radius: 4px; font-size: 0.875rem;"
                        >
                            <div style="color: #666; margin-bottom: 0.25rem;">{{ sent.timestamp }}</div>
                            <pre style="margin: 0; white-space: pre-wrap; font-size: 0.75rem;">{{ sent.content }}</pre>
                        </div>
                    </div>
                </div>
            </template>
        </ComponentDemo>
    </section>
</template>
