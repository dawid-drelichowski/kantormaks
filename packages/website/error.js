export function errorHandler(error, request, response) {
  const { statusCode: status, message } = error

  return response.code(status).view('templates/error.hbs', { status, message })
}
