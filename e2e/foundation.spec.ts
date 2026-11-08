import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test('connects to the Worker and explains the agent task', async ({ page }) => {
  await expect(
    page.getByRole('heading', { name: 'Prepare a complete application.' }),
  ).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Cloudflare Worker connected · local');
  await expect(page.getByText('Decision record only')).toBeVisible();
});

test('lets an agent submit an application and a different reviewer approve it', async ({
  page,
}) => {
  await page.getByRole('link', { name: 'Start application' }).click();
  await page.getByRole('button', { name: 'Fill sample details' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { name: 'Livelihood and verification' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { name: 'Terms and acknowledgement' })).toBeVisible();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Submit for review' }).click();

  await expect(page.getByRole('status')).toContainText('Application submitted');
  await expect(page.getByRole('heading', { name: 'Abena Osei' })).toBeVisible();

  await page.getByRole('button', { name: 'Reviewer' }).click();
  await expect(page.getByRole('heading', { name: 'Review queue' })).toBeVisible();
  await page.getByRole('link', { name: /Abena Osei/ }).click();

  await expect(page.getByText('Separation of duties checked')).toBeVisible();
  await page
    .getByLabel('Approval reason')
    .fill('The submitted income and terms support the requested amount.');
  await page.getByRole('button', { name: 'Record approval' }).click();

  await expect(page.getByRole('heading', { name: 'Approved as submitted' })).toBeVisible();
  await page.getByText('View audit evidence').click();
  await expect(page.getByText('Device fingerprint')).toBeVisible();
  await expect(page.getByText(/6\.688500, -1\.624400/)).toBeVisible();
  await expect(page.getByText('This application cannot receive another decision.')).toBeVisible();
});

test('lets a reviewer return an application with structured requirements', async ({ page }) => {
  await page.getByRole('button', { name: 'Reviewer' }).click();
  await page.getByRole('link', { name: /Akosua Mensah/ }).click();

  await page.getByRole('radio', { name: /Return/ }).check({ force: true });
  await page
    .getByLabel('Return reason')
    .fill('The application needs corrections and another supporting document.');
  await page.getByLabel('Required corrections').fill('Correct the declared business address');
  await page.getByLabel('Required documents').fill('Submit the latest market levy receipt');
  await page.getByRole('button', { name: 'Return for correction' }).click();

  await expect(page.getByRole('heading', { name: 'Returned for correction' })).toBeVisible();
  await expect(page.getByText('Correct the declared business address')).toBeVisible();
  await expect(page.getByText('Submit the latest market levy receipt')).toBeVisible();
  await expect(page.getByText('Waiting for correction')).toBeVisible();
});
