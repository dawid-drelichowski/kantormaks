import config from '#config'

export async function getRates() {
  const result = await fetch(`${config.WEBSITE_API_URL}/rates`)
  return await result.json()
}

export async function updateRate(id, changes) {
  const result = await fetch(`${config.WEBSITE_API_URL}/rates/${id}`, {
    method: 'PUT',
    headers: {
      'content-Type': 'application/json',
      'authorization': `Basic ${btoa(`${config.WEBSITE_API_USER}:${config.WEBSITE_API_PASSWORD}`)}`,
    },
    body: JSON.stringify(changes),
  })
  return await result.json()
}
