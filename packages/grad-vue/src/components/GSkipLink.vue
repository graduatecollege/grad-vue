<script lang="ts">
/**
 * A "skip to main content" link for keyboard and screen reader users.
 *
 * Place it as the first focusable element in the app, before `GAppHeader`.
 * It stays hidden until it receives keyboard focus. Activating it moves
 * focus to the element with the `target` id (usually a `GMain`), falling
 * back to the first `<main>` element.
 *
 * Focus is moved with JavaScript, so it works with client-side routers
 * and with targets that are rendered after the link.
 *
 * ```vue
 * <GSkipLink />
 * <GAppHeader>...</GAppHeader>
 * <RouterView />
 * ```
 */
export default {};
</script>

<script setup lang="ts">
import { focusMainTarget } from "../compose/useRouteAnnouncer.ts";

type Props = {
    /**
     * Id of the element to move focus to
     */
    target?: string;
    /**
     * Link text
     * @demo
     */
    label?: string;
};

const props = withDefaults(defineProps<Props>(), {
    target: "main-content",
    label: "Skip to main content",
});

function onClick(event: MouseEvent) {
    if (focusMainTarget(props.target, false)) {
        event.preventDefault();
    }
}
</script>

<template>
    <a class="g-skip-link" :href="`#${props.target}`" @click="onClick">
        <slot>{{ props.label }}</slot>
    </a>
</template>

<style scoped>
.g-skip-link {
    position: fixed;
    top: 0.5rem;
    left: 0.5rem;
    z-index: 1000;
    padding: 0.75rem 1rem;
    border-radius: var(--g-border-radius-m);
    background: var(--ilw-color--focus--background);
    color: var(--ilw-color--focus--text);
    text-decoration: underline;
    transform: translateY(calc(-100% - 1rem));
}

.g-skip-link:focus {
    transform: none;
    outline-color: var(--ilw-color--focus--outline);
    outline-offset: 2px;
}

@media print {
    .g-skip-link {
        display: none;
    }
}
</style>
