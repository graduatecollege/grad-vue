import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("/wc-test.html");
    // Disable CSS transitions and animations for deterministic tests,
    // consistent with the setup in tests/setup.ts for vitest.
    await page.addStyleTag({
        content: "*, *::before, *::after { transition: none !important; animation: none !important; }",
    });
    // Wait for the web components to be defined and rendered
    await page.waitForFunction(() => customElements.get("g-modal") !== undefined);
});

// ─── Modal ────────────────────────────────────────────────────────────────────

test.describe("g-modal", () => {
    test("is hidden on page load", async ({ page }) => {
        await expect(page.getByRole("dialog", { name: "Danger Modal" })).not.toBeVisible();
    });

    test("opens when trigger button is clicked", async ({ page }) => {
        await page.getByRole("button", { name: "Danger Modal" }).click();
        await expect(page.getByRole("dialog", { name: "Danger Modal" })).toBeVisible();
    });

    test("shows heading with the modal label", async ({ page }) => {
        await page.getByRole("button", { name: "Danger Modal" }).click();
        await expect(page.getByRole("heading", { name: "Danger Modal" })).toBeVisible();
    });

    test("is positioned in the viewport with fixed layout", async ({ page }) => {
        await page.getByRole("button", { name: "Danger Modal" }).click();
        const dialog = page.getByRole("dialog", { name: "Danger Modal" });
        await expect(dialog).toBeInViewport({ ratio: 0.95 });

        const position = await dialog.evaluate((el) => getComputedStyle(el).position);
        expect(position).toBe("fixed");
    });

    test("closes when the close button is clicked", async ({ page }) => {
        await page.getByRole("button", { name: "Danger Modal" }).click();
        await expect(page.getByRole("dialog", { name: "Danger Modal" })).toBeVisible();

        await page.getByRole("button", { name: "Close" }).click();
        await expect(page.getByRole("dialog", { name: "Danger Modal" })).not.toBeVisible();
    });

    test("closes when the Escape key is pressed", async ({ page }) => {
        await page.getByRole("button", { name: "Danger Modal" }).click();
        await expect(page.getByRole("dialog", { name: "Danger Modal" })).toBeVisible();

        await page.keyboard.press("Escape");
        await expect(page.getByRole("dialog", { name: "Danger Modal" })).not.toBeVisible();
    });

    test("focuses the modal heading when opened", async ({ page }) => {
        await page.getByRole("button", { name: "Danger Modal" }).click();
        const heading = page.getByRole("heading", { name: "Danger Modal" });
        await expect(heading).toBeFocused();
    });

    test.describe("nested modals", () => {
        test.beforeEach(async ({ page }) => {
            await page.getByRole("button", { name: "Danger Modal" }).click();
            await expect(page.getByRole("dialog", { name: "Danger Modal" })).toBeVisible();
            await page.getByRole("button", { name: "Open Another Modal" }).click();
            await expect(page.getByRole("dialog", { name: "Another Modal" })).toBeVisible();
        });

        test("both modals are visible simultaneously", async ({ page }) => {
            await expect(page.getByRole("dialog", { name: "Danger Modal" })).toBeVisible();
            await expect(page.getByRole("dialog", { name: "Another Modal" })).toBeVisible();
        });

        test("second modal has a higher z-index than the first", async ({ page }) => {
            const firstZ = await page
                .getByRole("dialog", { name: "Danger Modal" })
                .evaluate((el) => Number(getComputedStyle(el).zIndex));
            const secondZ = await page
                .getByRole("dialog", { name: "Another Modal" })
                .evaluate((el) => Number(getComputedStyle(el).zIndex));
            expect(secondZ).toBeGreaterThan(firstZ);
        });

        test("both modals are in the viewport", async ({ page }) => {
            await expect(page.getByRole("dialog", { name: "Danger Modal" })).toBeInViewport({ ratio: 0.95 });
            await expect(page.getByRole("dialog", { name: "Another Modal" })).toBeInViewport({ ratio: 0.95 });
        });

        test("closing the nested modal leaves the first modal open", async ({ page }) => {
            // Close button closes the topmost modal only
            await page.getByRole("button", { name: "Close" }).last().click();
            await expect(page.getByRole("dialog", { name: "Another Modal" })).not.toBeVisible();
            await expect(page.getByRole("dialog", { name: "Danger Modal" })).toBeVisible();
        });

        test("Escape closes only the top modal", async ({ page }) => {
            await page.keyboard.press("Escape");
            await expect(page.getByRole("dialog", { name: "Another Modal" })).not.toBeVisible();
            await expect(page.getByRole("dialog", { name: "Danger Modal" })).toBeVisible();
        });
    });
});

// ─── Popover ──────────────────────────────────────────────────────────────────

test.describe("g-popover", () => {
    test("is hidden on page load", async ({ page }) => {
        await expect(page.getByRole("dialog", { name: "Open Popover" })).not.toBeVisible();
    });

    test("opens when trigger button is clicked", async ({ page }) => {
        await page.getByRole("button", { name: "Open Popover" }).click();
        await expect(page.getByRole("dialog", { name: "Open Popover" })).toBeVisible();
    });

    test("is positioned in the viewport with fixed layout", async ({ page }) => {
        await page.getByRole("button", { name: "Open Popover" }).click();
        const popover = page.getByRole("dialog", { name: "Open Popover" });
        await expect(popover).toBeInViewport({ ratio: 0.95 });

        const position = await popover.evaluate((el) => getComputedStyle(el).position);
        expect(position).toBe("fixed");
    });

    test("is positioned near the trigger button (not at origin)", async ({ page }) => {
        const button = page.getByRole("button", { name: "Open Popover" });
        const buttonBox = await button.boundingBox();

        await button.click();
        const popover = page.getByRole("dialog", { name: "Open Popover" });
        const popoverBox = await popover.boundingBox();

        expect(popoverBox).not.toBeNull();
        expect(buttonBox).not.toBeNull();

        // The popover should be within 300px of the trigger button horizontally
        const hDist = Math.abs((popoverBox!.x + popoverBox!.width / 2) - (buttonBox!.x + buttonBox!.width / 2));
        expect(hDist).toBeLessThan(300);

        // The popover should not be stuck at the page origin (0,0)
        expect(popoverBox!.x + popoverBox!.y).toBeGreaterThan(0);
    });

    test("closes when the close button is clicked", async ({ page }) => {
        await page.getByRole("button", { name: "Open Popover" }).click();
        await expect(page.getByRole("dialog", { name: "Open Popover" })).toBeVisible();

        await page.getByRole("button", { name: "Close popover" }).click();
        await expect(page.getByRole("dialog", { name: "Open Popover" })).not.toBeVisible();
    });

    test("closes when the Escape key is pressed", async ({ page }) => {
        await page.getByRole("button", { name: "Open Popover" }).click();
        await expect(page.getByRole("dialog", { name: "Open Popover" })).toBeVisible();

        await page.keyboard.press("Escape");
        await expect(page.getByRole("dialog", { name: "Open Popover" })).not.toBeVisible();
    });
});
