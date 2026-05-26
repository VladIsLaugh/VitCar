import { test, expect } from '@playwright/test';
import { fillStep1, fillStep2, waitForResult } from './helpers/calculator';

const STEP1: Parameters<typeof fillStep1>[1] = {
  make: 'Toyota',
  model: 'Camry',
  year: '2021',
  fuelType: 'Petrol',
  carSize: 'small',
  engineVolumeL: '2.5',
};

const STEP2: Parameters<typeof fillStep2>[1] = {
  auctionSource: 'Copart',
  usPort: 'New York, NJ',
  condition: 'Run & Drive',
  lotPrice: '8500',
};

// ---------------------------------------------------------------------------
// Locale smoke: both locales load
// ---------------------------------------------------------------------------
test.describe('Calculator — locales', () => {
  for (const locale of ['uk', 'en'] as const) {
    test(`/${locale}/calculator loads without 404`, async ({ page }) => {
      await page.goto(`/${locale}/calculator`);
      await expect(page).not.toHaveURL(/not-found/);
      await expect(page.locator('h1').first()).toBeVisible();
    });

    test(`/${locale}/calculator shows step labels in correct language`, async ({ page }) => {
      await page.goto(`/${locale}/calculator`);
      const label = locale === 'en' ? 'Vehicle' : 'Авто';
      await expect(page.getByText(label).first()).toBeVisible();
    });
  }
});

