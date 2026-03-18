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
            description="A rich text input component for chat and comments with formatting support."
            component="GChatInput"
            :props-config="{
                placeholder: {
                    type: 'string',
                    label: 'Placeholder text',
                    default: 'Type a comment'
                },
                disabled: {
                    type: 'boolean',
                    label: 'Disabled',
                    default: false
                },
                maxRows: {
                    type: 'number',
                    label: 'Maximum number of rows',
                    default: 5
                },
                label: {
                    type: 'string',
                    label: 'Accessible label',
                    default: 'Comment input'
                }
            }"
        >
            <template #props><figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#0000FF">type</span><span style="color:#267F99"> Props</span><span style="color:#000000"> = &lcub;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Placeholder text</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    placeholder</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Disabled</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    disabled</span><span style="color:#000000">?: </span><span style="color:#267F99">boolean</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Maximum number of rows</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    maxRows</span><span style="color:#000000">?: </span><span style="color:#267F99">number</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#008000">    /**</span></span>
<span class="line"><span style="color:#008000">     * Accessible label</span></span>
<span class="line"><span style="color:#008000">     */</span></span>
<span class="line"><span style="color:#001080">    label</span><span style="color:#000000">?: </span><span style="color:#267F99">string</span><span style="color:#000000">;</span></span>
<span class="line"><span style="color:#000000">}</span></span></code></pre>
</figure>

</template>
            <template #docs><p>The GChatInput component provides a rich text editing experience using Tiptap. It supports:</p>
<ul>
<li><strong>Bold</strong> and <em>italic</em> text formatting</li>
<li>Bullet and numbered lists</li>
<li>Bubble menu for formatting (appears when text is selected)</li>
<li>Press <kbd>Enter</kbd> to send, <kbd>Shift+Enter</kbd> for new line</li>
<li>Undo/redo support</li>
</ul>
<p> <strong>Note</strong>: This component is part of the <code>@illinois-grad/grad-vue-rte</code> package, which includes Tiptap dependencies.</p>
</template>
            <template #default="{ props }">
                <div class="demo-container">
                    <GChatInput 
                        v-model="comment"
                        v-bind="props"
                        @send="handleSend"
                    />
                    
                    <div v-if="sentComments.length > 0" class="sent-comments">
                        <h3 class="sent-comments__title">Sent Comments:</h3>
                        <div 
                            v-for="sent in sentComments" 
                            :key="sent.id"
                            class="sent-comment"
                        >
                            <div class="sent-comment__timestamp">{{ sent.timestamp }}</div>
                            <pre class="sent-comment__content">{{ sent.content }}</pre>
                        </div>
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

.sent-comments {
    margin-top: 2rem;
}

.sent-comments__title {
    font-size: 1rem;
    margin-bottom: 0.5rem;
}

.sent-comment {
    background: #f5f5f5;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
}

.sent-comment__timestamp {
    color: #666;
    margin-bottom: 0.25rem;
}

.sent-comment__content {
    margin: 0;
    white-space: pre-wrap;
    font-size: 0.75rem;
}
</style>
