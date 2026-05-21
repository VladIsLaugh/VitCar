import { test, expect } from '@playwright/test';

const locales = ['uk', 'en'] as const;

for (const locale of locales) {
  test.describe(`Landing page [${locale}]`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${locale}`);
    });

    test('loads without JS errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      await page.waitForLoadState('networkidle');
      expect(errors).toHaveLength(0);
    });

    test('hero heading is visible on load', async ({ page }) => {
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
    });

    test('renders without 404', async ({ page }) => {
      await expect(page).not.toHaveURL(/\/not-found/);
      await expect(page.locator('h1').first()).toBeVisible();
    });

    test('header anchor #faq scrolls to FAQ section', async ({ page }) => {
      await page.goto(`/${locale}#faq`);
      const faqSection = page.locator('#faq');
      await expect(faqSection).toBeInViewport({ ratio: 0.1 });
    });

    test('FAQ accordion: first question opens and closes', async ({ page }) => {
      const faqSection = page.locator('#faq');
      await faqSection.scrollIntoViewIfNeeded();

      const firstTrigger = faqSection.locator('[data-radix-accordion-trigger]').first();
      const firstContent = faqSection.locator('[data-radix-accordion-content]').first();

      await firstTrigger.click();
      await expect(firstContent).toBeVisible();

      await firstTrigger.click();
      await expect(firstContent).toBeHidden();
    });

    test('CTA Band form submits to /calculator with query params', async ({ page }) => {
      const ctaSection = page.locator('#calculator');
      await ctaSection.scrollIntoViewIfNeeded();

      await page.getByPlaceholder('Toyota Camry').fill('Honda Accord');
      await page.getByPlaceholder('8500').fill('9000');

      await Promise.all([
        page.waitForURL(/\/calculator/),
        page.getByRole('button', { name: /calculate/i }).click(),
      ]);

      const url = page.url();
      expect(url).toContain('make=Honda+Accord');
      expect(url).toContain('lotPrice=9000');
    });
  });
}

test.describe('Sticky CTA button (mobile)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('hidden on initial load', async ({ page }) => {
    await page.goto('/uk');
    await page.waitForLoadState('networkidle');
    const stickyLink = page.locator('a[href*="/calculator"]').last();
    await expect(stickyLink).toBeHidden();
  });

  test('visible after scrolling 300px and links to /calculator', async ({ page }) => {
    await page.goto('/uk');
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(200);

    const stickyLink = page.locator('.fixed.bottom-0 a');
    await expect(stickyLink).toBeVisible();
    const href = await stickyLink.getAttribute('href');
    expect(href).toContain('/calculator');
  });
});