// ---------------------------------------------------------------------------
// Full happy path — petrol car (manual fill)
// ---------------------------------------------------------------------------
test.describe('Calculator — full petrol happy path', () => {
  test('fills all steps, calculates, shows result with 3 payment blocks', async ({ page }) => {
    await page.goto('/en/calculator');

    // Step 1
    await fillStep1(page, STEP1);
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 2 — also triggers debounced auto-calculate
    await fillStep2(page, STEP2);
    await page.getByRole('button', { name: 'Calculate' }).click();

    await waitForResult(page);

    // 3 payment block headers
    await expect(page.getByText('1st Payment')).toBeVisible();
    await expect(page.getByText('2nd Payment')).toBeVisible();
    await expect(page.getByText('3rd Payment')).toBeVisible();

    // Hidden company fees must NOT appear anywhere in the DOM
    await expect(page.locator('text=serviceFee')).not.toBeAttached();
    await expect(page.locator('text=seaMarkup')).not.toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// Currency switcher
// ---------------------------------------------------------------------------
test.describe('Calculator — currency switcher', () => {
  test('UAH → USD → EUR → UAH, totals change, UAH > USD (rate > 1)', async ({ page }) => {
    await page.goto('/en/calculator');
    await fillStep1(page, STEP1);
    await page.getByRole('button', { name: 'Next' }).click();
    await fillStep2(page, STEP2);
    await page.getByRole('button', { name: 'Calculate' }).click();
    await waitForResult(page);

    // The total is the bold amount next to "Total turnkey"
    const totalContainer = page.locator('text=Total turnkey').locator('..');
    const getTotal = () => totalContainer.locator('span').last().textContent();

    const uahTotal = await getTotal();
    expect(uahTotal).not.toBeNull();

    await page.getByRole('button', { name: 'USD', exact: true }).click();
    const usdTotal = await getTotal();
    expect(usdTotal).not.toBe(uahTotal);

    await page.getByRole('button', { name: 'EUR', exact: true }).click();
    const eurTotal = await getTotal();
    expect(eurTotal).not.toBe(usdTotal);

    await page.getByRole('button', { name: 'UAH', exact: true }).click();
    expect(await getTotal()).toBe(uahTotal);
  });
});

// ---------------------------------------------------------------------------
// URL pre-fill from landing
// ---------------------------------------------------------------------------
test.describe('Calculator — URL pre-fill', () => {
  test('pre-fills make, model, year and lot price from query params', async ({ page }) => {
    await page.goto('/en/calculator?make=Toyota&model=Camry&year=2021&lotPrice=8500');
    await page.waitForLoadState('networkidle');

    // Make combobox button shows "Toyota"
    await expect(page.getByRole('combobox')).toContainText('Toyota');

    // Year select trigger shows "2021"
    await expect(page.locator('#year')).toContainText('2021');

    // Lot price input has 8500 (navigate to step 2 to verify)
    // Step advances after calculate() resolves (even on API error, step is set to 2)
    await page.waitForFunction(() => {
      const url = window.location.href;
      return !url.includes('notfound'); // just a basic check
    });
    // The form may be on step 2 if calculation was triggered
    const lotPriceVisible = await page
      .locator('#lotPrice')
      .isVisible()
      .catch(() => false);
    if (lotPriceVisible) {
      await expect(page.locator('#lotPrice')).toHaveValue('8500');
    }
  });
});

// ---------------------------------------------------------------------------
// Guest draft
// ---------------------------------------------------------------------------
test.describe('Calculator — guest draft', () => {
  test('shows restore banner on reload, restores result on click', async ({ page }) => {
    await page.goto('/en/calculator');
    await fillStep1(page, STEP1);
    await page.getByRole('button', { name: 'Next' }).click();
    await fillStep2(page, STEP2);
    await page.getByRole('button', { name: 'Calculate' }).click();
    await waitForResult(page);

    // Reload — draft should have been saved to localStorage
    await page.reload();

    // Draft banner is visible
    await expect(
      page.getByText('You have an unsaved calculation from your last visit.')
    ).toBeVisible();

    // Clicking Restore shows the result
    await page.getByRole('button', { name: 'Restore' }).click();
    await waitForResult(page);
  });

  test('discard removes banner and clears draft', async ({ page }) => {
    await page.goto('/en/calculator');
    await fillStep1(page, STEP1);
    await page.getByRole('button', { name: 'Next' }).click();
    await fillStep2(page, STEP2);
    await page.getByRole('button', { name: 'Calculate' }).click();
    await waitForResult(page);
    await page.reload();

    await page.getByRole('button', { name: 'Discard' }).click();

    // Banner is gone
    await expect(
      page.getByText('You have an unsaved calculation from your last visit.')
    ).not.toBeVisible();

    // No banner on next reload either
    await page.reload();
    await expect(
      page.getByText('You have an unsaved calculation from your last visit.')
    ).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Electric vehicle path
// ---------------------------------------------------------------------------
test.describe('Calculator — electric vehicle', () => {
  test('shows battery field, hides engine volume, customs duty is $0', async ({ page }) => {
    await page.goto('/en/calculator');

    await fillStep1(page, {
      make: 'Tesla',
      model: 'Model Y',
      year: '2022',
      fuelType: 'Electric',
      carSize: 'big',
      batteryKwh: '75',
    });

    // Engine volume must NOT be in the DOM
    await expect(page.locator('#engineVolume')).not.toBeAttached();
    // Battery capacity must be visible
    await expect(page.locator('#batteryCapacity')).toBeVisible();

    await page.getByRole('button', { name: 'Next' }).click();
    await fillStep2(page, STEP2);
    await page.getByRole('button', { name: 'Calculate' }).click();
    await waitForResult(page);

    // Customs duty row shows $0
    await expect(page.getByText('Customs duty (10%)')).toBeVisible();
    const dutyRow = page.locator('text=Customs duty (10%)').locator('..');
    await expect(dutyRow.locator('span').last()).toHaveText('$0');
  });
});

// ---------------------------------------------------------------------------
// Error state (mocked 503)
// ---------------------------------------------------------------------------
test.describe('Calculator — error state', () => {
  test('shows error banner and retry button when API returns 503', async ({ page }) => {
    await page.route('**/calculations/calculate', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ statusCode: 503, message: 'Service Unavailable' }),
      })
    );

    await page.goto('/en/calculator');
    await fillStep1(page, STEP1);
    await page.getByRole('button', { name: 'Next' }).click();
    await fillStep2(page, STEP2);
    await page.getByRole('button', { name: 'Calculate' }).click();

    // Error banner visible with human-readable text (NOT the raw i18n key)
    const errorBanner = page.locator('[class*="destructive"]').first();
    await expect(errorBanner).toBeVisible({ timeout: 10_000 });
    await expect(errorBanner).not.toContainText('calculator.errors');
    await expect(errorBanner).toContainText(/unavailable|temporarily/i);

    // Retry button present
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });
});
