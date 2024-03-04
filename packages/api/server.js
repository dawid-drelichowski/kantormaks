import jsonServer from 'json-server'
import config from './config.js'
import { isAuthorizationRequired, isAuthorized } from './authorization.js'
import { getErrorsText, isValidationRequired, validate } from './validation.js'

const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server
  .disable('x-powered-by')
  .use(middlewares)
  .use(jsonServer.bodyParser)
  .use((request, response, next) => {
    if (isAuthorizationRequired(request)) {
      if (isAuthorized(request)) {
        return next()
      }
      return response.status(401).json({ error: 'Unauthorized' })
    }
    return next()
  })
  .use(async (request, response, next) => {
    if (isValidationRequired(request)) {
      const { isValid, errors } = await validate(request)
      if (!isValid) {
        return response.status(400).json({ error: getErrorsText(errors) })
      }
    }
    return next()
  })
  .use(router)
  .listen(config.API_PORT, () => console.log('JSON Server is running'))
