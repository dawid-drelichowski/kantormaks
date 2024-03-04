import { normalizeRate } from '../transformation/rates.js'

export function areRatesEqual(first, second) {
  return Object
    .keys(first)
    .every((key) => first[key] === second[key])
}

export function findChangedRates(first, second) {
  return second.reduce((updated, secondItem) => {
    secondItem = normalizeRate(secondItem)
    const firstItem = first.find(({ id }) => id === secondItem.id)
    if (!areRatesEqual(firstItem, secondItem)) {
      updated.push(secondItem)
    }
    return updated
  }, [])
}
