import { loadEnvFile } from 'node:process'

loadEnvFile('.env')
const config = process.env

export default config
