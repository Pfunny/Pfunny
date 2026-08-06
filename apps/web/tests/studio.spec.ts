import { expect, test } from '@playwright/test';

test('Studio starts and renders the main interface', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/CH\.FANDRICH/i);
  await expect(page.locator('#root')).toBeVisible();
  await expect(page.locator('body')).toContainText(/CH\.FANDRICH|Studio/i);
});
