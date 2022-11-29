import pg from 'pg'
import { migrate } from 'postgres-migrations'

export const createDatabase = async () => {
  const client = new pg.Client()
  try {
    await client.connect()
    await migrate({ client: client }, './migrations')
    return client
  } catch (error) {
    client.end()
    console.error(error)
  }
}
