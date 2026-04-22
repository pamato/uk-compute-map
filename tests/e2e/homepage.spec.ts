import { expect, test } from '@playwright/test';

test('homepage renders the main sections', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      name: /the uk wants 420 ai-exaflops/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: /where the infrastructure lives/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: /quantified progress toward 420 ai-exaflops/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /where the uk sits/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: /what 420 ai-exaflops could mean/i,
    }),
  ).toBeVisible();
});

test('filters update the URL', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Flagship AI' }).click();
  await expect(page).toHaveURL(/category=flagship/);
  await expect(page.getByText(/showing \d+ of \d+ facilities/i)).toBeVisible();
});

test('list view opens the detail panel', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('tab', { name: 'List' }).click();
  await page.getByRole('button', { name: /^Isambard-AI/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('link', { name: /read full profile/i })).toBeVisible();
});
