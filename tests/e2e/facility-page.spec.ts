import { expect, test } from '@playwright/test';

test('isambard-ai facility page renders its sections', async ({ page }) => {
  await page.goto('/facilities/isambard-ai');

  await expect(page.getByRole('heading', { name: 'Isambard-AI' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /at a glance/i }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /hardware & performance/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /access & eligibility/i }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: /sources/i })).toBeVisible();
});
