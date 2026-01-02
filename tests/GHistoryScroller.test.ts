import { describe, expect, it } from "vitest";
import GHistoryScroller from "../src/components/GHistoryScroller.vue";
import { mnt, testAccessibility } from "./test-utils";
import { h } from "vue";
import { page, userEvent } from "vitest/browser";

async function createWrapper() {
    await page.viewport(420, 300);

    const { setProps, vm, app, instance, container } = mnt(GHistoryScroller, {
        slots: {
            default: (props: { entry: { id: string } }) =>
                h("div", {
                    style: { height: "40px" },
                    "data-testid": `entry-${props.entry.id}`,
                    innerHTML: `Entry ${props.entry.id} <button>Focusable Element</button>`,
                }),
        },
        props: {
            entries: [
                { id: "twelve" },
                { id: "eleven" },
                { id: "ten" },
                { id: "nine" },
                { id: "eight" },
                { id: "seven" },
                { id: "six" },
                { id: "five" },
                { id: "four" },
                { id: "three" },
                { id: "two" },
                { id: "one" },
            ],
            label: "History",
        },
    });
    container.style.height = "300px";
    instance.element().style.height = "300px";

    return { setProps, vm, app, instance, container };
}

describe("GHistoryScroller", () => {
    describe("Functional Tests", () => {
        it("should start scrolled to the bottom", async () => {
            const { vm } = await createWrapper();
            await vm.$nextTick();
            // Need some time for potential layouts or just ensuring it's mounted and scrolled
            await new Promise((resolve) => setTimeout(resolve, 50));

            const roleLog = page.getByRole("log").element();

            // 12 * 40 for the entries, 11 * 16 for the padding between entries and 2 * 16 more for the scroller padding
            // This may be a bit fragile, but using the scroll values from the elements might cause false positives
            const expectHeight = 12 * 40 + 13 * 16;
            expect(roleLog.scrollTop).toBeGreaterThan(0);
            expect(roleLog.scrollTop).toBe(expectHeight - 300);
        });

        it("should focus jump-to-bottom before list elements", async () => {
            const { vm, instance, container } = await createWrapper();
            await vm.$nextTick();
            document.body.focus();

            await userEvent.keyboard("{Tab}");

            await expect
                .element(instance.getByLabelText("Jump to Latest"))
                .toHaveFocus();
        });
    });

    describe("Accessibility Tests", () => {
        it("with default content", async () => {
            const { container } = await createWrapper();

            await testAccessibility(container);
        });
    });
});
