import { afterEach, beforeEach, describe, expect, it } from "vitest";
import GAlertDialog from "../src/components/GAlertDialog.vue";
import { mnt, testAccessibility } from "./test-utils";
import { mount } from "@vue/test-utils";
import { page } from "vitest/browser";

beforeEach(() => {
    // create teleport target
    const el = document.createElement("div");
    el.id = "modal-root";
    document.body.appendChild(el);
});

afterEach(() => {
    // clean up
    document.body.innerHTML = "";
});

describe("GAlertDialog", () => {
    describe("Functional Tests", () => {
        it("renders with default props", () => {
            const wrapper = mount(GAlertDialog, {
                attachTo: document.body,
                global: {
                    stubs: {
                        teleport: true,
                    },
                },
            });

            expect(wrapper.exists()).toBe(true);
        });
        it("renders with custom label", () => {
            const wrapper = mount(GAlertDialog, {
                attachTo: document.body,
                global: {
                    stubs: {
                        teleport: true,
                    },
                },
                props: {
                    label: "Hello Alert",
                },
            });
            expect(wrapper.find("h2").text()).toBe("Hello Alert");
        });
        it("is visible when opened in a scrolled container", async (ctx) => {
            await page.viewport(420, 500);

            // Create a scrollable container
            const scrollContainer = document.createElement("div");
            scrollContainer.style.height = "500px";
            scrollContainer.style.overflow = "auto";
            document.body.appendChild(scrollContainer);

            // Add content to enable scrolling
            const content = document.createElement("div");
            content.style.height = "1500px";
            scrollContainer.appendChild(content);

            // Mount the GAlertDialog inside the scrollable container
            const wrapper = mount(GAlertDialog, {
                attachTo: scrollContainer,
                global: {
                    stubs: {
                        teleport: true,
                    },
                },
                props: {
                    modelValue: true, // Open the dialog
                },
            });

            scrollContainer.scrollTop = 600;

            await wrapper.vm.$nextTick();

            const dialog = wrapper.find("[role=alertdialog]");
            await expect(dialog.element).toBeInViewport();
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with default props", async () => {
            const wrapper = mnt(GAlertDialog, { teleport: true });

            await testAccessibility(
                wrapper.element,
                {},
                { default: "Alert message" },
            );
        });

        it("label should match accessible name", async () => {
            const wrapper = mnt(GAlertDialog, { teleport: true, slots: { default: "Are you sure?"} });
            const label = wrapper.find("[role=alertdialog]");
            expect(label.element).toHaveAccessibleName("Confirmation");
        });

        it("description should match content", async () => {
            const wrapper = mnt(GAlertDialog, { teleport: true, slots: { default: "Are you sure?"} });
            const description = wrapper.find("[role=alertdialog]");
            expect(description.element).toHaveAccessibleDescription("Are you sure?");
        });
    });
});
