import { describe, expect, it } from "vitest";
import { h } from "vue";
import { page } from "vitest/browser";
import GMain from "../packages/grad-vue/src/components/GMain.vue";
import { mnt, testAccessibility } from "./test-utils";

describe("GMain", () => {
    it("renders a main landmark that isn't focusable by default", async () => {
        mnt(GMain, { slots: { default: () => h("h1", "Profile") } });

        const main = page.getByRole("main");
        await expect.element(main).toHaveAttribute("id", "main-content");
        await expect.element(main).not.toHaveAttribute("tabindex");
    });

    it("uses a custom id", async () => {
        mnt(GMain, { props: { id: "content" } });

        await expect
            .element(page.getByRole("main"))
            .toHaveAttribute("id", "content");
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with default content", async () => {
            await testAccessibility(
                GMain,
                {},
                { default: () => h("h1", "Example content") },
            );
        });
    });
});
