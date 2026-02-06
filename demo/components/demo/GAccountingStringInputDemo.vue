<script lang="ts" setup>
import { ref } from "vue";
import GAccountingStringInput from "../../src/components/GAccountingStringInput.vue";

const cfopValue = ref("");
const cfoapValue = ref("");
const autoValue = ref("");
const withError = ref("123");
const disabled = ref("1234567890123456789");
</script>

<template>
    <div class="demo-section">
        <h2>Accounting String Input (CFOP/CFOAP)</h2>
        <p>
            An input for CFOP or CFOAP accounting strings. Enter values with or without dashes.
            The component shows helpful status messages and accepts undo/redo.
        </p>

        <div class="demo-group">
            <h3>CFOP Format (1-6-6-6 = 19 characters)</h3>
            <p>Chart-Fund-Org-Program</p>
            <GAccountingStringInput
                v-model="cfopValue"
                label="CFOP Accounting String"
                placeholder="Enter CFOP with or without dashes"
                format="cfop"
                instructions="Enter 19 alphanumeric characters. You can include dashes for readability."
            />
            <div v-if="cfopValue" class="demo-output">
                <strong>Model value (dashes stripped):</strong> {{ cfopValue }}
            </div>
        </div>

        <div class="demo-group">
            <h3>CFOAP Format (1-6-6-6-6 = 25 characters)</h3>
            <p>Chart-Fund-Org-Account-Program</p>
            <GAccountingStringInput
                v-model="cfoapValue"
                label="CFOAP Accounting String"
                placeholder="Enter CFOAP with or without dashes"
                format="cfoap"
                instructions="Enter 25 alphanumeric characters. You can include dashes for readability."
            />
            <div v-if="cfoapValue" class="demo-output">
                <strong>Model value (dashes stripped):</strong> {{ cfoapValue }}
            </div>
        </div>

        <div class="demo-group">
            <h3>Auto-detect Format</h3>
            <p>Automatically detects CFOP or CFOAP based on length and shows status messages</p>
            <GAccountingStringInput
                v-model="autoValue"
                label="Accounting String"
                placeholder="Enter CFOP or CFOAP"
                instructions="Type or paste with or without dashes. Status messages show progress."
            />
            <div v-if="autoValue" class="demo-output">
                <strong>Model value (dashes stripped):</strong> {{ autoValue }}
                <br />
                <strong>Length:</strong> {{ autoValue.length }} characters
            </div>
        </div>

        <div class="demo-group">
            <h3>With Server Error</h3>
            <p>Error messages appear below the input for server-side validation</p>
            <GAccountingStringInput
                v-model="withError"
                label="Accounting String"
                error="This accounting string does not exist in the system"
            />
        </div>

        <div class="demo-group">
            <h3>Disabled</h3>
            <GAccountingStringInput
                v-model="disabled"
                label="Accounting String"
                disabled
            />
        </div>

        <div class="demo-group">
            <h3>Try It Out</h3>
            <p>Test these features:</p>
            <ul>
                <li><strong>Undo/Redo:</strong> Type some text, then press Ctrl+Z (Cmd+Z) to undo</li>
                <li><strong>Paste with dashes:</strong> <code>1-234567-890123-456789</code></li>
                <li><strong>Paste without dashes:</strong> <code>1234567890123456789</code></li>
                <li><strong>CFOAP format:</strong> <code>1234567890123456789012345</code></li>
                <li><strong>Alphanumeric:</strong> <code>1A2B3C7890123456789</code></li>
            </ul>
            <p class="demo-note">
                <strong>Note:</strong> Status messages indicate "Complete CFOP" or "Complete CFOAP" 
                when the right number of characters are entered, but server-side validation is still 
                required to confirm the accounting string exists.
            </p>
        </div>
    </div>
</template>

<style scoped>
.demo-section {
    max-width: 800px;
    margin: 2rem auto;
    padding: 1rem;
}

.demo-group {
    margin: 2rem 0;
    padding: 1.5rem;
    border: 1px solid var(--g-surface-300);
    border-radius: 8px;
    background: var(--g-surface-50);
}

.demo-output {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--g-surface-100);
    border-radius: 4px;
    font-family: monospace;
}

.demo-note {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--g-primary-50);
    border-left: 3px solid var(--g-primary-500);
    border-radius: 4px;
    font-size: 0.9em;
}

h2 {
    margin-bottom: 1rem;
    color: var(--g-surface-950);
}

h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    color: var(--g-surface-900);
}

p {
    margin-bottom: 1rem;
    color: var(--g-surface-800);
}

ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
}

li {
    margin: 0.5rem 0;
}

code {
    background: var(--g-surface-200);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
}
</style>
