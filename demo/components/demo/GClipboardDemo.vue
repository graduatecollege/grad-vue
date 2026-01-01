<script setup lang="ts">
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
</script>

<template>
    <ComponentSection title="Clipboard">
        <ComponentDemo
            description="Scaffolded demo for GClipboard."
            component="GClipboard"
            :props-config="{
                text: {
                    type: 'string',
                    label: 'Text',
                    default: 'This is some text to get copied'
                },
                hideText: {
                    type: 'boolean',
                    label: 'Hide the visible text'
                }
            }"
        >
            <template #docs><p>Displays text with a clipboard button that copies the text to the clipboard.
The text can be hidden in cases where it&#39;s already displayed differently.</p>
<p>If for some reason the user&#39;s browser doesn&#39;t support a clipboard,
the tooltip will indicate that when they try to copy.</p>
</template>
            <template #default="{ props }">
                <GClipboard v-bind="props" />
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
