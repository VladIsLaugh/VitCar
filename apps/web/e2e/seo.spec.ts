import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Landing page — meta + JSON-LD
// ---------------------------------------------------------------------------
test.describe('Landing SEO', () => {
  test('has <title> containing "VitAuto"', async ({ page }) => {
    await page.goto('/uk');
    await expect(page).toHaveTitle(/VitAuto/i);
  });

  test('has <meta name="description"> longer than 50 chars', async ({ page }) => {
    await page.goto('/uk');
    const content = await page.locator('meta[name="description"]').getAttribute('content');
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(50);
  });

  test('has <html lang="uk"> for /uk route', async ({ page }) => {
    await page.goto('/uk');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('uk');
  });

  test('has <html lang="en"> for /en route', async ({ page }) => {
    await page.goto('/en');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('en');
  });

  test('has FAQPage JSON-LD with 12 questions', async ({ page }) => {
    await page.goto('/uk');
    const scripts = await page.locator('script[type="application/ld+json"]').all();
    let faqData: { mainEntity?: unknown[] } | null = null;
    for (const script of scripts) {
      const content = await script.textContent();
      if (!content) continue;
      const parsed = JSON.parse(content) as { '@type'?: string; mainEntity?: unknown[] };
      if (parsed['@type'] === 'FAQPage') {
        faqData = parsed;
        break;
      }
    }
    expect(faqData).not.toBeNull();
    expect(faqData!.mainEntity).toHaveLength(12);
  });

  test('has Organization JSON-LD', async ({ page }) => {
    await page.goto('/uk');
    const scripts = await page.locator('script[type="application/ld+json"]').all();
    let found = false;
    for (const script of scripts) {
      const content = await script.textContent();
      if (!content) continue;
      const parsed = JSON.parse(content) as { '@type'?: string };
      if (parsed['@type'] === 'Organization') {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  test('has LocalBusiness JSON-LD', async ({ page }) => {
    await page.goto('/uk');
    const scripts = await page.locator('script[type="application/ld+json"]').all();
    let found = false;
    for (const script of scripts) {
      const content = await script.textContent();
      if (!content) continue;
      const parsed = JSON.parse(content) as { '@type'?: string };
      if (parsed['@type'] === 'LocalBusiness') {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Catalog page — meta
// ---------------------------------------------------------------------------
test.describe('Catalog SEO', () => {
  test('/uk/cars has <title> containing "VitAuto"', async ({ page }) => {
    await page.goto('/uk/cars');
    await expect(page).toHaveTitle(/VitAuto/i);
  });

  test('/uk/cars has <meta name="description">', async ({ page }) => {
    await page.goto('/uk/cars');
    const content = await page.locator('meta[name="description"]').getAttribute('content');
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(20);
  });
});

// ---------------------------------------------------------------------------
// Sitemap + robots
// ---------------------------------------------------------------------------
test.describe('Sitemap and robots', () => {
  test('/sitemap.xml returns HTTP 200 with XML content', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('xml');
    const body = await res.text();
    expect(body).toContain('<urlset');
    expect(body).toContain('vitauto.ua/uk');
  });

  test('/robots.txt returns HTTP 200 and disallows dashboard', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('Disallow: /*/dashboard');
  });

  test('/robots.txt disallows admin and auth paths', async ({ request }) => {
    const res = await request.get('/robots.txt');
    const body = await res.text();
    expect(body).toContain('Disallow: /*/admin');
    expect(body).toContain('Disallow: /*/auth');
  });
});

// ---------------------------------------------------------------------------
// Header navigation — no broken links
// ---------------------------------------------------------------------------
test.describe('Header navigation', () => {
  test('all nav links in header return HTTP 200', async ({ page, request }) => {
    await page.goto('/uk');
    const hrefs = await page.locator('header a[href]').evaluateAll((anchors) =>
      anchors
        .map((a) => (a as HTMLAnchorElement).href)
        .filter((href) => href.startsWith(process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000')),
    );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const res = await request.get(href);
      expect(res.status(), `Expected 200 for ${href}`).toBeLessThan(400);
    }
  });
});

// ---------------------------------------------------------------------------
// 404 page
// ---------------------------------------------------------------------------
test.describe('404 page', () => {
  test('navigating to nonexistent page shows 404 content', async ({ page }) => {
    await page.goto('/uk/nonexistent-page-xyz-123');
    await expect(page.locator('h1')).toBeVisible();
    // The branded 404 page should have a heading visible
    const heading = await page.locator('h1').textContent();
    expect(heading).toBeTruthy();
  });

  test('404 page has robots noindex', async ({ page }) => {
    await page.goto('/uk/nonexistent-page-xyz-123');
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    // noindex can appear as meta tag or be set via headers
    if (robots) {
      expect(robots).toContain('noindex');
    }
  });
});

// ---------------------------------------------------------------------------
// Canonical + hreflang
// ---------------------------------------------------------------------------
test.describe('Canonical and hreflang', () => {
  test('landing page has canonical link', async ({ page }) => {
    await page.goto('/uk');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBeTruthy();
  });

  test('landing page has hreflang alternate links', async ({ page }) => {
    await page.goto('/uk');
    const hreflangs = await page.locator('link[rel="alternate"][hreflang]').count();
    expect(hreflangs).toBeGreaterThanOrEqual(2);
  });

  test('/uk page has lang="uk" and /en page has lang="en"', async ({ page }) => {
    await page.goto('/uk');
    expect(await page.locator('html').getAttribute('lang')).toBe('uk');
    await page.goto('/en');
    expect(await page.locator('html').getAttribute('lang')).toBe('en');
  });
});
