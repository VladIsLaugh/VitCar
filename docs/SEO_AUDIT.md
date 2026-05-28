# VitAuto SEO Audit

## Audit Date
2026-05-28 (pre-launch, dev environment)

## Pages Audited

| Page | URL Pattern |
|------|-------------|
| Landing | `/uk`, `/en` |
| Catalog | `/uk/cars`, `/en/cars` |
| Lot Detail | `/uk/cars/[id]`, `/en/cars/[id]` |
| Calculator | `/uk/calculator`, `/en/calculator` |

---

## Lighthouse Target Scores (run on staging, mobile preset)

| Page | Performance | SEO | Accessibility | Notes |
|------|-------------|-----|---------------|-------|
| Landing `/uk` | ≥ 90 | ≥ 95 | ≥ 95 | Pending staging run |
| Catalog `/uk/cars` | ≥ 85 | ≥ 95 | — | Pending staging run |
| Lot page `/uk/cars/[id]` | — | ≥ 95 | — | Pending staging run |
| Calculator `/uk/calculator` | — | ≥ 90 | — | Pending staging run |

> Screenshots to be attached as PR comments after staging deployment.

---

## Structured Data (JSON-LD)

| Schema Type | Page | Status |
|-------------|------|--------|
| `FAQPage` | Landing | ✅ Implemented — 12 questions from `Landing.faq.items` |
| `Organization` | Landing | ✅ Implemented |
| `LocalBusiness` | Landing | ✅ Implemented |
| `BreadcrumbList` | Lot detail | ✅ Implemented — 5-level breadcrumb |
| `Vehicle` | Lot detail | ✅ Implemented — VIN, mileage, fuel type, offer price |

### Validation
Run against [Google Rich Results Test](https://search.google.com/test/rich-results) once staging URL is live.

---

## Technical SEO Checklist

| Check | Status | Notes |
|-------|--------|-------|
| `/sitemap.xml` accessible | ✅ | Dynamic: static pages + lot URLs from API |
| `/robots.txt` correct | ✅ | Disallows `/*/dashboard`, `/*/admin`, `/*/auth`, `/api` |
| Canonical tags | ✅ | Set in `generateMetadata` on all public pages |
| `hreflang` alternates | ✅ | Set in root layout `alternates.languages` |
| `<html lang>` attribute | ✅ | `uk` or `en` set in root locale layout |
| `noindex` only where intended | ✅ | Dashboard + demo catalog pages; 404 page |
| `next/image` alt attributes | ✅ | All `LotCard`, `LotPhotoGallery` images have `alt` |
| No duplicate `<title>` tags | ✅ | One `generateMetadata` per page |
| Branded 404 page | ✅ | `app/[locale]/not-found.tsx` with `robots: noindex` |
| OG image landing | ⚠️ | `/og-landing.jpg` must be created (1200×630px) |
| Twitter Card | ✅ | `summary_large_image` set in layout |

---

## Open Graph Verification

| Tool | URL | Status |
|------|-----|--------|
| Facebook Sharing Debugger | https://developers.facebook.com/tools/debug/ | Pending — run after domain is live |
| Telegram link preview | n/a | Pending — paste vitauto.ua in Telegram |
| Twitter Card Validator | https://cards-dev.twitter.com/validator | Pending |

---

## Analytics Verification

| Check | Status |
|-------|--------|
| Consent → GA4 Realtime | Pending staging |
| No-consent → no scripts | Implemented (consent-gated in layout) |
| `calculator_started` GA4 event | Implemented via `trackEvent()` in `lib/analytics.ts` |
| Cookie banner first visit | Pending — requires cookie consent banner component |
| Cookie banner second visit | Pending — requires cookie consent banner component |

---

## Playwright SEO Tests

Location: `apps/web/e2e/seo.spec.ts`

Test suite covers:
- `<title>` contains "VitAuto" on landing and catalog
- `<meta name="description">` present and > 50 chars
- `<html lang>` matches locale (`uk` / `en`)
- FAQPage JSON-LD with exactly 12 questions
- Organization JSON-LD present
- LocalBusiness JSON-LD present
- `/sitemap.xml` returns 200 with valid XML containing `vitauto.ua/uk`
- `/robots.txt` returns 200 and contains `Disallow: /*/dashboard`
- Header nav links return HTTP < 400
- 404 page renders for unknown route
- 404 page has `robots: noindex`
- Canonical link present on landing
- At least 2 `hreflang` alternate links on landing

Run with: `pnpm e2e` inside `apps/web`

---

## Post-Audit Fix Log

| Issue | Severity | Fix | Commit |
|-------|----------|-----|--------|
| No JSON-LD on landing page | High | Added FAQPage + Organization + LocalBusiness schemas | CAR-66 |
| No Vehicle JSON-LD on lot page | High | Added Vehicle schema alongside BreadcrumbList | CAR-66 |
| No branded 404 page | Medium | Created `app/[locale]/not-found.tsx` with noindex | CAR-66 |

---

## PO Actions Required

- [ ] Submit `https://vitauto.ua/sitemap.xml` to [Google Search Console](https://search.google.com/search-console) after domain is live
- [ ] Create `/public/og-landing.jpg` (1200×630px) for Open Graph image
- [ ] Run Lighthouse on staging once deployed and attach screenshots
- [ ] Verify Rich Results Test on staging for all structured data types
