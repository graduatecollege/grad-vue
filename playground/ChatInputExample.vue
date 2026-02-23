<script setup lang="ts">
import { ref } from 'vue';
import GChatInput from '../packages/grad-vue-rte/src/components/GChatInput.vue';
import '../packages/grad-vue-rte/src/css/main.css';

const comment = ref<object | "">("");

function handleSend(content: object) {
    console.log('Comment sent:', content);
    alert(`Comment sent! Check console for details.`);
    comment.value = "";
}
</script>

<template>
    <div class="chat-input-example">
        <h1>GChatInput Component Demo</h1>
        <p>This demonstrates the GChatInput component from the @illinois-grad/grad-vue-rte package.</p>
        
        <div class="demo-section">
            <h2>Basic Usage</h2>
            <GChatInput 
                v-model="comment"
                placeholder="Type a comment..."
                @send="handleSend"
            />
        </div>

        <div class="demo-section">
            <h2>Features</h2>
            <ul>
                <li>Rich text editing with <strong>bold</strong> and <em>italic</em> formatting</li>
                <li>Bullet and numbered lists</li>
                <li>Press Enter to send (or Shift+Enter for new line)</li>
                <li>Select text to see formatting options in bubble menu</li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.chat-input-example {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
}

h1 {
    color: #333;
    margin-bottom: 0.5rem;
}

h2 {
    color: #666;
    margin-top: 2rem;
    margin-bottom: 1rem;
}

.demo-section {
    margin: 2rem 0;
}

ul {
    line-height: 1.6;
}
</style>
