import express from 'express'

export default () => {
  const jobs = express.Router()

  jobs.get('*', (req, res) => {
    res.send(`Solvers service /solvers: ${req.path}`)
  })

  return jobs
}
