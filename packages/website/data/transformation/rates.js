import { updateRate } from '../access/rates.js'

export function getRatesByTypes(rates) {
  return rates.reduce(
    (data, rate) => {
      if (rate.typeId === 1) {
        data.wholesale.push(rate)
      } else {
        data.retail.push(rate)
      }
      return data
    },
    { wholesale: [], retail: [] },
  )
}

export function normalizeRate(rate) {
  return {
    ...rate,
    id: Number(rate.id),
    typeId: Number(rate.typeId),
    sale: Number(rate.sale),
    purchase: Number(rate.purchase),
  }
}

export function updateRates(rates) {
  return Promise.all(
    rates.map((rate) => {
      const { id, ...changes } = rate
      changes.timestamp = new Date()
      return updateRate(id, changes)
    }),
  )
}
