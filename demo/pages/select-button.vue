<script setup lang="ts">
import { ref } from 'vue';

const selectedValue = ref('option1');
const options = ref([
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
]);
</script>

<template>
  <div>
    <h1>GSelectButton Component</h1>
    
    <ComponentDemo
      name="Basic Select Button"
      description="A button-style select component for choosing between options."
    >
      <GSelectButton
        v-model="selectedValue"
        :options="options"
        label="Choose an option"
      />
      <p style="margin-top: 1rem; color: #6b7280;">Selected: {{ selectedValue }}</p>
    </ComponentDemo>
  </div>
</template>
