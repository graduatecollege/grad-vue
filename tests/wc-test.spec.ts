import { test, expect } from 'playwright/test';

test.describe('Web Components Modal and Popover Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/wc-test.html');
  });

  test('should open and close the danger modal', async ({ page }) => {
    const dangerButton = page.locator('g-button#danger');
    await dangerButton.click();

    // Modal content is teleported to #modal-root, so check for the
    // visible dialog rather than the g-modal host element.
    const dangerDialog = page.getByRole('dialog', { name: 'Danger' });
    await expect(dangerDialog).toBeVisible();
    await expect(page.getByText("Here's a dangerous modal!")).toBeVisible();

    const closeBtn = dangerDialog.getByRole('button', { name: 'Close' });
    await closeBtn.click();
    await expect(dangerDialog).not.toBeVisible();
  });

  test('should open nested modal', async ({ page }) => {
    await page.locator('g-button#danger').click();
    await page.locator('g-button#another').click();

    // useId() can collide across separate CE instances, so match by content
    // rather than aria-label.
    const anotherDialog = page.locator('#modal-root [role="dialog"]').filter({ hasText: 'This is another modal!' });
    await expect(anotherDialog).toBeVisible();
    await expect(page.getByText('This is another modal!')).toBeVisible();
  });

  test('should toggle popover', async ({ page }) => {
    await page.evaluate(() => {
      (document.getElementById('popover-content') as any).toggle();
    });

    // Popover renders in-place in CE mode (Teleport disabled).
    const popoverDialog = page.locator('g-popover#popover-content').getByRole('dialog');
    await expect(popoverDialog).toBeVisible();
    await expect(page.getByText('Hello popover!')).toBeVisible();

    const closeBtn = popoverDialog.getByRole('button', { name: 'Close popover' });
    await closeBtn.click();
    await expect(popoverDialog).not.toBeVisible();
  });
});
