import { components } from './../../openapi-schema.d.js'
import {
  DBMznModel,
  DBMznData,
  DBJob,
  DBSolver,
  runningJobs,
} from './../jobs/jobs-manager.js'
import { K8sClient } from './../jobs/k8s-client.js'
import express from 'express'
import { startJob } from '../jobs/jobs-manager.js'
import { randomUUID } from 'crypto'
import { Client } from 'pg'

export interface CreateJob {
  modelId: string
  dataId?: string
  solverTypes: string[]
}

export default (client: K8sClient, db: Client) => {
  const jobs = express.Router()

  jobs.post('/', async (req, res) => {
    console.log('Starting solver job requested')

    const body: components['schemas']['Job_create'] = req.body

    if (!body.solver_ids) {
      throw 'missing `solver_ids`'
    }

    const model = (
      await db.query<DBMznModel>(
        'SELECT * FROM mzn_models WHERE model_id = $1',
        [body.model_id]
      )
    ).rows[0]

    let data = undefined
    if (body.data_id) {
      data = (
        await db.query<DBMznData>('SELECT * FROM mzn_data WHERE data_id = $1', [
          body.data_id,
        ])
      ).rows[0]
    }

    const job_id = randomUUID()
    let job = {} as DBJob
    let solvers: DBSolver[] = []
    try {
      await db.query('BEGIN')

      job = (
        await db.query(
          "INSERT INTO jobs (job_id, model_id, data_id, job_status) VALUES ($1, $2, $3, 'running')",
          [job_id, 1, null]
        )
      ).rows[0]

      for (const solver_id of body.solver_ids) {
        await db.query(
          'INSERT INTO job_solvers (job_id, solver_id) VALUES ($1, $2)',
          [job_id, solver_id]
        )
      }

      solvers = (
        await db.query(
          'SELECT * FROM job_solvers INNER JOIN solvers ON solvers.solver_id = job_solvers.solver_id WHERE job_solvers.job_id = $1',
          [job_id]
        )
      ).rows

      await db.query('COMMIT')
    } catch (e) {
      await db.query('ROLLBACK')
      throw e
    }

    try {
      const jobs = await startJob(client, db, {
        job_id,
        model,
        data,
        solvers,
      })

      res.status(201).send({
        status: 'starting job',
        job_id,
      })
    } catch (e) {
      res.status(500).send({
        status: 'failed to start job',
        error: e,
      })
    }
  })

  jobs.get('/', async (req, res) => {
    const jobs = (await db.query('SELECT * FROM jobs')).rows

    res.send(jobs)
  })

  jobs.get<{ job_id: string }>('/:job_id', async (req, res) => {
    const job_id = req.params.job_id

    const jobs = await (
      await db.query('SELECT * FROM jobs WHERE job_id = $1', [job_id])
    ).rows

    if (jobs.length == 0) {
      return res.status(404).send({ message: 'job not found' })
    }

    res.send(jobs[0])
  })

  jobs.delete<{ job_id: string }>('/:job_id', async (req, res) => {
    const job_id = req.params.job_id

    const jobs = (
      await db.query('DELETE FROM jobs WHERE job_id = $1 RETURNING *', [job_id])
    ).rows

    if (jobs.length == 0) {
      return res.status(404).send({ message: 'job not found' })
    }

    res.send({
      message: 'job deleted',
      job: jobs[0],
    })
  })

  jobs.get<{ job_id: string }>('/:job_id/result', async (req, res) => {
    const job_id = req.params.job_id

    const jobCount = (
      await db.query('SELECT * FROM jobs WHERE job_id = $1', [job_id])
    ).rowCount

    if (jobCount == 0) {
      return res.status(404).send({ message: 'job not found' })
    }

    const solutions = (
      await db.query('SELECT * FROM job_solutions WHERE job_id = $1', [job_id])
    ).rows

    res.send(solutions)
  })

  jobs.post<{ job_id: string }>('/:job_id/cancel', async (req, res) => {
    const job_id = req.params.job_id
    // const solvers = req.body as string[]

    if (!(job_id in runningJobs)) {
      return res
        .status(404)
        .send({ message: 'job was either not found or not running' })
    }

    const jobCtx = runningJobs[job_id]

    const solvers = Object.keys(jobCtx.solvers)
    Object.values(jobCtx.solvers).forEach((solver) => solver.cancelSolver())

    res.send({
      message: 'cancelled solvers',
      solvers,
      job_id: jobCtx.job_id,
    })
  })

  jobs.use('*', (req, res) => {
    res.send({
      message: `Solvers service /jobs: ${req.path} ${req.method}`,
      env: process.env.NODE_ENV,
      time: Date.now(),
    })
  })

  return jobs
}
