import handlebars from 'handlebars'

import config from '#config'

const locale = config.WEBSITE_LOCALE

handlebars.registerHelper({
  language: () => locale.split('-').at(0),
  formatCurrency: value => new Intl.NumberFormat(
    locale,
    { minimumFractionDigits: 4, maximumFractionDigits: 4 }
  ).format(value),
  currentYear: () => new Date().getFullYear(),
})

export default handlebars
