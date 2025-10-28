import { readFileSync } from 'node:fs'
import { resolveModulePath } from '../path.js'
import handlebars from './helpers.js'

function getPartialContent(file) {
  return readFileSync(
    resolveModulePath(import.meta.url, '..', 'templates', 'partials', file),
    'utf8',
  )
}

handlebars.registerPartial({
  header: getPartialContent('header.hbs'),
  footer: getPartialContent('footer.hbs'),
  tracking: getPartialContent('tracking.hbs'),
  toast: getPartialContent('toast.hbs'),
  meta: getPartialContent('meta.hbs'),
})

export default handlebars
