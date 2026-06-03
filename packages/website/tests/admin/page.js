import config from '#config'

export async function createAdminPage(browser) {
  const context = await browser.newContext({
    httpCredentials: {
      username: config.WEBSITE_ADMIN_USER,
      password: config.WEBSITE_ADMIN_PASSWORD,
    },
  })
  const page = await context.newPage()
  return { context, page }
}
