<script setup lang="ts">
import { ref } from 'vue';

const isOpen = ref(false);
</script>

<template>
  <div>
    <h1>GAlertDialog Component</h1>
    
    <ComponentDemo
      name="Basic Alert Dialog"
      description="A modal alert dialog for important user confirmations."
    >
      <GButton @click="isOpen = true">Open Alert Dialog</GButton>
      
      <GAlertDialog v-model="isOpen">
        <template #title>Important Notice</template>
        <template #default>
          <p>This is an important message that requires your attention.</p>
        </template>
        <template #actions>
          <GButton @click="isOpen = false">OK</GButton>
          <GButton theme="secondary" @click="isOpen = false">Cancel</GButton>
        </template>
      </GAlertDialog>
    </ComponentDemo>
  </div>
</template>
