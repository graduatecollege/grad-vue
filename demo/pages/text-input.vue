<script setup lang="ts">
import { ref } from 'vue';

const textValue = ref('');
</script>

<template>
  <div>
    <h1>GTextInput Component</h1>
    
    <ComponentDemo
      name="Basic Text Input"
      description="A text input component with label and validation support."
      :props-config="{
        placeholder: {
          type: 'string',
          default: 'Enter text...',
          label: 'Placeholder'
        }
      }"
    >
      <template #default="{ props }">
        <GTextInput
          v-model="textValue"
          :placeholder="props.placeholder"
          label="Example Label"
        />
        <p style="margin-top: 1rem; color: #6b7280;">Value: {{ textValue }}</p>
      </template>
    </ComponentDemo>
  </div>
</template>
