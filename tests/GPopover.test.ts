import { describe, expect, it } from "vitest";
import GPopover from "../src/components/GPopover.vue";
import { mnt, testAccessibility } from "./test-utils";
import { h } from "vue";
import { page } from "vitest/browser";

function defaultWrapper() {
    return mnt(GPopover, {
        slots: {
            trigger: (props: { toggle: () => void }) =>
                h("button", { onClick: props.toggle }, "Open"),
            default: () => "Popover content",
        },
    });
}

describe("GPopover", () => {
    describe("Functional Tests", () => {
        it("renders with required props", async () => {
            const { instance } = defaultWrapper();

            await expect.element(instance).toBeVisible();
        });

        it("remains in viewport when on the bottom", async (ctx) => {
            await page.viewport(420, 500);

            const content = document.createElement("div");
            content.style.height = "450px";
            document.body.appendChild(content);

            const wrapper = defaultWrapper();
            await page.getByRole("button", { name: "Open" }).click();
            await wrapper.vm.$nextTick();

            await expect.element(page.getByRole("dialog")).toBeInViewport({
                ratio: 1,
            });

            content.remove();
        });

        it("remains in viewport when large", async (ctx) => {
            await page.viewport(420, 500);

            const content = document.createElement("div");
            content.style.height = "150px";
            document.body.appendChild(content);

            const wrapper = mnt(GPopover, {
                slots: {
                    trigger: (props: { toggle: () => void }) =>
                        h("button", { onClick: props.toggle }, "Open"),
                    content: () =>
                        "<h2>Popover content</h2><p style='margin-top: 250px'>Popover content</p>",
                },
            });
            await wrapper.vm.$nextTick();
            await page.getByRole("button", { name: "Open" }).click();
            await wrapper.vm.$nextTick();

            await expect
                .element(page.getByRole("dialog"))
                .toBeInViewport({ ratio: 1 });

            content.remove();
        });
    });

    describe("Accessibility Tests", () => {
        it("when open", async () => {
            const wrapper = defaultWrapper();

            await page.getByRole("button", { name: "Open" }).click();

            await testAccessibility(
                wrapper.container.element(),
                {
                    label: "Additional information",
                },
                {
                    trigger: "<button>Open</button>",
                    default: "Popover content",
                },
            );
        });
    });
});
