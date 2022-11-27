import pg from 'pg'

export const createDatabase = async () => {
  const client = new pg.Client()
  try {
    await client.connect() // gets connection
    //  await client.query('CREATE DATABASE solver-db');  // sends queries
    return client
  } catch (error) {
    client.end()
    console.error(error)
  }
}
