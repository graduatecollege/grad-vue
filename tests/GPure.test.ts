import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import GProgress from "../src/components/GProgress.vue";
import { mnt } from "./test-utils";

describe("GProgress (Pure Vitest + Playwright)", () => {
    it("renders correctly without @vue/test-utils", async () => {
        const wrapper = mnt(GProgress, {
            props: {
                value: 50,
                ariaLabel: "Loading progress",
            },
        });

        const progress = page.getByRole("progressbar");
        await expect.element(progress).toBeVisible();
        await expect.element(progress).toHaveAttribute("aria-valuenow", "50");
        await expect.element(progress).toHaveAttribute("aria-label", "Loading progress");

        wrapper.unmount();
    });

    it("updates when props change", async () => {
        const {setProps, unmount, vm} = mnt(GProgress, {
            props: { value: 30 },
        });

        const progress = page.getByRole("progressbar");
        await expect.element(progress).toHaveAttribute("aria-valuenow", "30");

        // Update value
        setProps({ value: 75 });

        await expect.element(progress).toHaveAttribute("aria-valuenow", "75");

        unmount();
    });
});
