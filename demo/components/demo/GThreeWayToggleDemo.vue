<script setup lang="ts">
import ComponentDemo from "../ComponentDemo.vue";
</script>

<template>
    <section id="three-way-toggle" class="demo-section">
        <h2 class="demo-section__title">Three Way Toggle</h2>
        <ComponentDemo
            description="A switch or toggle with three different states."
            component="GThreeWayToggle"
            :props-config="{
                label: {
                    type: 'string',
                    label: 'Accessible label',
                    default: 'Three-way toggle'
                },
                error: {
                    type: 'string',
                    label: 'Error message'
                },
                disabled: {
                    type: 'boolean',
                    label: 'Disabled'
                }
            }"
        >
            <template #docs><p>This component acts like a radio button group condensed into a compact
element with the goal of making it easy to go over many of them at once.</p>
<p>In addition to the arrow keys changing the selected value, special key
bindings exist for &#39;y&#39; and &#39;n&#39; to set yes and no respectively.</p>
<p>A <code>describedby</code> prop can be passed with an ID to an element to be used as
the <code>aria-describedby</code> for the group element.</p>
<p>When the value changes, <code>v-model</code> is updated. A <code>change</code> event is also emitted
if the value changed from user interaction.</p>
</template>
            <template #default="{ props }">
                <div style="max-width: 200px">
                    <GThreeWayToggle v-bind="props" />
                </div>
            </template>
        </ComponentDemo>
    </section>
</template>
