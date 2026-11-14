import { test, expect } from '@playwright/test';

test('target switch, slider change, hex click, and novelty toggle', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AnalogAtlas' })).toBeVisible();

  // target switch
  const target = page.locator('#target');
  await target.selectOption('moon_shackleton_rim');
  await expect(target).toHaveValue('moon_shackleton_rim');

  // slider change
  const slider = page.locator('#w-terrain');
  await slider.fill('2');
  await expect(slider).toHaveValue('2');

  // novelty toggle
  const novel = page.locator('#novel');
  await expect(novel).toBeChecked();
  await novel.uncheck();
  await expect(novel).not.toBeChecked();

  // hex click via ranked list item (acts as selectable hex interaction)
  const first = page.locator('.list li').first();
  await expect(first).toBeVisible();
  await first.click();
  await expect(page.locator('.radar')).toBeVisible();
  await expect(page.getByText('What matches')).toBeVisible();
});
