import { buildApp } from './app.js'
import { env } from './config/env.js'
import { runMigrations } from './db/migrate.js'

// construct the app
const app = buildApp()

const start = async (): Promise<void> => {
  try {
    // create the "users" SQL database via Drizzle
    await runMigrations()

    await app.listen({ port: env.port, host: env.host })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
