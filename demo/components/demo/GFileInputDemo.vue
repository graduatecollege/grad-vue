<script setup lang="ts">
import { ref } from "vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GFileInput } from "@illinois-grad/grad-vue";

const singleFile = ref<File[]>([]);
const multipleFiles = ref<File[]>([]);
const imageFiles = ref<File[]>([]);
const errorFiles = ref<File[]>([]);
</script>

<template>
    <section id="file-input" class="demo-section">
        <h2 class="demo-section__title">File Input</h2>

        <ComponentDemo
            name="Single File"
            description="A basic file input for selecting a single file."
            component="GFileInput"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Label',
                    default: 'Upload File'
                },
                instructions: {
                    type: 'string',
                    label: 'Instructions',
                    default: 'Select a file to upload.'
                },
                disabled: {
                    type: 'boolean',
                    label: 'Disabled',
                    default: false
                },
                required: {
                    type: 'boolean',
                    label: 'Required',
                    default: false
                }
            }"
        >
            <template #default="{ props }">
                <GFileInput
                    v-model="singleFile"
                    v-bind="props"
                />
                <DemoResult label="Selected">
                    {{ singleFile.length ? singleFile[0].name : 'None' }}
                </DemoResult>
            </template>
        </ComponentDemo>

        <ComponentDemo
            name="Multiple Files"
            description="A file input that allows selecting multiple files at once."
            component="GFileInput"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Label',
                    default: 'Upload Files'
                },
                instructions: {
                    type: 'string',
                    label: 'Instructions',
                    default: 'Select one or more files.'
                }
            }"
        >
            <template #default="{ props }">
                <GFileInput
                    v-model="multipleFiles"
                    multiple
                    v-bind="props"
                />
                <DemoResult label="Selected">
                    {{ multipleFiles.length ? multipleFiles.map(f => f.name).join(', ') : 'None' }}
                </DemoResult>
            </template>
        </ComponentDemo>

        <ComponentDemo
            name="Accept Filter (Images)"
            description="A file input restricted to image file types."
            component="GFileInput"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Label',
                    default: 'Upload Image'
                },
                instructions: {
                    type: 'string',
                    label: 'Instructions',
                    default: 'Accepted formats: JPG, PNG, GIF, WebP.'
                }
            }"
        >
            <template #default="{ props }">
                <GFileInput
                    v-model="imageFiles"
                    accept="image/*"
                    v-bind="props"
                />
                <DemoResult label="Selected">
                    {{ imageFiles.length ? imageFiles[0].name : 'None' }}
                </DemoResult>
            </template>
        </ComponentDemo>

        <ComponentDemo
            name="With Errors"
            description="A file input displaying validation error messages."
            component="GFileInput"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Label',
                    default: 'Upload Document'
                }
            }"
        >
            <template #default="{ props }">
                <GFileInput
                    v-model="errorFiles"
                    :errors="['A file is required.']"
                    v-bind="props"
                />
            </template>
        </ComponentDemo>
    </section>
</template>
