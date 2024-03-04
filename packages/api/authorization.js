import config from './config.js'

export function isAuthorizationRequired(request) {
  return ['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method)
}

export function isAuthorized(request) {
  const authorization = request.headers.authorization

  if (authorization) {
    const token = authorization.split(' ').at(-1)
    const [user, password] = Buffer.from(token, 'base64').toString().split(':')
    if (user === config.API_USER && password === config.API_PASSWORD) {
      return true
    }
  }
  return false
}
