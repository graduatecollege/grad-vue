<script setup lang="ts">
import { ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import GModal from "../../../src/components/GModal.vue";
import GButton from "../../../src/components/GButton.vue";

const showModal = ref(false);
</script>

<template>
    <ComponentSection title="Modal">
        <ComponentDemo
            description="A generic modal component for displaying content over the page. Click the button to open the modal."
            component="GModal"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Modal label',
                    default: 'Basic Modal'
                },
                describedby: {
                    type: 'string',
                    label: 'ID for aria-describedby',
                    default: null
                },
                hiddenLabel: {
                    type: 'boolean',
                    label: 'Hide label',
                    default: false
                },
                size: {
                    type: 'select',
                    label: 'Modal size',
                    default: 'medium',
                    options: [
                        'small',
                        'medium',
                        'large',
                        'full'
                    ]
                }
            }"
        >
            <template #docs><p>Generic modal component.</p>
<p>Clicking on the outside or pressing the escape key will close the modal.</p>
<div class="markdown-alert markdown-alert-important">
<p class="markdown-alert-title"><svg class="octicon octicon-report mr-2" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>Important</p>
<p>The surrounding page <strong>must</strong> have an element with the id <code>modal-root</code>,
this modal will be teleported to it, so it can properly be over all
other content. The <code>modal-root</code> should be somewhere near the end of the
page structure.</p>
</div>
<p><strong>Props</strong>:</p>
<ul>
<li><code>label</code>: Modal accessible label.</li>
<li><code>describedby</code>: Element ID to pass to aria-describedby. Use this if there&#39;s
specific important text to describe the modal.</li>
<li><code>hiddenLabel</code>: Hide label visually. It will still be used as <code>aria-label</code>.</li>
<li><code>size</code>: Modal size</li>
</ul>
<p><strong>Slot</strong> <code>default</code> is used as the content of the modal.</p>
<p>When the modal is opened, focus is placed on the H2 label element. This
can be overridden by providing a <code>popover-focus</code> attribute on an element
inside the modal.</p>
<p>Adding a dimming overlay behind modals can be done by placing <code>GOverlay</code>
at the end of the page structure.</p>
<div class="markdown-alert markdown-alert-warning">
<p class="markdown-alert-title"><svg class="octicon octicon-alert mr-2" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>Warning</p>
<p>There are some shenanigans in the modal and overlay implementation in order
to support Nuxt without including it as a dependency. Specifically, the refs
to store the state of the overlay stack is added to <code>window._g_overlay_stack_state</code>
when <code>document</code> is defined. That makes it only load in the client.</p>
</div>
</template>
            <template #default="{ props }">
                <GButton @click="showModal = true">Open Modal</GButton>

                    <GModal
                        v-if="showModal"
                        v-bind="props"
                        :label="props.label"
                        @close="showModal = false"
                    >
                        <p>
                            This is a generic modal. You can put any content
                            here. It doesn't have default action buttons, giving
                            you full control over the content and interactions.
                        </p>
                        <div
                            style="
                                height: 1500px;
                                background: linear-gradient(
                                    to bottom,
                                    #f0f0f0,
                                    #ccc
                                );
                                padding: 20px;
                                border: 1px dashed #999;
                            "
                        >
                            <p>
                                This is a very tall content to test scrolling.
                            </p>
                            <p style="margin-top: 1400px">
                                Bottom of the content.
                            </p>
                        </div>
                    </GModal>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
