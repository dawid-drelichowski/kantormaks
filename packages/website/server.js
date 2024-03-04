import Fastify from 'fastify'
import fastifyView from '@fastify/view'
import fastifyStatic from '@fastify/static'
import fastifyBasicAuth from '@fastify/basic-auth'
import fastifyFormBody from '@fastify/formbody'
import { parse } from 'qs'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import config from '#config'
import handlebars from './view/helpers.js'
import { isAuthorized } from './authorization.js'
import { getRates } from './data/access/rates.js'
import { getRatesByTypes, updateRates } from './data/transformation/rates.js'
import { findChangedRates } from './data/comparison/rates.js'


const fastify = Fastify({
  logger: true,
}).register(fastifyBasicAuth, {
  validate: isAuthorized,
  authenticate: { realm: 'Access to the admin page' },
}).register(fastifyFormBody, {
  parser: parse,
}).register(fastifyView, {
  engine: {
    handlebars,
  }
}).register(fastifyStatic, {
  root: path.join(path.dirname(fileURLToPath(import.meta.url)), 'public'),
  prefix: '/public/',
})

fastify.get('/', async (request, response) => {
  const rates = await getRates()
  const viewData = getRatesByTypes(rates)
  return response.view('templates/home.hbs', { ...viewData })
})

fastify.get(
  '/admin',
  { onRequest: (...args) => fastify.basicAuth(...args) },
  async (request, response) => {
    const rates = await getRates()
    const viewData = getRatesByTypes(rates)
    return response.view('templates/admin.hbs', { ...viewData, updated: request.query.updated || false })
  }
)

fastify.post(
  '/admin',
  { onRequest: (...args) => fastify.basicAuth(...args) },
  async (request, response) => {
    const current = await getRates()
    const next = request.body.wholesale.concat(request.body.retail)
    const updated = findChangedRates(current, next)
    const results = await updateRates(updated)
    console.log(results)
    // @todo: error handling
    return response.redirect('/admin?updated=true')
  }
);

try {
  await fastify.listen({ port: config.WEBSITE_PORT })
} catch (error) {
  fastify.log.error(error)
  process.exit(1)
}
