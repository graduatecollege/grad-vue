import { describe, expect, it } from "vitest";
import GClipboard from "../packages/grad-vue/src/components/GClipboard.vue";
import { mnt, testAccessibility } from "./test-utils";
import { page, userEvent } from "vitest/browser";

describe("GClipboard", () => {
    describe("Accessibility Tests", () => {
        it("with basic content", async () => {
            await testAccessibility(GClipboard, {
                label: "Clipboard",
                text: "Example text",
            });
        });
        it("with focus", async () => {
            const { container } = mnt(GClipboard, {
                props: { label: "Clipboard", text: "Example text" },
            });

            await userEvent.keyboard("{Tab}");

            // CSS animation can cause issue with axe-core's ability to detect color contrast
            await new Promise((resolve) => setTimeout(resolve, 150));

            await testAccessibility(container.element());
        });
        it("should have aria description", async () => {
            mnt(GClipboard, {
                props: { label: "Clipboard", text: "Example text" },
            });

            await userEvent.keyboard("{Tab}");

            await expect
                .element(page.getByLabelText("Copy"))
                .toHaveAccessibleDescription("Copy to clipboard");
        });
        it("after click should update aria description", async () => {
            const { vm } = mnt(GClipboard, {
                props: { label: "Clipboard", text: "Example text" },
            });

            await vm.$nextTick();

            // Focus can be flaky, so start waiting first and then click
            let promise = expect.element(
                page.getByLabelText("Copy"),
            ).toHaveAccessibleDescription("Copied");

            await page.getByLabelText("Copy").click();
            await promise;
        });
    });
});
