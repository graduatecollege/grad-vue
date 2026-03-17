<script setup lang="ts">
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GProgress } from "@illinois-grad/grad-vue";
</script>

<template>
    <ComponentSection title="Progress">
        <ComponentDemo
            description="A progress indicator component."
            component="GProgress"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Accessible label',
                    default: 'Loading'
                },
                value: {
                    type: 'number',
                    label: 'Progress 1-100 or blank',
                    default: null
                },
                size: {
                    type: 'select',
                    label: 'Progress circle size',
                    default: 'medium',
                    options: [
                        'tiny',
                        'small',
                        'medium',
                        'large'
                    ]
                }
            }"
        >
            <template #docs><p>A component that can show progress from 1 to 100 or an indeterminate spinner.
If a value is omitted, the progress will be indeterminate.</p>
<p>If no <code>label</code> is specified, the default accessible label will be &quot;Loading&quot;.</p>
<p>If a value is provided, the element will have the ARIA role <code>progressbar</code>
with the appropriate ARIA value attributes.</p>
<p>If no value is provided, the element will have the ARIA role <code>status</code>.</p>
<div class="markdown-alert markdown-alert-note">
<p class="markdown-alert-title"><svg class="octicon octicon-info mr-2" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>Note</p>
<p>This element announces to assistive technologies, so make sure to
limit its use to cases where that&#39;s appropriate.</p>
</div>
</template>
            <template #default="{ props }">
                <GProgress v-bind="props" />
                <DemoResult label="Progress">{{ props.value }}%</DemoResult>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
