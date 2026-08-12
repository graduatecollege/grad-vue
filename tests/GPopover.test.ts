import { describe, expect, it } from "vitest";
import GPopover from "../packages/grad-vue/src/components/GPopover.vue";
import GModal from "../packages/grad-vue/src/components/GModal.vue";
import GTermSelector from "../packages/grad-vue/src/components/GTermSelector.vue";
import { mnt, testAccessibility } from "./test-utils";
import { h } from "vue";
import { page } from "vitest/browser";

function defaultWrapper(content: () => any = () => "Popover content") {
    return mnt(GPopover, {
        slots: {
            trigger: (props: { toggle: () => void }) =>
                h("button", { onClick: props.toggle }, "Open"),
            default: content,
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

            await expect.element(page.getByRole("dialog")).toBeInView();

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
                    default: () => h("div", { style: { height: "400px" } }, [
                        "Popover content",
                    ]),
                },
            });
            await wrapper.vm.$nextTick();
            await page.getByRole("button", { name: "Open" }).click();
            await wrapper.vm.$nextTick();

            await expect
                .element(page.getByRole("dialog"))
                .toBeInView();

            content.remove();
        });

        it("scrolls its contents when taller than the viewport", async () => {
            await page.viewport(420, 320);

            const wrapper = defaultWrapper(() =>
                h("div", { style: { height: "700px" } }, "Popover content"),
            );

            await page.getByRole("button", { name: "Open" }).click();
            await wrapper.vm.$nextTick();

            const dialog = page.getByRole("dialog");
            await expect.element(dialog).toBeInView();

            expect(window.getComputedStyle(dialog.element()).overflowY).toBe(
                "auto",
            );
            expect(dialog.element().scrollHeight).toBeGreaterThan(
                dialog.element().clientHeight,
            );
        });

        it("allows nested dropdowns to overflow when the popover fits", async () => {
            await page.viewport(900, 700);

            mnt(GTermSelector, {
                props: {
                    termYears: [
                        "2020",
                        "2021",
                        "2022",
                        "2023",
                        "2024",
                        "2025",
                        "2026",
                        "2027",
                        "2028",
                        "2029",
                    ],
                },
            });

            await page.getByRole("button", { name: /Spring 2026/i }).click();

            const dialog = page.getByRole("dialog");
            await expect.element(dialog).toBeVisible();

            expect(window.getComputedStyle(dialog.element()).overflowY).toBe(
                "visible",
            );

            await page.getByRole("combobox", { name: "Select Year" }).click();

            const listbox = page.getByRole("listbox");
            await expect.element(listbox).toBeVisible();

            const popoverRect = dialog.element().getBoundingClientRect();
            const listboxRect = listbox.element().getBoundingClientRect();
            const sampleX = listboxRect.left + Math.min(16, listboxRect.width / 2);
            const sampleY = popoverRect.bottom + 8;

            expect(listboxRect.bottom).toBeGreaterThan(sampleY);
            expect(
                document.elementFromPoint(sampleX, sampleY)?.closest(
                    '[role="listbox"]',
                ),
            ).not.toBeNull();
        });

        it("remains in viewport when inside a modal", async () => {
            mnt(GModal, {
                props: { label: "Test Modal" },
                slots: {
                    default: () =>
                        h(GPopover, null, {
                            trigger: ({ toggle }: { toggle: () => void }) =>
                                h(
                                    "button",
                                    { onClick: toggle },
                                    "Open Popover",
                                ),
                            default: () => "Popover content",
                        }),
                },
                teleport: true,
            });

            await page.getByRole("button", { name: "Open Popover" }).click();

            await expect
                .element(page.getByRole("dialog", { name: "Open Popover" }))
                .toBeInView();
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
