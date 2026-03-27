import { test, expect } from 'playwright/test';

test.describe('Web Components Modal and Popover Tests', () => {
  test('should not emit focus-trap console errors during wc modal lifecycle', async ({ page }) => {
    const focusTrapErrors: string[] = [];

    page.on('console', (message) => {
      if (message.type() !== 'error') {
        return;
      }
      const text = message.text();
      if (text.includes('focus-trap') || text.includes('at least one tabbable node')) {
        focusTrapErrors.push(text);
      }
    });

    page.on('pageerror', (error) => {
      const text = String(error);
      if (text.includes('focus-trap') || text.includes('at least one tabbable node')) {
        focusTrapErrors.push(text);
      }
    });

    await page.goto('http://localhost:5173/wc-test.html');
    await page.locator('g-button#danger').click();

    const dangerDialog = page.getByRole('dialog', { name: 'Danger' });
    await expect(dangerDialog).toBeVisible();

    await expect.poll(() => focusTrapErrors, {
      message: `Unexpected focus-trap errors: ${focusTrapErrors.join('\n')}`,
    }).toHaveLength(0);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/wc-test.html');
  });

  test('should not duplicate host id onto inner elements in CE mode', async ({ page }) => {
    await expect(page.locator('g-button#btn-primary')).toHaveCount(1);
    await expect(page.locator('g-button#btn-primary button#btn-primary')).toHaveCount(0);

    await expect(page.locator('g-text-input#text-input')).toHaveCount(1);
    await expect(page.locator('g-text-input#text-input input#text-input')).toHaveCount(0);
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

    const anotherDialog = page.locator('#modal-root [role="dialog"]').filter({ hasText: 'This is another modal!' });
    await expect(anotherDialog).toBeVisible();
    await expect(page.getByText('This is another modal!')).toBeVisible();
  });

  test('should close only the top-most modal when clicking outside', async ({ page }) => {
    await page.locator('g-button#danger').click();
    await page.locator('g-button#another').click();

    const dangerDialog = page.getByRole('dialog', { name: 'Danger' });
    const anotherDialog = page.getByRole('dialog', { name: 'Another' });

    await expect(dangerDialog).toBeVisible();
    await expect(anotherDialog).toBeVisible();

    await page.mouse.click(10, 10);

    await expect(anotherDialog).not.toBeVisible();
    await expect(dangerDialog).toBeVisible();
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

  test('should open popover programmatically without trigger slot', async ({ page }) => {
    await page.evaluate(() => {
      (document.getElementById('programmatic-popover') as any).show();
    });

    const popoverDialog = page.locator('g-popover#programmatic-popover [role="dialog"]');
    await expect(popoverDialog).toBeVisible();
    await expect(page.getByText('Programmatic popover content.')).toBeVisible();

    await page.evaluate(() => {
      (document.getElementById('programmatic-popover') as any).hide();
    });

    await expect(popoverDialog).not.toBeVisible();
  });
});
