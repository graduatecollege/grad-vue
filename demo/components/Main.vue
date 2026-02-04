<script setup lang="ts">
import {
    GSidebar,
    GSidebarMenu,
    useActiveLinkContent,
    useOverlayStackState,
    useSidebar,
} from "@graduatecollege/grad-vue";
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
import GClipboardDemo from "~/components/demo/GClipboardDemo.vue";
import GHistoryScrollerDemo from "~/components/demo/GHistoryScrollerDemo.vue";
import GThreeWayToggleDemo from "~/components/demo/GThreeWayToggleDemo.vue";
import GTableDemo from "~/components/demo/GTableDemo.vue";
import GModalDemo from "~/components/demo/GModalDemo.vue";
import GHamburgerMenuDemo from "~/components/demo/GHamburgerMenuDemo.vue";
import GDetailListDemo from "~/components/demo/GDetailListDemo.vue";
import { onMounted, provide } from "vue";
import { useTemplateRef } from "#imports";

const sidebar = useSidebar();
provide("sidebar", sidebar);

const { activeId } = storeToRefs(useActiveLinkStore());

const slugify = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

const demoComponents = [
    { label: "Alert Dialog", component: GAlertDialogDemo },
    { label: "App Header", component: GAppHeaderDemo },
    { label: "Button", component: GButtonDemo },
    { label: "Clipboard", component: GClipboardDemo },
    { label: "Detail List", component: GDetailListDemo },
    { label: "Hamburger Menu", component: GHamburgerMenuDemo },
    { label: "History Scroller", component: GHistoryScrollerDemo },
    { label: "Modal", component: GModalDemo },
    { label: "Popover", component: GPopoverDemo },
    { label: "Progress", component: GProgressDemo },
    { label: "Search", component: GSearchDemo },
    { label: "Select", component: GSelectDemo },
    { label: "Select Button", component: GSelectButtonDemo },
    { label: "Sidebar", component: GSidebarDemo },
    { label: "Sidebar Menu", component: GSidebarMenuDemo },
    { label: "Table", component: GTableDemo },
    { label: "Text Input", component: GTextInputDemo },
    { label: "Three Way Toggle", component: GThreeWayToggleDemo },
];

const demo = useTemplateRef("demo");

onMounted(() => {
    useActiveLinkContent(demo as any, 0, activeId);
});
</script>

<template>
    <div
        class="app"
        :class="{
            'sidebar-collapsible': sidebar?.isCollapsible?.value,
        }"
    >
        <div class="sidebar-toggle">
            <GHamburgerMenu />
        </div>
        <GSidebar class="sidebar" top-offset="0px">
            <GSidebarMenu
                class="sidebar-menu"
                title="Components"
                theme="dark"
                compact
                :items="
                    demoComponents.map((comp) => ({
                        label: comp.label,
                        href: '#' + slugify(comp.label),
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
                        Vue.js 3 / Nuxt 4 component library.
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
                    <h2>Introduction</h2>
                    <p>
                        This is a demo application showcasing the components
                        available in the
                        <strong>grad-vue</strong> library.
                    </p>

                    <h3>Installation</h3>
                    <p>To install grad-vue, use npm:</p>
                    <pre><code>npm install @graduatecollege/grad-vue</code></pre>
                    <h3>More Information</h3>
                    <p>
                        More details about the library can be found in the
                        <a href="https://github.com/graduatecollege/grad-vue"
                            >GitHub repository</a
                        >.
                    </p>
                    <p>
                        MIT License <br />
                        Copyright &copy; 2025 University of Illinois Board of
                        Trustees
                    </p>
                    <p>Other copyrights and licenses in embedded content:</p>
                    <ul>
                        <li>
                            FontAwesome Free icons
                            <a href="https://fontawesome.com/license/free"
                                >https://fontawesome.com/license/free</a
                            >
                            Creative Commons BY 4.0
                        </li>
                        <li>
                            Tabler Icons
                            <a href="https://tabler.io/license"
                                >https://tabler.io/license</a
                            >
                            MIT
                        </li>
                    </ul>
                </div>
                <div class="demo" ref="demo">
                    <component
                        v-for="demo in demoComponents"
                        :is="demo.component"
                        :key="demo.label"
                    />
                </div>
            </div>
        </main>
        <GOverlay />
    </div>
</template>

<style>
.app {
    min-height: 100vh;
    margin-left: 300px;
}

.app.sidebar-collapsible {
    margin-left: 0;
}

.sidebar-toggle {
    position: fixed;
    /*noinspection CssUnresolvedCustomProperty*/
    right: calc(20px + var(--g-scrollbar-width, 0px));
    top: 20px;
    z-index: 100;
}

.app-main {
    padding: 2rem;
    max-width: 1400px;
    margin: var(--g-toolbar-height) auto 0;
}

.demo-page {
    max-width: 1200px;
    margin: 0 auto;
}

.demo-page__intro {
    margin-bottom: 3rem;
    font-size: 1.25rem;

    p {
        font-size: 1.125rem;
        line-height: 1.666;
    }

    ul {
        font-size: 1.125rem;
        line-height: 1.666;
    }
}

.demo-page__intro h1 {
    margin: 2rem 0 0;
    text-align: center;
}

.demo-page__description {
    text-align: center;
}

.demo-section {
    margin-bottom: 4rem;
    scroll-margin-top: 2rem;
}

.demo-section__title {
    margin: 0 0 1.5rem 0;
    padding-bottom: 0.5rem;
    font-size: 1.875rem;
    color: var(--il-blue);
}

.sidebar {
    width: 300px;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
}

.markdown-alert {
    padding: 0 1em;
    margin-bottom: 16px;
    color: inherit;
    border-left: 0.25em solid var(--il-storm-30);

    p {
        margin-top: 0;
    }
}

.markdown-alert-title {
    display: inline-flex;
    align-items: center;
    font-weight: 700;
    margin: 0;
    font-size: 1.125rem;

    path {
        fill: currentColor;
    }

    svg {
        margin-right: 0.5em;
    }
}

.markdown-alert-note {
    border-left-color: var(--il-industrial);

    > .markdown-alert-title {
        color: var(--il-industrial);
    }
}

.markdown-alert-tip {
    border-left-color: #014020;

    > .markdown-alert-title {
        color: #014020;
    }
}

.markdown-alert-important {
    border-left-color: var(--il-berry);

    > .markdown-alert-title {
        color: var(--il-berry);
    }
}

.markdown-alert-warning {
    border-left-color: #956c18;

    > .markdown-alert-title {
        color: #956c18;
    }
}

.markdown-alert-caution {
    border-left-color: var(--il-altgeld);

    > .markdown-alert-title {
        color: var(--il-altgeld);
    }
}

.component-demo__docs {
    line-height: 1.5;
    code:not(.shiki *) {
        color: #7c3400;
        background: #f6efed;
        border-radius: 5px;
        padding: 0 0.25rem;
    }
}

.highlighted-code {
    padding: 0;
    margin: 0;
}
pre.shiki {
    position: relative;
    padding: 1rem 0;
    background: transparent;
    border-radius: 0.5rem;
    border: 1px solid var(--il-storm-80);
    font-size: 1rem;
}

pre.shiki code {
    display: block;
    padding: 0 1.5rem;
    transition: color 0.5s;
}
</style>
