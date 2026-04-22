import { expect, test } from '@playwright/test';

test('homepage renders the main sections', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

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
  test.setTimeout(90_000);
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const flagshipButton = page.getByRole('button', { name: 'Flagship AI' });
  await expect(flagshipButton).toBeVisible({ timeout: 60_000 });
  await flagshipButton.evaluate((element) => {
    (element as HTMLButtonElement).click();
  });
  await expect.poll(async () => page.url(), { timeout: 20_000 }).toContain(
    'category=flagship',
  );
  await expect(flagshipButton).toHaveAttribute('aria-pressed', 'true');
});

test('list view opens the detail panel', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const listTab = page.getByRole('tab', { name: 'List' });
  await expect(listTab).toBeVisible({ timeout: 60_000 });
  await listTab.click();
  await page.getByRole('button', { name: /^Isambard-AI/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('link', { name: /read full profile/i })).toBeVisible();
});
