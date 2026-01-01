<script setup lang="ts">
import { ref, computed } from "vue";
import ComponentSection from "../ComponentSection.vue";
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
    <ComponentSection title="Alert Dialog">
        <ComponentDemo
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
            <template #docs><p>Alert dialog for confirming or canceling actions.</p>
<p>Clicking on the outside or pressing the escape key will close the dialog
and that counts as canceling.</p>
<div class="markdown-alert markdown-alert-important">
<p class="markdown-alert-title"><svg class="octicon octicon-report mr-2" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>Important</p>
<p>The surrounding page <strong>must</strong> have an element with the id <code>modal-root</code>,
this dialog will be teleported to it, so it can properly be over all
other content. The <code>modal-root</code> should be somewhere near the end of the
page structure.</p>
</div>
<p><strong>Slot</strong> <code>default</code> is used as the content of the alert, and also becomes
the ARIA description of the alert.</p>
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
    </ComponentSection>
</template>
