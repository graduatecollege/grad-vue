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
            An input for CFOP or CFOAP accounting strings. The input accepts
            values with or without dashes and displays them formatted with gray
            dashes.
        </p>

        <div class="demo-group">
            <h3>CFOP Format (1-6-6-6 = 19 characters)</h3>
            <p>Chart-Fund-Org-Program</p>
            <GAccountingStringInput
                v-model="cfopValue"
                label="CFOP Accounting String"
                placeholder="Enter CFOP"
                format="cfop"
                instructions="Enter 19 alphanumeric characters (e.g., 1-234567-890123-456789)"
            />
            <div v-if="cfopValue" class="demo-output">
                <strong>Model value (without dashes):</strong> {{ cfopValue }}
            </div>
        </div>

        <div class="demo-group">
            <h3>CFOAP Format (1-6-6-6-6 = 25 characters)</h3>
            <p>Chart-Fund-Org-Account-Program</p>
            <GAccountingStringInput
                v-model="cfoapValue"
                label="CFOAP Accounting String"
                placeholder="Enter CFOAP"
                format="cfoap"
                instructions="Enter 25 alphanumeric characters (e.g., 1-234567-890123-456789-012345)"
            />
            <div v-if="cfoapValue" class="demo-output">
                <strong>Model value (without dashes):</strong> {{ cfoapValue }}
            </div>
        </div>

        <div class="demo-group">
            <h3>Auto-detect Format</h3>
            <p>Automatically detects CFOP or CFOAP based on length</p>
            <GAccountingStringInput
                v-model="autoValue"
                label="Accounting String"
                placeholder="Enter CFOP or CFOAP"
                instructions="Type or paste with or without dashes. Format is auto-detected."
            />
            <div v-if="autoValue" class="demo-output">
                <strong>Model value (without dashes):</strong> {{ autoValue }}
                <br />
                <strong>Detected format:</strong>
                {{ autoValue.length <= 19 ? "CFOP" : "CFOAP" }}
            </div>
        </div>

        <div class="demo-group">
            <h3>With Error</h3>
            <GAccountingStringInput
                v-model="withError"
                label="Accounting String"
                error="This value is too short to be a valid accounting string"
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
            <h3>Paste Examples</h3>
            <p>Try pasting these values:</p>
            <ul>
                <li>
                    <code>1234567890123456789</code> - CFOP without dashes
                </li>
                <li>
                    <code>1-234567-890123-456789</code> - CFOP with dashes
                </li>
                <li>
                    <code>1234567890123456789012345</code> - CFOAP without
                    dashes
                </li>
                <li>
                    <code>1-234567-890123-456789-012345</code> - CFOAP with
                    dashes
                </li>
                <li><code>1A2B3C7890123456789</code> - Alphanumeric CFOP</li>
            </ul>
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
