import { updateRate } from '../access/rates.js'

const rateTypes = new Map([
  [1, 'retail'],
  [2, 'wholesale'],
])

export function getRateTypeByTypeId(id) {
  return rateTypes.get(id)
}

export function getRatesByTypes(rates) {
  return rates.reduce(
    (data, rate) => {
      data[getRateTypeByTypeId(rate.typeId)].push(rate)

      return data
    },
    {
      [getRateTypeByTypeId(1)]: [],
      [getRateTypeByTypeId(2)]: [],
    },
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
