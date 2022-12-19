import { Client } from 'pg'
import k8s from '@kubernetes/client-node'
import { CancelSolverPromise, SolverJob } from './jobs-manager.js'
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
    console.error('Expected to find pod for corresponding job')
    return
  }

  await attachLogger(client, db, jobPodName, job, cancelPromise)
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
    const log: JobStatusLog = JSON.parse(chunk)

    if (log.type == 'solution') {
      const data = log.output.json
      delete data._output

      db.query(
        'INSERT INTO job_solutions (job_id, sol_status, data) VALUES ($1, $2, $3)',
        [job.job_id, 'solution', data]
      )
    }
  })

  const MAX_ATTEMPTS = 5
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    try {
      const loggerPromise = logger.log(
        client.ns,
        jobPodName,
        'minizinc-solver',
        logStream,
        {
          follow: true,
          pretty: false,
          timestamps: false,
        }
      )

      if (
        (await Promise.race([loggerPromise, cancelPromise])) == 'cancel_solver'
      ) {
        logStream.destroy()
      }
    } catch (err) {
      if (i == MAX_ATTEMPTS - 1) throw err

      console.log(`Job pod not ready, waiting ${2 ** i} seconds before retry`)
      const result = await Promise.race([sleep(2 ** i * 1000), cancelPromise])
      if (result == 'cancel_solver') return
    }
  }

  console.log('Logger finished')
}

function sleep(ms: number) {
  return new Promise<undefined>((resolve) => setTimeout(resolve, ms))
}
