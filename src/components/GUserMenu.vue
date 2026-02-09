<script setup lang="ts">
/**
 * User menu component for toolbars. Displays a button with the user's initials
 * inside a colored circle. When clicked, it opens a popover with the user's
 * email and a menu for account-related links.
 *
 * The color of the avatar button is determined by the calling code and should
 * be deterministic based on the username.
 *
 * **Slots**:
 * - `default` contains menu items (links or buttons) that will be wrapped in
 *   an unordered list for accessibility.
 *
 * **Props**:
 * - `initials` - User's initials to display in the avatar
 * - `email` - User's email to display in the popover
 * - `color` - Background color for the avatar (should be deterministic)
 * - `label` - Accessible label for the menu button
 *
 * Example:
 *
 * ```vue
 * <GUserMenu
 *     initials="JD"
 *     email="john.doe@example.com"
 *     color="#4A90E2"
 *     label="User menu"
 * >
 *     <router-link to="/profile">Profile</router-link>
 *     <a href="/settings">Settings</a>
 *     <button @click="handleLogout">Logout</button>
 * </GUserMenu>
 * ```
 */

import { getCurrentInstance, ref, useId, useTemplateRef } from "vue";
import GPopover from "./GPopover.vue";

interface Props {
    /**
     * User's initials to display in the avatar
     */
    initials: string;
    /**
     * User's email to display in the popover
     */
    email: string;
    /**
     * Background color for the avatar (should be deterministic based on username)
     */
    color: string;
    /**
     * Accessible label for the menu button
     */
    label?: string;
}

const props = withDefaults(defineProps<Props>(), {
    label: "User menu",
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
</script>

<template>
    <div class="g-user-menu">
        <GPopover v-model="open" minimal>
            <template #trigger="{ toggle }">
                <button
                    class="g-user-menu__avatar"
                    :style="{ backgroundColor: color }"
                    :aria-label="label"
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
                        <slot></slot>
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
    border: 2px solid var(--g-surface-0, #fff);
    color: var(--g-surface-0, #fff);
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
        transform 0.2s,
        box-shadow 0.2s;
}

.g-user-menu__avatar:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.g-user-menu__avatar:focus {
    outline: 2px solid var(--ilw-color--focus--border, #0056b3);
    outline-offset: 2px;
}

.g-user-menu__avatar:active {
    transform: scale(0.98);
}

.g-user-menu__popover {
    padding: 1rem;
    min-width: 200px;
}

.g-user-menu__email {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--g-primary-500, #13294b);
    word-break: break-word;
    outline: none;
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
    gap: 0;
}

.g-user-menu__list :deep(a),
.g-user-menu__list :deep(button) {
    display: block;
    width: 100%;
    padding: 0.75rem 1rem;
    margin: 0 -1rem;
    color: var(--g-primary-500, #13294b);
    text-decoration: none;
    border: none;
    background: none;
    font-size: 1rem;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s;
}

.g-user-menu__list :deep(a:hover),
.g-user-menu__list :deep(button:hover) {
    background-color: var(--g-surface-100, #f5f5f5);
    text-decoration: underline;
}

.g-user-menu__list :deep(a:focus),
.g-user-menu__list :deep(button:focus) {
    background: var(--ilw-color--focus--background, #e8f4f8);
    color: var(--ilw-color--focus--text, #13294b);
    outline: 2px solid var(--ilw-color--focus--border, #0056b3);
    outline-offset: -2px;
}

.g-user-menu__list :deep(a:active),
.g-user-menu__list :deep(button:active) {
    background-color: var(--g-surface-200, #e0e0e0);
}
</style>
