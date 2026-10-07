import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { page, userEvent } from "vitest/browser";
import GTermSelector from "../packages/grad-vue/src/components/GTermSelector.vue";
import { mnt, testAccessibility } from "./test-utils";

describe("GTermSelector", () => {
    describe("Functional Tests", () => {
        it("updates its model when the internal term control changes", async () => {
            const term = ref({ year: "2026", name: "Spring" });

            mnt(GTermSelector, {
                props: {
                    termYears: ["2026", "2025"],
                },
                model: term,
            });

            await userEvent.click(page.getByRole("button", { name: /Spring 2026/ }));
            await userEvent.click(page.getByText("Summer", { exact: true }));

            expect(term.value).toEqual({ year: "2026", name: "Summer" });
        });
    });

    describe("Accessibility Tests", () => {
        it.each(["Period Selection", "Choose an academic term"])(
            "labels the open dialog with its heading: %s",
            async (heading) => {
                mnt(GTermSelector, {
                    props: heading === "Period Selection" ? {} : { heading },
                });

                const trigger = page.getByRole("button", { name: "Spring 2026" });
                await expect.element(trigger).toHaveAttribute("aria-haspopup", "dialog");
                await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
                await expect.element(trigger).not.toHaveAttribute("aria-controls");

                await trigger.click();

                const dialog = page.getByRole("dialog", { name: heading });
                await expect.element(dialog).toBeVisible();
                await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
                await expect.element(trigger).toHaveAttribute(
                    "aria-controls",
                    dialog.element().id,
                );
                await expect.element(dialog).toHaveAttribute(
                    "aria-labelledby",
                    page.getByRole("heading", { name: heading }).element().id,
                );
                await testAccessibility(dialog.element() as HTMLElement);

                await page.getByRole("button", { name: "Close popover" }).click();
                await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
                await expect.element(trigger).not.toHaveAttribute("aria-controls");
            },
        );

        it("passes accessibility tests with default content", async () => {
            await testAccessibility(
                GTermSelector,
                { label: "Term Selector" },
                { default: () => "<p>Example content</p>" },
            );
        });
    });
});
