<script setup lang="ts">
import { ref } from 'vue';

const selectButtonValue = ref('option1');
const selectButtonOptions = ref([
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
]);
</script>

<template>
  <section id="select-button" class="demo-section">
    <h2 class="demo-section__title">GSelectButton</h2>
    
    <ComponentDemo
      name="Basic Select Button"
      description="A button-style select component for choosing between options."
    >
      <GSelectButton
        v-model="selectButtonValue"
        :options="selectButtonOptions"
        label="Choose an option"
      />
      <p style="margin-top: 1rem; color: #6b7280;">Selected: {{ selectButtonValue }}</p>
    </ComponentDemo>
  </section>
</template>
