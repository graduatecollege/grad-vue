<script setup lang="ts">
/**
 * A component that can show progress from 1 to 100 or an indeterminate spinner.
 * If a value is omitted, the progress will be indeterminate.
 *
 * If no `label` is specified, the default accessible label will be "Loading".
 *
 * If a value is provided, the element will have the ARIA role `progressbar`
 * with the appropriate ARIA value attributes.
 */
import { computed } from "vue";

type Props = {
    /**
     * Accessible label
     */
    label?: string;
    /**
     * Progress 1-100 or blank
     */
    value?: number;
    /**
     * Progress circle size
     */
    size?: "tiny" | "small" | "medium" | "large";
};

const props = withDefaults(defineProps<Props>(), {
    size: "medium",
    value: undefined,
    label: "Loading",
});

const isDeterminate = computed(
    () =>
        props.value &&
        props.value >= 1 &&
        props.value <= 100,
);
const radius = computed(() => {
    switch (props.size) {
        case "tiny":
            return 9;
        case "small":
            return 12;
        case "large":
            return 24;
        default:
            return 18;
    }
});
const stroke = 4;
const circumference = computed(() => 2 * Math.PI * radius.value);
const progress = computed(() =>
    isDeterminate.value ? (props.value! / 100) * circumference.value : 0,
);

const ariaProps = computed(() =>
    isDeterminate.value
        ? {
              role: "progressbar",
              "aria-valuenow": props.value,
              "aria-valuemin": 1,
              "aria-valuemax": 100,
              "aria-label": props.label,
          }
        : { "aria-label": props.label },
);
</script>

<template>
    <span class="g-progress" v-bind="ariaProps">
        <svg
            :width="radius * 2 + stroke"
            :height="radius * 2 + stroke"
            :class="[
                'g-progress__svg',
                {
                    'g-progress--determinate': isDeterminate,
                    'g-progress--indeterminate': !isDeterminate,
                },
            ]"
            focusable="false"
            aria-hidden="true"
        >
            <circle
                class="g-progress__track"
                :cx="radius + stroke / 2"
                :cy="radius + stroke / 2"
                :r="radius"
                :stroke-width="stroke"
                fill="none"
            />
            <circle
                v-if="isDeterminate"
                class="g-progress__value"
                :cx="radius + stroke / 2"
                :cy="radius + stroke / 2"
                :r="radius"
                :stroke-width="stroke"
                fill="none"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="circumference - progress"
                style="transform: rotate(-90deg); transform-origin: center"
            />
            <circle
                v-else
                class="g-progress__spinner"
                :cx="radius + stroke / 2"
                :cy="radius + stroke / 2"
                :r="radius"
                :stroke-width="stroke"
                fill="none"
            />
        </svg>
    </span>
</template>

<style scoped>
.g-progress {
    display: inline-block;
    vertical-align: middle;
}

.g-progress__svg {
    display: block;
}
.g-progress__track {
    stroke: var(--g-surface-200);
}
.g-progress__value {
    stroke: var(--g-primary-500);
    transition: stroke-dashoffset 0.2s linear;
}
.g-progress__spinner {
    animation: g-progress-spin 1s linear infinite;
    transform-box: fill-box;
    transform-origin: center;
}
.g-progress__spinner {
    stroke: var(--g-primary-500);
    stroke-dasharray: 40 80;
}
@media (prefers-reduced-motion: reduce) {
    .g-progress__spinner {
        animation: g-progress-spin-blink 1s both infinite;
    }
}
@keyframes g-progress-spin {
    100% {
        transform: rotate(360deg);
    }
}
@keyframes g-progress-spin-blink {
    0%,
    100% {
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
}
</style>
