import { Client } from 'pg'
import k8s from '@kubernetes/client-node'
import {
  CancelSolverPromise,
  SolverJob,
  stopSolverJob,
} from './jobs-manager.js'
import { K8sClient } from './k8s-client.js'
import stream from 'stream'

export enum JobStatusLogStatus {
  ALL_SOLUTIONS,
  OPTIMAL_SOLUTION,
  UNSATISFIABLE,
  UNBOUNDED,
  UNSAT_OR_UNBOUNDED,
  UNKNOWN,
  ERROR,
}

// Docs https://www.minizinc.org/doc-2.6.2/en/json-stream.html
export type JobStatusLog =
  | {
      type: 'statistics'
      statistics: {
        paths?: number
        flatIntVars?: number
        flatIntConstraints?: number
        method?: 'satisfy'
        flatTime?: number
        initTime?: number
        solveTime?: number
        solutions?: number
        variables?: number
        propagators?: number
        propagations?: number
        nodes?: number
        failures?: number
        restarts?: number
        peakDepth?: number
        nSolutions?: number
      }
    }
  | {
      type: 'solution'
      output: {
        default: string
        raw: string
        json: {
          // the variables and their assignments
          [key: string]: any
          _output?: string
        }
        sections: ['default', 'raw', 'json']
      }
      time: number
    }
  | {
      type: 'status'
      status: JobStatusLogStatus
    }

export async function registerJobWatch(
  client: K8sClient,
  db: Client,
  job: SolverJob,
  cancelPromise: CancelSolverPromise
) {
  const jobName = job.job.metadata?.name
  if (jobName === undefined) throw 'Expected jobname to be defined'

  let jobPodName: string | undefined = undefined
  await exponentialBackoff(
    5,
    async () => {
      const jobPod = await client.core.listNamespacedPod(
        client.ns,
        undefined,
        undefined,
        undefined,
        undefined,
        `job-name=${jobName}`
      )
      const jobPodName = jobPod.body.items.at(0)?.metadata?.name

      if (jobPodName === undefined) {
        throw `Expected to find pod for corresponding job: ${jobName}`
      }
    },
    cancelPromise
  )

  await attachLogger(client, db, jobPodName!, job, cancelPromise)
  // attachWatcher(client, job)
}

async function attachLogger(
  client: K8sClient,
  db: Client,
  jobPodName: string,
  job: SolverJob,
  cancelPromise: CancelSolverPromise
) {
  const logger = new k8s.Log(client.kc)
  const logStream = new stream.PassThrough()
  logStream.on('data', (chunk: string) => {
    process.stdout.write(`SOLVER [${job.solver_id}]: `)
    process.stdout.write(chunk)

    try {
      const log: JobStatusLog = JSON.parse(chunk)

      if (log.type == 'solution') {
        const data = log.output.json
        delete data._output

        db.query(
          'INSERT INTO job_solutions (job_id, solver_id, sol_status, data) VALUES ($1, $2, $3, $4)',
          [job.job_id, job.solver_id, 'solution', data]
        )
      }
    } catch (e) {
      console.error('Error parsing log chunk', e)
    }
  })

  await exponentialBackoff(
    5,
    async () => {
      await logger.log(client.ns, jobPodName, 'minizinc-solver', logStream, {
        follow: true,
        pretty: false,
        timestamps: false,
      })
    },
    cancelPromise,
    async () => {
      logStream.destroy()
      await stopSolverJob(client, job.job_id)
    }
  )

  console.log('Logger finished')
}

function sleep(ms: number) {
  return new Promise<undefined>((resolve) => setTimeout(resolve, ms))
}

async function exponentialBackoff(
  maxAttempts: number,
  callback: () => Promise<void>,
  cancelPromise: Promise<'cancel_solver'> | undefined = undefined,
  cancelCleanup: (() => Promise<unknown>) | undefined = undefined
) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const result = await Promise.race([callback(), cancelPromise])
      if (result == 'cancel_solver') {
        if (cancelCleanup) cancelCleanup()
        return
      }

      return
    } catch (err) {
      if (i == maxAttempts - 1) throw err

      console.log(`Not ready, waiting ${2 ** i} seconds before retry`)
      const result = await Promise.race([sleep(2 ** i * 1000), cancelPromise])
      if (result == 'cancel_solver') return
    }
  }

  throw 'max attempts exceeded'
}
