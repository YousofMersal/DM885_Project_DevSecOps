import express from 'express'
import type { Client } from 'pg'

export default (db: Client) => {
  const jobs = express.Router()

  jobs.get('/', async (req, res) => {
    res.send('Solvers here')
  })

  return jobs
}
