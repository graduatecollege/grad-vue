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
 *
 * **Icons** can be added with either the `icon` prop or a named slot `icon`:
 * - Use the `icon` prop to pass an icon class string, e.g., "fa-solid fa-plus".
 * - If using the `icon` prop, the icon will be rendered as a span with the `aria-hidden` attribute set to `true`.
 * - Use a named slot `icon` to provide custom icon content.
 * - If both `icon` prop and named slot `icon` are provided, the named slot takes precedence.
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

    // Optional icon classes to render an icon span before the label.
    // Example: "fa-solid fa-plus" or "material-symbols:add".
    // If a named slot `icon` is provided, it takes precedence over this prop.
    icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
    size: "medium",
    theme: "primary",
    outlined: false,
    text: false,
    to: undefined,
    component: undefined,
    icon: undefined,
});

const slots = defineSlots<{
    default(): any;
    icon?: () => any;
}>();

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
        "g-btn--primary": props.theme === "primary",
        "g-btn--accent": props.theme === "accent",
        "g-btn-has-text": props.text,
        "g-btn-has-icon-class": props.icon,
        "g-btn-has-icon-svg": !!slots.icon,
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
        <template v-if="icon || slots.icon">
            <span class="g-btn--icon">
                <slot v-if="slots.icon" name="icon" />
                <span v-else :class="icon + ' g-btn--icon-span'" aria-hidden="true"></span>
            </span>
            <span class="g-btn--label">
                <slot />
            </span>
        </template>
        <template v-else>
            <slot />
        </template>
    </component>
</template>

<style>
.g-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--il-font-sans);
    font-weight: 700;
    font-size: 19px;
    line-height: 20px;
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
    font-size: 14px;
    padding: 6px 10px 7px;

    --g-accent-500: var(--il-altgeld);
}

.g-btn--large {
    font-size: 21px;
    line-height: 24px;
    padding: 16px 24px;
}

.g-btn-has-icon-class, .g-btn-has-icon-svg {
    gap: 2px;
    padding: 6px 20px 6px 6px;

    &.g-btn--small {
        padding: 0 14px 1px 0;
    }
    &.g-btn--large {
        padding: 12px 24px 12px 10px;
    }

    &:hover {
        text-decoration: none;

        .g-btn--label {
            text-decoration: underline;
        }
    }
}

.g-btn--icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    overflow: hidden;
    text-decoration: none;

    span.g-btn--icon-span {
        max-width: 100%;
        max-height: 100%;
    }
}

.g-btn--label {
    display: block;
}

/* Visually balance leading icon by slightly reducing left offset */
.g-btn > .g-btn--icon:first-child {
    margin-left: -0.1em;
}

.g-btn--icon > svg,
.g-btn--icon > img {
    width: 1em;
    height: 1em;
    display: block;
    flex: 0 0 auto;
}

.g-btn--primary {
    --ilw-color--background: var(--g-primary-500);
    --ilw-color--heading: var(--g-primary-text);
}
.g-btn--accent {
    --ilw-color--background: var(--g-accent-500);
    --ilw-color--heading: var(--g-surface-0);
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
    padding: 0.25em 0.5em; /* lighter padding using ems for consistency */
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
