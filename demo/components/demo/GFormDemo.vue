<script setup lang="ts">
import { ref, computed } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GForm, GTextInput, GEmailInput, GSubmitButton } from "@illinois-grad/grad-vue";

const formData = ref<Record<string, any>>({});
const submitResult = ref<string>("");

// Example: reactive errors for validation
const emailErrors = computed(() => {
    const errors: string[] = [];
    const email = formData.value.email;
    if (email && !email.includes('@')) {
        errors.push('Email must contain @');
    }
    if (email && email.length < 5) {
        errors.push('Email is too short');
    }
    return errors;
});

function handleSubmit(values: Record<string, any>) {
    submitResult.value = `Form submitted with: ${JSON.stringify(values, null, 2)}`;
}

const fname = ref("heh");
</script>

<template>
    <ComponentSection title="Form">
        <ComponentDemo
            description="A form wrapper component that automatically manages form state using reactive patterns."
            component="GForm"
            :props-config="{
                action: {
                    type: 'string',
                    label: 'Action URL (optional, for native form submission)',
                    default: null
                },
                method: {
                    type: 'string',
                    label: 'HTTP method (optional, for native form submission)',
                    default: 'post'
                }
            }"
        >
            <template #docs><p>A form wrapper component that automatically manages form state and
connects to child input components.</p>
<p>Child input components that have a <code>name</code> prop will automatically
register with the form, and their values will be tracked in the form model.</p>
<h3>Features</h3>
<ul>
<li>Automatic value tracking for child input components with the <code>name</code> prop</li>
<li>Reactive error handling by providing a computed list of errors</li>
<li>Optionally manage your own form state in a parent component by providing a
<code>form</code> injection</li>
</ul>
<h3>Basic example</h3>
<figure class="highlighted-code">
<pre class="shiki light-plus" style="background-color:#FFFFFF;color:#000000" tabindex="0"><code><span class="line"><span style="color:#800000">&#x3C;</span><span style="color:#267F99">GForm</span><span style="color:#E50000"> v-model</span><span style="color:#000000">=</span><span style="color:#000000">"</span><span style="color:#001080">formData</span><span style="color:#000000">"</span><span style="color:#000000"> @</span><span style="color:#E50000">submit</span><span style="color:#000000">=</span><span style="color:#000000">"</span><span style="color:#001080">handleSubmit</span><span style="color:#000000">"</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">  &#x3C;template</span><span style="color:#000000"> #</span><span style="color:#E50000">default</span><span style="color:#000000">=</span><span style="color:#000000">"</span><span style="color:#000000">&lcub; </span><span style="color:#001080">isSubmitting</span><span style="color:#000000">, </span><span style="color:#001080">hasErrors</span><span style="color:#000000"> }</span><span style="color:#000000">"</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">    &#x3C;</span><span style="color:#267F99">GTextInput</span><span style="color:#E50000"> name</span><span style="color:#000000">=</span><span style="color:#0000FF">"firstName"</span><span style="color:#E50000"> label</span><span style="color:#000000">=</span><span style="color:#0000FF">"First Name"</span><span style="color:#000000"> :</span><span style="color:#E50000">errors</span><span style="color:#000000">=</span><span style="color:#000000">"</span><span style="color:#001080">firstNameErrors</span><span style="color:#000000">"</span><span style="color:#000000"> /</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">    &#x3C;</span><span style="color:#267F99">GSubmitButton</span><span style="color:#000000"> :</span><span style="color:#E50000">disabled</span><span style="color:#000000">=</span><span style="color:#000000">"</span><span style="color:#001080">hasErrors</span><span style="color:#000000">"</span><span style="color:#800000">></span><span style="color:#000000">Submit</span><span style="color:#800000">&#x3C;/</span><span style="color:#267F99">GSubmitButton</span><span style="color:#800000">></span></span>
<span class="line"><span style="color:#800000">  &#x3C;/template></span></span>
<span class="line"><span style="color:#800000">&#x3C;/</span><span style="color:#267F99">GForm</span><span style="color:#800000">></span></span></code></pre>
</figure>

</template>
            <template #default="{ props }">
                <GForm
                    v-model="formData"
                    v-bind="props"
                    @submit="handleSubmit"
                >
                    <template #default="{ isSubmitting, hasErrors, errors }">
                        <GTextInput
                            name="firstName"
                            label="First Name"
                            placeholder="Enter your first name"
                            v-model="fname"
                        />
                        <GTextInput
                            name="lastName"
                            label="Last Name"
                            placeholder="Enter your last name"
                        />
                        <GEmailInput
                            name="email"
                            label="Email"
                            placeholder="your@email.com"
                            :errors="emailErrors"
                        />
                        <div v-if="hasErrors" style="color: var(--g-danger-600); padding: 0.5em;">
                            Form has errors. Please fix them before submitting.
                        </div>
                        <GSubmitButton :disabled="hasErrors">
                            {{ isSubmitting ? 'Submitting...' : 'Submit Form' }}
                        </GSubmitButton>
                    </template>
                </GForm>
                <DemoResult v-if="submitResult">{{ submitResult }}</DemoResult>
                <DemoResult>Form Data: {{ JSON.stringify(formData, null, 2) }}</DemoResult>
                <DemoResult v-if="emailErrors.length > 0">Email Errors: {{ emailErrors }}</DemoResult>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
