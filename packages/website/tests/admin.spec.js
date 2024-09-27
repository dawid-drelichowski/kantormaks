import { test, expect } from '@playwright/test'
import config from '#config'

test.describe('Admin page', () => {
  const adminUrl = `${config.WEBSITE_URL}/admin`

  test('requires authorization', async ({ page }) => {
    const response = await page.goto(adminUrl)

    expect(response.status()).toBe(401)
  })

  test('displays properly', async ({ browser }) => {
    const context = await browser.newContext({
      httpCredentials: {
        username: config.WEBSITE_ADMIN_USER,
        password: config.WEBSITE_ADMIN_PASSWORD,
      },
    })
    const page = await context.newPage()
    await page.goto(adminUrl)

    await expect(page).toHaveTitle('Kantor Maks Wrocław - Panel administratora')

    await browser.close()
  })
})
