import { test, expect } from '@playwright/test'
import config from '#config'
import percySnapshot from '@percy/playwright'
import { createAdminPage } from './admin/page.js'

async function testThemeSwitcher(page, pageName) {
  const html = page.locator('html')
  const buttons = page.locator('.theme-switcher button')
  const lightButton = buttons.nth(0)
  const systemButton = buttons.nth(1)
  const darkButton = buttons.nth(2)

  await test.step('default state — system button active, no theme class', async () => {
    await expect(systemButton).toHaveClass('active')
    await expect(html).not.toHaveClass('dark')
    await expect(html).not.toHaveClass('light')
  })

  await test.step('click dark — html gets .dark class, dark button active', async () => {
    await darkButton.click()
    await expect(html).toHaveClass('dark')
    await expect(html).not.toHaveClass('light')
    await expect(darkButton).toHaveClass('active')
    await expect(lightButton).not.toHaveClass('active')
    await expect(systemButton).not.toHaveClass('active')
    await percySnapshot(page, `Theme switcher — ${pageName} — dark`)
  })

  await test.step('dark theme persists after reload', async () => {
    await page.reload()
    await expect(html).toHaveClass('dark')
    await expect(page.locator('.theme-switcher button').nth(2)).toHaveClass(
      'active',
    )
  })

  await test.step('click light — html gets .light class, light button active', async () => {
    await lightButton.click()
    await expect(html).toHaveClass('light')
    await expect(html).not.toHaveClass('dark')
    await expect(lightButton).toHaveClass('active')
    await percySnapshot(page, `Theme switcher — ${pageName} — light`)
  })

  await test.step('click system — removes theme class, system button active', async () => {
    await systemButton.click()
    await expect(html).not.toHaveClass('dark')
    await expect(html).not.toHaveClass('light')
    await expect(systemButton).toHaveClass('active')
    await percySnapshot(page, `Theme switcher — ${pageName} — system`)
  })
}

test.describe('Theme switcher', () => {
  test('works on home page', async ({ page }) => {
    await page.goto(config.WEBSITE_URL)
    await testThemeSwitcher(page, 'home')
  })

  test('works on admin page', async ({ browser }) => {
    const { context, page } = await createAdminPage(browser)
    await page.goto(`${config.WEBSITE_URL}/admin`)
    await testThemeSwitcher(page, 'admin')
    await context.close()
  })
})
