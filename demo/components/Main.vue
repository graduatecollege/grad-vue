<script setup lang="ts">
import { GSidebar, GSidebarMenu } from "@illinois-grad/grad-vue";
import { useActiveLinkStore } from "~/stores/test.store";
import { storeToRefs } from "pinia";
import GAlertDialogDemo from "~/components/demo/GAlertDialogDemo.vue";
import GAppHeaderDemo from "~/components/demo/GAppHeaderDemo.vue";
import GButtonDemo from "~/components/demo/GButtonDemo.vue";
import GPopoverDemo from "~/components/demo/GPopoverDemo.vue";
import GProgressDemo from "~/components/demo/GProgressDemo.vue";
import GSearchDemo from "~/components/demo/GSearchDemo.vue";
import GSelectDemo from "~/components/demo/GSelectDemo.vue";
import GSelectButtonDemo from "~/components/demo/GSelectButtonDemo.vue";
import GSidebarDemo from "~/components/demo/GSidebarDemo.vue";
import GSidebarMenuDemo from "~/components/demo/GSidebarMenuDemo.vue";
import GTextInputDemo from "~/components/demo/GTextInputDemo.vue";
import { onMounted, reactive, ref } from "vue";
import { useActiveLinkContent } from "@illinois-grad/grad-vue";
import { useTemplateRef } from "#imports";

const { activeId } = storeToRefs(useActiveLinkStore());

const demoComponents = [
    { label: "Alert Dialog", component: GAlertDialogDemo },
    { label: "App Header", component: GAppHeaderDemo },
    { label: "Button", component: GButtonDemo },
    { label: "Popover", component: GPopoverDemo },
    { label: "Progress", component: GProgressDemo },
    { label: "Search", component: GSearchDemo },
    { label: "Select", component: GSelectDemo },
    { label: "Select Button", component: GSelectButtonDemo },
    { label: "Sidebar", component: GSidebarDemo },
    { label: "Sidebar Menu", component: GSidebarMenuDemo },
    { label: "Text Input", component: GTextInputDemo },
];

const demo = useTemplateRef("demo");

onMounted(() => {
    useActiveLinkContent(demo as any, 0, activeId);
});
</script>

<template>
    <div class="app">
        <GSidebar class="sidebar" theme="light">
            <GSidebarMenu
                class="sidebar-menu"
                title="Components"
                theme="light"
                :items="
                    demoComponents.map((comp) => ({
                        label: comp.label,
                        href: '#' + comp.component.__name,
                    }))
                "
                v-model="activeId"
            ></GSidebarMenu>
        </GSidebar>
        <main class="app-main">
            <div class="demo-page">
                <div class="demo-page__intro">
                    <h1>
                        <img src="/grad-vue.svg" alt="grad-vue" width="350" />
                    </h1>
                    <p class="demo-page__description">
                        Vue.js 3 component library.
                    </p>
                    <p class="demo-page__description">
                        <a href="https://github.com/graduatecollege/grad-vue">
                            <img
                                src="/github-mark.svg"
                                alt="GitHub Repository"
                                width="32"
                            />
                        </a>
                    </p>
                </div>
                <h2>Introduction</h2>
                <p>
                    This is a demo application showcasing the components
                    available in the
                    <strong>grad-vue</strong> library. Use the sidebar to
                    navigate between different component demos.
                </p>
                <div class="demo" ref="demo">
                    <component
                        v-for="demo in demoComponents"
                        :is="demo.component"
                        :key="demo.label"
                        :id="demo.component.__name"
                    />
                </div>
            </div>
        </main>
    </div>
</template>

<style>
.app {
    min-height: 100vh;
    margin-left: 300px;
}

.app-main {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.demo-page {
    max-width: 1200px;
    margin: 0 auto;
}

.demo-page__intro {
    margin-bottom: 3rem;
}

.demo-page__intro h1 {
    margin: 2rem 0 0;
    text-align: center;
}

.demo-page__description {
    font-size: 1.125rem;
    line-height: 1.5;
    margin: 0 0 1rem;
    text-align: center;
}

.demo-section {
    margin-bottom: 4rem;
    scroll-margin-top: 2rem;
}

.demo-section__title {
    margin: 0 0 1.5rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e5e7eb;
    font-size: 1.875rem;
    color: #1f2937;
}

.sidebar {
    width: 300px;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
}

.sidebar-menu {
    margin-top: 2rem;
}
</style>
