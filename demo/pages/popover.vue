<script setup lang="ts">
import { ref } from 'vue';

const isOpen = ref(false);
</script>

<template>
  <div>
    <h1>GPopover Component</h1>
    
    <ComponentDemo
      name="Basic Popover"
      description="A popover overlay component that appears relative to a trigger element."
    >
      <GPopover v-model="isOpen">
        <template #trigger>
          <GButton @click="isOpen = !isOpen">Toggle Popover</GButton>
        </template>
        <template #default>
          <div style="padding: 1rem; background: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="margin: 0;">This is popover content!</p>
            <GButton size="small" @click="isOpen = false" style="margin-top: 0.5rem;">Close</GButton>
          </div>
        </template>
      </GPopover>
    </ComponentDemo>
  </div>
</template>
