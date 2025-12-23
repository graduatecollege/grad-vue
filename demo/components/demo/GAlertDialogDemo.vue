<script setup lang="ts">
import { ref } from "vue";
import ComponentDemo from "../ComponentDemo.vue";
import { GAlertDialog, GButton } from "@illinois-grad/grad-vue";

const showDialog = ref(false);
const dialogResult = ref<string>("");

const handleConfirm = () => {
    showDialog.value = false;
    dialogResult.value = "Confirmed";
};
const handleCancel = () => {
    showDialog.value = false;
    dialogResult.value = "Cancelled";
};
</script>

<template>
    <section id="alert-dialog" class="demo-section">
        <h2 class="demo-section__title">Alert Dialog</h2>

        <ComponentDemo
            name="Basic Alert Dialog"
            description="A modal alert dialog for important user confirmations. Click the button to open the dialog."
            component="GAlertDialog"
        >
            <GButton @click="showDialog = true">Open Alert Dialog</GButton>
            <p>Result: {{ dialogResult }}</p>

            <GAlertDialog
                v-if="showDialog"
                label="Important Notice"
                button-text="Confirm"
                @confirm="handleConfirm"
                @cancel="handleCancel"
            >
                <p>
                    This is an important message that requires your attention.
                    Please confirm or cancel.
                </p>
            </GAlertDialog>
        </ComponentDemo>
    </section>
</template>
