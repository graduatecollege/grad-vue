<script setup lang="ts">
import { ref } from 'vue';

const progressValue = ref(50);
</script>

<template>
  <section id="progress" class="demo-section">
    <h2 class="demo-section__title">GProgress</h2>
    
    <ComponentDemo
      name="Basic Progress"
      description="A progress indicator component."
      :props-config="{
        value: {
          type: 'number',
          default: 50,
          label: 'Progress Value'
        }
      }"
    >
      <template #default="{ props }">
        <GProgress :value="props.value" />
        <p style="margin-top: 1rem; color: #6b7280;">Progress: {{ props.value }}%</p>
      </template>
    </ComponentDemo>
  </section>
</template>
