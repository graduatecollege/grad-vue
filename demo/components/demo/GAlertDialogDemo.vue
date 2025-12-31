<script setup lang="ts">
import { ref, computed } from "vue";
import ComponentDemo from "../ComponentDemo.vue";

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
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Dialog label',
                    default: 'Confirmation'
                },
                buttonText: {
                    type: 'string',
                    label: 'Accept button text',
                    default: 'Continue'
                },
                buttonColor: {
                    type: 'select',
                    label: 'Accept button color',
                    default: 'primary',
                    options: [
                        'primary',
                        'secondary',
                        'danger'
                    ]
                }
            }"
        >
            <template #docs
                ><p>Alert dialog for confirming or canceling actions.</p>
                <p>
                    Clicking on the outside or pressing the escape key will
                    close the dialog and that counts as canceling.
                </p>
                <p>
                    The surrounding page <strong>must</strong> have an element
                    with the id <code>modal-root</code>, this dialog will be
                    teleported to it, so it can properly be over all other
                    content. The <code>modal-root</code> should be somewhere
                    near the end of the page structure.
                </p>
            </template>
            <template #default="{ props }">
                <GButton @click="showDialog = true">Open Alert Dialog</GButton>
                <p>Result: {{ dialogResult }}</p>

                <GAlertDialog
                    v-if="showDialog"
                    v-bind="props"
                    @confirm="handleConfirm"
                    @cancel="handleCancel"
                >
                    <p>
                        This is an important message that requires your
                        attention. Please confirm or cancel.
                    </p>
                </GAlertDialog>
            </template>
        </ComponentDemo>
    </section>
</template>
