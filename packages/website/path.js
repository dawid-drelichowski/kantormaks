import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

function getModuleDirectory(moduleUrl) {
  return dirname(fileURLToPath(moduleUrl))
}

export function resolveModulePath(moduleUrl, ...paths) {
  return join(getModuleDirectory(moduleUrl), ...paths)
}
