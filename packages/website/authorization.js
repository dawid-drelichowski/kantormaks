import config from '#config'

export function isAuthorized(user, password, request, response, done) {
  if (user === config.WEBSITE_ADMIN_USER && password === config.WEBSITE_ADMIN_PASSWORD) {
    done()
  } else {
    response.status(401)
    done(new Error('Unauthorized'))
  }
}
