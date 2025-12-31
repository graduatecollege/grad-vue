import { describe, expect, it } from "vitest";
import GClipboard from "../src/components/GClipboard.vue";
import { mnt, testAccessibility } from "./test-utils";
import { page, userEvent } from "vitest/browser";

describe("GClipboard", () => {
    describe("Accessibility Tests", () => {
        it("passes accessibility tests with basic content", async () => {
            await testAccessibility(
                GClipboard,
                { label: "Clipboard", text: "Example text" },
            );
        });
        it("passes accessibility tests with focus", async () => {
            const { container, instance, unmount, vm} = mnt(GClipboard, {
                props: { label: "Clipboard", text: "Example text" },
            });

            await userEvent.keyboard("{Tab}");

            await testAccessibility(container);

            unmount();
        });
        it("should have aria description", async () =>{
            const { container, instance, unmount, vm} = mnt(GClipboard, {
                props: { label: "Clipboard", text: "Example text" },
            });

            await userEvent.keyboard("{Tab}");

            await expect.element(page.getByLabelText("Copy")).toHaveAccessibleDescription("Copy to clipboard");
        });
        it("after click should update aria description", async () =>{
            const { container, instance, unmount, vm} = mnt(GClipboard, {
                props: { label: "Clipboard", text: "Example text" },
            });

            await page.getByLabelText("Copy").click();
            await vm.$nextTick();

            // This doesn't use expect.element because Playwright seems to
            // make the button lose focus and thus it resets the text after.
            // Without .element the check is immediate, whereas .element waits for a match.
            await expect(page.getByLabelText("Copy")).toHaveAccessibleDescription("Copied");
        });
    });
});
