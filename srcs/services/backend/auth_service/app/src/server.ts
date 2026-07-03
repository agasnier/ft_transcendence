import { buildApp } from './app.js'
import { env } from './config/env.js'

// construct the app
const app = buildApp()

// the app listen with config/env 
const start = async (): Promise<void> => {
  try {
    await app.listen({ port: env.port, host: env.host })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
