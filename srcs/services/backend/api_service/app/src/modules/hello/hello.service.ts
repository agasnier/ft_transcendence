// import { db } from '../../db/index.js'
// import { users } from '../../db/schema.js'

export async function checkDatabase(): Promise<{ message: string }> {
  // const rows = await db.select().from(users)
  // return { message: `Backend connecté à la DB — ${rows.length}` }
  return { message: `hello` }
}