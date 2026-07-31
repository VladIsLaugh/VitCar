import type { Page } from '@playwright/test';

/**
 * Selects a value from a shadcn/ui Select component.
 * Clicks the trigger by id, then picks the option by visible text.
 */
export async function selectOption(page: Page, triggerId: string, optionText: string) {
  await page.locator(`#${triggerId}`).click();
  await page.getByRole('option', { name: optionText, exact: true }).click();
}

/**
 * Fills the Make field which uses a custom searchable Combobox (not a shadcn Select).
 * The trigger has role="combobox"; the popover contains a search Input and a list of buttons.
 */
export async function fillMake(page: Page, make: string) {
  await page.getByRole('combobox').click();
  await page.getByPlaceholder('Search...').fill(make);
  await page
    .locator('[data-radix-popper-content-wrapper]')
    .getByRole('button', { name: make, exact: true })
    .click();
}

export async function fillStep1(
  page: Page,
  data: {
    make: string;
    model: string;
    year: string;
    fuelType: string;
    carSize: 'small' | 'big';
    engineVolumeL?: string;
    batteryKwh?: string;
  }
) {
  await fillMake(page, data.make);

  // Model: shadcn Select when make has known models, plain Input otherwise
  await page.locator('#model').click();
  const modelOption = page.getByRole('option', { name: data.model, exact: true });
  if (await modelOption.isVisible({ timeout: 2000 }).catch(() => false)) {
    await modelOption.click();
  } else {
    await page.locator('#model').fill(data.model);
    await page.locator('#model').press('Tab');
  }

  await selectOption(page, 'year', data.year);
  await selectOption(page, 'fuelType', data.fuelType);

  if (data.engineVolumeL !== undefined) {
    await page.locator('#engineVolume').fill(data.engineVolumeL);
    await page.locator('#engineVolume').press('Tab');
  }
  if (data.batteryKwh !== undefined) {
    await page.locator('#batteryCapacity').fill(data.batteryKwh);
    await page.locator('#batteryCapacity').press('Tab');
  }

  await page.locator(`#carSize-${data.carSize}`).click();
}

export async function fillStep2(
  page: Page,
  data: {
    auctionSource: 'Copart' | 'IAAI';
    usPort: string;
    condition: string;
    lotPrice: string;
  }
) {
  await page.getByRole('button', { name: data.auctionSource, exact: true }).click();
  await selectOption(page, 'usPort', data.usPort);
  await selectOption(page, 'auctionCondition', data.condition);
  await page.locator('#lotPrice').fill(data.lotPrice);
  await page.locator('#lotPrice').press('Tab');
}

/** Waits for the result breakdown panel to appear with the Total turnkey row. */
export async function waitForResult(page: Page, timeout = 20_000) {
  await page.getByText('Total turnkey').waitFor({ state: 'visible', timeout });
}
