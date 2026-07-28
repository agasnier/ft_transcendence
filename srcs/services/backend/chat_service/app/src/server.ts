import { buildApp } from './app.js'
import { env } from './config/env.js'
import { runMigrations } from './db/migrate.js'

const app = buildApp()

const start = async (): Promise<void> => {
  try {
    await runMigrations()
    await app.listen({ port: env.port, host: env.host })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
