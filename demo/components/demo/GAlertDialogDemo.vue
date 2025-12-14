<script setup lang="ts">
import { ref } from 'vue';

const showDialog = ref(false);
const handleConfirm = () => {
  showDialog.value = false;
  alert('Confirmed!');
};
const handleCancel = () => {
  showDialog.value = false;
  alert('Cancelled!');
};
</script>

<template>
  <section id="alert-dialog" class="demo-section">
    <h2 class="demo-section__title">GAlertDialog</h2>
    
    <ComponentDemo
      name="Basic Alert Dialog"
      description="A modal alert dialog for important user confirmations. Click the button to open the dialog."
    >
      <GButton @click="showDialog = true">Open Alert Dialog</GButton>
      
      <Teleport to="body">
        <GAlertDialog
          v-if="showDialog"
          label="Important Notice"
          button-text="Confirm"
          @confirm="handleConfirm"
          @cancel="handleCancel"
        >
          <p>This is an important message that requires your attention. Please confirm or cancel.</p>
        </GAlertDialog>
      </Teleport>
    </ComponentDemo>
  </section>
</template>
