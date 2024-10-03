import { getRateTypeByTypeId } from '../transformation/rates.js'

function isValidDate(date) {
  return ![undefined, null, NaN].includes(date?.getTime())
}

export function findLatestUpdatesByTypeId(rates) {
  return rates.reduce((result, { typeId, timestamp }) => {
    const date = new Date(timestamp)
    const type = getRateTypeByTypeId(typeId)

    if (isValidDate(date)) {
      if (!result[type] || result[type] < date) {
        result[type] = date
      }
    }
    return result
  }, {})
}
