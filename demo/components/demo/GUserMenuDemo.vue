<script setup lang="ts">
import ComponentDemo from "../ComponentDemo.vue";
import { computed, ref } from "vue";

// Function to generate deterministic color from username
function getUserColor(username: string): string {
    const colors = [
        "#4A90E2", // Blue
        "#E24A90", // Pink
        "#90E24A", // Green
        "#E2904A", // Orange
        "#904AE2", // Purple
        "#4AE290", // Teal
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

const logoutClicked = ref(false);

function handleLogout() {
    logoutClicked.value = true;
    setTimeout(() => {
        logoutClicked.value = false;
    }, 2000);
}

const users = [
    { initials: "JD", email: "john.doe@example.com" },
    { initials: "AS", email: "alice.smith@example.com" },
    { initials: "BJ", email: "bob.jones@example.com" },
];

const selectedUser = ref(0);
const currentUser = computed(() => users[selectedUser.value]);
const currentColor = computed(() => getUserColor(currentUser.value.email));
</script>

<template>
    <section id="user-menu" class="demo-section">
        <h2 class="demo-section__title">User Menu</h2>
        <ComponentDemo
            name="Basic User Menu"
            description="User menu component with avatar, email display, and account links."
            component="GUserMenu"
            :props-config="{
                initials: {
                    type: 'string',
                    label: 'Initials',
                    default: currentUser.initials,
                },
                email: {
                    type: 'string',
                    label: 'Email',
                    default: currentUser.email,
                },
                color: {
                    type: 'string',
                    label: 'Avatar Color',
                    default: currentColor,
                },
                label: {
                    type: 'string',
                    label: 'Accessible Label',
                    default: 'User menu',
                },
            }"
        >
            <template #docs>
                The GUserMenu component displays a user avatar button with initials
                in a colored circle. When clicked, it opens a popover showing the
                user's email and a menu with account-related links.
                <br /><br />
                The color should be deterministic based on the username to provide
                consistent visual identification across the application.
            </template>
            <template #default="{ props }">
                <div style="display: flex; gap: 2rem; align-items: start">
                    <GUserMenu v-bind="props">
                        <a href="#profile">Profile</a>
                        <a href="#settings">Settings</a>
                        <button type="button" @click="handleLogout">
                            Logout
                        </button>
                    </GUserMenu>
                    <div
                        v-if="logoutClicked"
                        style="
                            padding: 0.5rem 1rem;
                            background: #e8f4f8;
                            border-radius: 4px;
                        "
                    >
                        Logout clicked!
                    </div>
                </div>
            </template>
        </ComponentDemo>

        <ComponentDemo
            name="Different Users"
            description="Examples showing different users with deterministic colors."
            component="GUserMenu"
        >
            <template #default>
                <div style="display: flex; gap: 1rem; align-items: center">
                    <div
                        v-for="(user, index) in users"
                        :key="user.email"
                        style="
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 0.5rem;
                        "
                    >
                        <GUserMenu
                            :initials="user.initials"
                            :email="user.email"
                            :color="getUserColor(user.email)"
                        >
                            <a href="#profile">Profile</a>
                            <a href="#settings">Settings</a>
                            <button type="button">Logout</button>
                        </GUserMenu>
                        <span style="font-size: 0.875rem; color: #666">{{
                            user.initials
                        }}</span>
                    </div>
                </div>
            </template>
        </ComponentDemo>

        <ComponentDemo
            name="With Router Links"
            description="Example showing router links in the menu (when vue-router is available)."
            component="GUserMenu"
        >
            <template #default>
                <GUserMenu
                    initials="VR"
                    email="vue.router@example.com"
                    color="#42b883"
                >
                    <router-link to="/profile">Profile</router-link>
                    <router-link to="/settings">Settings</router-link>
                    <a href="/help">Help</a>
                    <button type="button">Logout</button>
                </GUserMenu>
            </template>
        </ComponentDemo>
    </section>
</template>
