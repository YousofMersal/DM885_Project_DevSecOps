import express from 'express'

export default () => {
  const jobs = express.Router()

  jobs.get('*', (req, res) => {
    res.send(`Solvers service /models: ${req.path}`)
  })

  return jobs
}
