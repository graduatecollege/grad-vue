<script setup lang="ts">
/**
 * The element or component can be set with the `component` prop, so it can be
 * a link or `router-link` component from vue-router. For example:
 *
 * ```vue-html
 * <GButton component="router-link" to="/some-route">
 *     Click me
 * </GButton>
 * ```
 *
 * Note that grad-vue doesn't include vue-router as a dependency.
 */
import { computed, useAttrs } from "vue";

interface Props {
    /**
     * Button size
     */
    size?: "small" | "medium" | "large";
    /**
     * Button color theme
     */
    theme?: "primary" | "secondary" | "accent" | "danger" | "none";
    /**
     * Use outlined style
     */
    outlined?: boolean;
    /**
     * Use text style
     */
    text?: boolean;

    to?: string | Record<string, any>;
    component?: string;
}

const props = withDefaults(defineProps<Props>(), {
    size: "medium",
    theme: "primary",
    outlined: false,
    text: false,
    to: undefined,
    component: undefined,
});

defineEmits([
    "click",
    "focus",
    "blur",
    "keydown",
    "keyup",
    "mousedown",
    "mouseup",
    "mouseenter",
    "mouseleave",
]);
const attrs = useAttrs();

const classes = computed(() => [
    "g-btn",
    `g-btn--${props.size}`,
    `g-btn--${props.theme}`,
    {
        "g-btn--outlined": props.outlined,
        "g-btn--text": props.text,
        "ilw-theme-blue": props.theme === "primary",
        "ilw-theme-orange": props.theme === "accent",
        "g-btn-has-text": props.text,
    },
]);
</script>

<template>
    <component
        :is="props.component ? props.component : 'button'"
        v-bind="attrs"
        :to="props.to"
        :class="classes"
        :type="props.to ? undefined : 'button'"
        @click="$emit('click', $event)"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
        @keydown="$emit('keydown', $event)"
        @keyup="$emit('keyup', $event)"
        @mousedown="$emit('mousedown', $event)"
        @mouseup="$emit('mouseup', $event)"
        @mouseenter="$emit('mouseenter', $event)"
        @mouseleave="$emit('mouseleave', $event)"
    >
        <slot />
    </component>
</template>

<style>
.g-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--il-font-sans);
    font-weight: 700;
    font-size: 1.1875rem;
    line-height: 1.1;
    border: 2px solid var(--ilw-color--background);
    background: var(--ilw-color--background);
    color: var(--ilw-color--heading);
    cursor: pointer;
    padding: 12px 20px;
    border-radius: var(--g-border-radius-m);
    text-decoration: none;

    &:hover {
        color: var(--ilw-color--background);
        background: var(--ilw-color--heading);
        border-color: var(--ilw-color--background);
        text-decoration: underline;
    }

    &:active {
        background: var(--ilw-color--heading-link-hover);
        color: var(--ilw-color--heading);
    }

    &:focus-visible {
        border-color: var(--ilw-color--focus--outline);
        color: var(--ilw-color--focus--text);
        background: var(--ilw-color--focus--background);
    }
}

.g-btn--small {
    font-size: 0.875rem;
    padding: 0.4em 0.75em 0.25em;

    --ilw-color--orange--background: var(--il-altgeld);
    --ilw-color--orange--control: var(--il-altgeld);
    --ilw-color--blue--link-hover: var(--il-altgeld);
    --ilw-color--blue--control-accent: var(--il-altgeld);
    --ilw-color--blue--heading-link-hover: var(--il-altgeld);

    &.g-btn-has-text {
        .fa,
        svg {
            margin-right: 0.75em;
        }
    }
}

.g-btn--large {
    font-size: 1.1875rem;
    padding: 0.75em 1.75em;
}

.g-btn--danger {
    --ilw-color--background: var(--g-danger-500);
    --ilw-color--heading: var(--g-danger-text);
}

.g-btn--secondary {
    --ilw-color--background: var(--g-surface-700);
    --ilw-color--heading: var(--g-surface-100);
    --ilw-color--heading-link-hover: var(--g-surface-900);
}

.g-btn--outlined {
    color: var(--ilw-color--background);
    background: var(--ilw-color--heading);
    border-color: var(--ilw-color--background);

    &:hover {
        background: var(--ilw-color--background);
        color: var(--ilw-color--heading);
    }
    &:active {
        background: var(--ilw-color--heading-link-hover);
        color: var(--ilw-color--heading);
    }
    &:focus-visible {
        border-color: var(--ilw-color--focus--outline);
        color: var(--ilw-color--focus--text);
        background: var(--ilw-color--focus--background);
    }
}

.g-btn--text {
    background: none;
    border: none;
    color: var(--ilw-color--background);
    padding: 4px 8px;
    &:hover {
        color: var(--ilw-color--heading-link-hover);
        text-decoration: underline;
    }
    &:active {
        background: var(--ilw-color--heading-link-hover);
        color: var(--ilw-color--heading);
    }
    &:focus-visible {
        border-color: var(--ilw-color--focus--outline);
        color: var(--ilw-color--focus--text);
        background: var(--ilw-color--focus--background);
    }
}
</style>
