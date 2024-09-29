import { test, expect } from '@playwright/test'
import config from '#config'

test.describe('Admin page', () => {
  const adminUrl = `${config.WEBSITE_URL}/admin`

  test('requires authorization', async ({ page }) => {
    const response = await page.goto(adminUrl)

    expect(response.status()).toBe(401)
  })

  test('save changes properly', async ({ browser }) => {
    const valueToSet = '1.1'
    const context = await browser.newContext({
      httpCredentials: {
        username: config.WEBSITE_ADMIN_USER,
        password: config.WEBSITE_ADMIN_PASSWORD,
      },
    })
    const page = await context.newPage()
    await page.goto(adminUrl)

    await expect(page).toHaveTitle('Kantor Maks Wrocław - Panel administratora')
    let inputs = page.getByRole('spinbutton')

    for (const input of await inputs.all()) {
      await input.fill(valueToSet)
    }

    await Promise.all([
      page.getByRole('button').click(),
      page.waitForURL(`${adminUrl}?success=true`),
    ]);

    await expect(page.getByText('Zmiany zostały zapisane')).toBeVisible()
    inputs = page.getByRole('spinbutton')

    for (const input of await inputs.all()) {
      expect(await input.inputValue()).toBe(valueToSet)
    }

    await browser.close()
  })
})
