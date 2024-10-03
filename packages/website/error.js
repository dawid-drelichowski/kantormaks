export function errorHandler(error, request, response) {
  const { statusCode, message } = error
  const status = statusCode || 500

  return response.code(status).view('templates/error.hbs', { status, message })
}
