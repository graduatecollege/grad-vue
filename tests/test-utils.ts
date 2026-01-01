import { mount, RouterLinkStub, VueWrapper } from "@vue/test-utils";
import axe from "axe-core";
import { Component, createApp, h, reactive } from "vue";
import { Locator, page } from "vitest/browser";
import GradVue from "../src/grad-vue";
import VGtooltip from "../src/directives/v-gtooltip";

/**
 * Run accessibility tests on a component using axe-core
 * @param component The Vue component or HTMLElement to test
 * @param props Optional props to pass to the component
 * @param slots Optional slots to pass to the component
 * @param teleport Optional flag to enable teleport stubbing
 */
export async function testAccessibility(
    component: Component | HTMLElement,
    props?: Record<string, any>,
    slots?: Record<string, any>,
    teleport?: boolean
): Promise<void> {
    let el: HTMLElement;
    let wrapper: VueWrapper | null = null;
    if (component instanceof HTMLElement) {
        el = component;
    } else {
        wrapper = mount(component, {
            props,
            slots,
            attachTo: document.body,
            global: {
                stubs: {
                    RouterLink: RouterLinkStub,
                    teleport: teleport ?? false,
                },
            },
        });
        el = wrapper.element;
    }

    const results = await axe.run(el);

    // Check for violations
    if (results.violations.length > 0) {
        const violationMessages = results.violations.map((violation) => {
            const nodeMessages = violation.nodes
                .map((node) => {
                    return `  - ${node.html}\n    ${node.failureSummary}`;
                })
                .join("\n");

            return `[${violation.id}] ${violation.description}\nHelp: ${violation.helpUrl}\nImpact: ${violation.impact}\nAffected nodes:\n${nodeMessages}`;
        });

        throw new Error(
            `Accessibility violations found:\n\n${violationMessages.join("\n\n")}`
        );
    }

    if (wrapper) {
        wrapper.unmount();
    }
}

/**
 * Pure Vue app creation and mounting without @vue/test-utils
 */
export function mnt(
    component: Component,
    options?: {
        props?: Record<string, any>;
        slots?: Record<string, any>;
        teleport?: boolean;
    }
) {
    const id = Math.random().toString(36).substring(2, 9);
    const container = document.createElement("div");
    container.setAttribute("data-testid", `component-${id}`);
    document.body.appendChild(container);

    const modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);

    const state = reactive({
        props: options?.props || {},
    });

    const app = createApp({
        render() {
            return h(component, state.props, options?.slots);
        },
    });

    const vm = app.mount(container);

    let instance: Locator;

    if (options?.teleport) {
        instance = page.elementLocator(document.body.querySelector("#modal-root")!.children[0] as HTMLElement);
    } else {
        instance = page.elementLocator(container.children[0] as HTMLElement);
    }

    return {
        app,
        vm,
        container,
        instance,
        state,
        setProps(newProps: Record<string, any>) {
            Object.assign(state.props, newProps);
        },
        unmount() {
            app.unmount();
            container.remove();
            modalRoot.remove();
        },
    };
}
