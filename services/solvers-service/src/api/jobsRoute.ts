import express from 'express'

export default () => {
  const jobs = express.Router()

  jobs.get('*', (req, res) => {
    res.send(`Solvers service /jobs: ${req.path}`)
  })

  return jobs
}
