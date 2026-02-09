<script setup lang="ts">
/**
 * User menu component for toolbars. Displays a button with the user's initials
 * inside a colored circle. When clicked, it opens a popover with the user's
 * email and a menu for account-related links.
 *
 * **Slots**:
 * - `default` contains menu items (links or buttons) that will be wrapped in
 *   an unordered list for accessibility.
 *
 * **Props**:
 * - `initials` - User's initials to display in the avatar
 * - `email` - User's email to display in the popover
 * - `color` - Background color for the avatar (should be deterministic)
 * - `label` - Accessible label for the menu button. The initial will be prepended to this for the full label.
 *
 * Example:
 *
 * ```vue-html
 * <GUserMenu
 *     initials="J"
 *     email="j@example.com"
 *     color="#4A90E2"
 * >
 *     <router-link to="/profile">Profile</router-link>
 *     <a href="/settings">Settings</a>
 *     <button @click="handleLogout">Logout</button>
 * </GUserMenu>
 * ```
 */

import { getCurrentInstance, ref, useId, useSlots, useTemplateRef } from "vue";
import GPopover from "./GPopover.vue";

interface Props {
    /**
     * User initial(s)
     */
    initials: string; // Demo: J
    /**
     * User email
     */
    email: string; // Demo: j@example.org
    /**
     * Background color
     */
    color?: string;
    /**
     * Accessible label
     */
    label?: string;
}

const props = withDefaults(defineProps<Props>(), {
    label: "User menu",
    color: "var(--g-surface-700)",
});

const id = useId();
const emailHeadingId = `${id}-email`;
const open = ref(false);

// Get the heading ref to focus it when the popover opens
const emailHeading = useTemplateRef<HTMLElement>("emailHeading");

// Detect vue-router without adding it as a dependency
const instance = getCurrentInstance();
const RouterLinkComp = instance?.appContext?.components?.RouterLink as
    | any
    | undefined;

const slots = defineSlots<{
    default(): any
}>();

</script>

<template>
    <div class="g-user-menu">
        <GPopover v-model="open" minimal>
            <template #trigger="{ toggle }">
                <button
                    class="g-user-menu__avatar"
                    :style="{ backgroundColor: color }"
                    :aria-label="initials + ' - ' + label"
                    :aria-expanded="open"
                    aria-haspopup="menu"
                    @click="toggle"
                >
                    {{ initials }}
                </button>
            </template>
            <div class="g-user-menu__popover">
                <h2
                    :id="emailHeadingId"
                    ref="emailHeading"
                    class="g-user-menu__email"
                    tabindex="-1"
                >
                    {{ email }}
                </h2>
                <nav class="g-user-menu__nav" :aria-labelledby="emailHeadingId">
                    <ul class="g-user-menu__list">
                        <li v-for="(link, index) in slots.default()" :key="index">
                            <component :is="link"></component>
                        </li>
                    </ul>
                </nav>
            </div>
        </GPopover>
    </div>
</template>

<style scoped>
.g-user-menu {
    display: inline-block;
}

.g-user-menu__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    color: var(--g-surface-0);
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
        transform 0.2s,
        box-shadow 0.2s;
    outline-color: var(--g-primary-500);
}

.g-user-menu__avatar:hover {
    text-decoration: underline;
}

.g-user-menu__avatar:focus-visible {
    background-color: var(--ilw-color--focus--background) !important;
    color: var(--ilw-color--focus--text) !important;
}

.g-user-menu__popover {
    min-width: 200px;
}

.g-user-menu__email {
    margin: 0.75rem 1rem 0.25rem;
    font-size: 1rem;
    font-weight: normal;
    color: var(--g-primary-500);
    word-break: break-word;
}

.g-user-menu__nav {
    margin: 0;
}

.g-user-menu__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
}

.g-user-menu__list :deep(a),
.g-user-menu__list :deep(button) {
    display: block;
    padding: 0.75rem 1rem;
    box-sizing: border-box;
    color: var(--g-primary-500);
    text-decoration: none;
    border: none;
    background: none;
    font-size: 1rem;
    font-weight: 600;
    font-family: var(--il-font-sans);
    text-align: left;
    cursor: pointer;
}

.g-user-menu__list :deep(a:hover),
.g-user-menu__list :deep(button:hover) {
    color: var(--g-accent-700);
    text-decoration: underline;
}

.g-user-menu__list :deep(a:focus),
.g-user-menu__list :deep(button:focus) {
    background: var(--ilw-color--focus--background);
    color: var(--ilw-color--focus--text);
}

.g-user-menu__list :deep(a:active),
.g-user-menu__list :deep(button:active) {
    background-color: var(--g-accent-700);
    color: var(--g-surface-0);
}
</style>
