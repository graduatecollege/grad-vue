import { mount, RouterLinkStub, VueWrapper } from "@vue/test-utils";
import axe from "axe-core";
import { Component } from "vue";

/**
 * Run accessibility tests on a component using axe-core
 * @param component The Vue component to test
 * @param props Optional props to pass to the component
 * @param slots Optional slots to pass to the component
 */
export async function testAccessibility(
    component: Component,
    props?: Record<string, any>,
    slots?: Record<string, any>
): Promise<void> {
    const wrapper = mnt(component, {
        props,
        slots
    });

    const results = await axe.run(wrapper.element);

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
}

/**
 * Create a wrapper for a component with common options
 * @param component The Vue component to mount
 * @param options Mount options
 */
export function mnt(
    component: Component,
    options?: {
        props?: Record<string, any>;
        slots?: Record<string, any>;
        attachTo?: HTMLElement;
    }
): VueWrapper {
    return mount(component, {
        props: options?.props,
        slots: options?.slots,
        attachTo: options?.attachTo || document.body,
        global: {
            stubs: {
                RouterLink: RouterLinkStub
            }
        }
    });
}
