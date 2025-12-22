import { mount, VueWrapper } from "@vue/test-utils";
import { toBeAccessible } from "@sa11y/vitest";
import { Component } from "vue";

/**
 * Run accessibility tests on a component
 * @param component The Vue component to test
 * @param props Optional props to pass to the component
 * @param slots Optional slots to pass to the component
 */
export async function testAccessibility(
    component: Component,
    props?: Record<string, any>,
    slots?: Record<string, any>
): Promise<void> {
    const wrapper = mount(component, {
        props,
        slots,
        attachTo: document.body,
    });

    // Use @sa11y/vitest matcher directly
    const result = await toBeAccessible(wrapper.element as HTMLElement);
    if (!result.pass) {
        throw new Error(result.message());
    }

    wrapper.unmount();
}

/**
 * Create a wrapper for a component with common options
 * @param component The Vue component to mount
 * @param options Mount options
 */
export function createWrapper(
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
    });
}
