<script setup lang="ts">
import { computed, h, onMounted, provide, ref, useTemplateRef } from "vue";

import DemoResult from "../demo/components/DemoResult.vue";

const formData = ref<Record<string, any>>({});
const submitResult = ref<string>("");

const textErrors = computed(() => {
    const errors: string[] = [];
    const text = formData.value.firstName;
    if (text && text.length < 5) {
        errors.push('Text is too short');
    }
    return errors;
})

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
    <div class="playground">
        <GAppHeader title="grad-vue playground" illinois>
        </GAppHeader>

        <div
            class="wrap"
        >
            <main class="main" ref="main">
                <section id="note-input">
                    <GForm
                        v-model="formData"
                        @submit="handleSubmit"
                    >
                        <template
                            #default="{ isSubmitting, hasErrors, errors }"
                        >
                            <GTextInput
                                name="firstName"
                                label="First Name"
                                placeholder="Enter your first name"
                                v-model="fname"
                                :errors="textErrors"
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
                            <div
                                v-if="hasErrors"
                                style="
                                    color: var(--g-danger-600);
                                    padding: 0.5em;
                                "
                            >
                                Form has errors. Please fix them before
                                submitting.
                            </div>
                            <GSubmitButton :disabled="hasErrors">
                                {{
                                    isSubmitting
                                        ? "Submitting..."
                                        : "Submit Form"
                                }}
                            </GSubmitButton>
                        </template>
                    </GForm>
                    <DemoResult v-if="submitResult">{{
                        submitResult
                    }}</DemoResult>
                    <DemoResult
                        >Form Data:
                        {{ JSON.stringify(formData, null, 2) }}</DemoResult
                    >
                    <DemoResult v-if="emailErrors.length > 0"
                        >Email Errors: {{ emailErrors }}</DemoResult
                    >
                </section>
            </main>
        </div>
    </div>
    <GOverlay />
</template>

<style scoped>
.wrap {
    margin-top: var(--g-toolbar-height);
}
.wrap:not(.sidebar-collapsible) {
    padding-left: 300px;
}

.main {
    padding: 2rem;
}

section {
    margin: 1.5rem 0 2rem;
}
h2 {
    margin: 0 0 0.75rem;
    font-size: 1.1rem;
}
section > *:not(h2) {
    margin-right: 0.5rem;
}

.history-scroller {
    display: block;
    height: 200px;
    width: 500px;
}

.history-entry {
    font-size: 1.125rem;
    line-height: 1.5rem;
}
</style>
