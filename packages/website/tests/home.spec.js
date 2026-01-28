import { test, expect } from '@playwright/test'
import config from '#config'
import percySnapshot from '@percy/playwright'

test.describe('Home page', () => {
  test('displays properly', async ({ page }) => {
    await page.goto(config.WEBSITE_URL)

    await expect(page).toHaveTitle('Kantor Maks Wrocław - Wymiana walut')
    await expect(page.getByText('Kursy detaliczne')).toBeVisible()
    await expect(page.getByText('Kursy hurtowe')).toBeVisible()
    await expect(page.getByRole('row')).toHaveCount(22)

    await percySnapshot(page, 'Home page')
  })
})
