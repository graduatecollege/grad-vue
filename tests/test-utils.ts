import axe from "axe-core";
import { Component, createApp, h, reactive, Ref, watch } from "vue";
import { Locator, page, userEvent } from "vitest/browser";
import { mounts } from "./setup";
import { vi } from "vitest";
import { generateText } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import { ListKit } from "@tiptap/extension-list";

/**
 * Renders TipTap JSON model to plain text using the standard extensions
 * 
 * @param content - The TipTap JSON content to render
 * @returns The plain text representation of the content
 */
export function renderTipTapText(content: any): string {
    const extensions = [Document, Paragraph, Text, Bold, Italic, ListKit];
    return generateText(content, extensions);
}

/**
 * Run accessibility tests on a component using axe-core
 *
 * @param component The Vue component or HTMLElement to test
 * @param props Optional props to pass to the component
 * @param slots Optional slots to pass to the component
 * @param teleport Optional flag to enable teleport stubbing
 */
export async function testAccessibility(
    component: Component | HTMLElement,
    props?: Record<string, any>,
    slots?: Record<string, any>,
    teleport?: boolean,
): Promise<void> {
    let el: HTMLElement;
    let wrapper: ReturnType<typeof mnt> | null = null;
    if (component instanceof HTMLElement) {
        el = component;
    } else {
        wrapper = mnt(component, {
            props,
            slots,
            teleport,
        });
        el = wrapper.container.element() as HTMLElement;
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
            `Accessibility violations found:\n\n${violationMessages.join("\n\n")}`,
        );
    }

    if (wrapper) {
        //
    }
}

/**
 * Mount a Vue component into Playwright.
 *
 * @param component - The Vue component to mount.
 * @param options - Mounting options.
 * @param options.props - Props to pass to the component.
 * @param options.slots - Slots to pass to the component. These should be calls to `h` render functions.
 * @param options.teleport - Whether the component under testing is teleporting its content.
 * @param options.model - Model ref for the component.
 */
export function mnt(
    component: Component,
    options?: {
        props?: Record<string, any>;
        slots?: Record<string, any>;
        teleport?: boolean;
        model?: Ref<any>;
    },
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

    function setProps(newProps: Record<string, any>) {
        Object.assign(state.props, newProps);
    }

    const model = options?.model;

    if (model) {
        state.props["modelValue"] = model;
        state.props["onUpdate:modelValue"] = (value: any) => {
            model.value = value;
        };
        watch(model, (value) => {
            setProps({ modelValue: value });
        });
    }

    const app = createApp({
        render() {
            return h(component, state.props, options?.slots);
        },
    });

    const vm = app.mount(container);

    let instance: Locator;

    if (options?.teleport) {
        instance = page.elementLocator(
            document.body.querySelector("#modal-root")!
                .children[0] as HTMLElement,
        );
    } else {
        instance = page.elementLocator(container.children[0] as HTMLElement);
    }

    const unmount = () => {
        app.unmount();
        container.remove();
        modalRoot.remove();
    };

    mounts.push(unmount);

    return {
        app,
        vm,
        container: page.elementLocator(container),
        instance,
        state,
        setProps,
    };
}

/**
 * Tabs through elements until the currently active element matches the specified text.
 *
 * @param {string} text - The text to match against the active element's visible content, aria-label, or aria-labelledby.
 * @return {Promise<void>} A promise that resolves when an element with the specified text becomes active.
 */
export async function tabTo(text: string) {
    await vi.waitUntil(
        async () => {
            const el = document.activeElement;
            if (!el) {
                return false;
            }
            let textContent = el.textContent;
            if (el.ariaLabel) {
                textContent = el.ariaLabel;
            }
            if (el.ariaLabelledByElements?.length) {
                textContent = el.ariaLabelledByElements[0].textContent;
            }
            if (textContent === text) {
                return true;
            }
            await userEvent.keyboard("{Tab}");
        },
        {
            interval: 1,
        },
    );
}
