import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const validator = new Ajv({ allErrors: true })
addFormats(validator, ['date-time'])

async function getValidate(key) {
  let validate = validator.getSchema(key)

  if (!validate) {
    try {
      const { default: schema } = await import(
        `./validation/schemas/${key}.json`,
        { with: { type: 'json' } }
      )
      validator.addSchema(schema, key)
      validate = validator.getSchema(key)
    } catch (error) {
      console.error(error)
      return false
    }
  }
  return validate
}

export function isValidationRequired(request) {
  return ['POST', 'PATCH', 'PUT'].includes(request.method)
}

export async function validate(request) {
  const validate = await getValidate(`rate/${request.method.toLowerCase()}`)

  if (!validate) {
    return false
  }

  return { isValid: validate(request.body), errors: validate.errors }
}

export function getErrorsText(errors) {
  return validator.errorsText(errors)
}
