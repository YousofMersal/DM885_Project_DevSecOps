import { Client } from 'pg'
import k8s from '@kubernetes/client-node'
import { registerJobWatch } from './job-watcher.js'
import { K8sClient } from './k8s-client.js'

export interface JobDesc {
  job_id: JobID
  model: DBMznModel
  data?: DBMznData
  solvers: DBSolver[]
}

export interface DBJob {
  job_id: JobID
  model_id: string
  data_id?: string
  created_at: Date
  finished_at?: Date
  job_status: 'starting' | 'running' | 'failed' | 'succeeded'
}

export interface DBMznModel {
  model_id: string
  name: string
  content: string
}

export interface DBMznData {
  data_id: string
  name: string
  content: string
}

export interface DBSolver {
  solver_id: SolverID
  name: string
  image: string
}

export type CancelSolverPromise = Promise<'cancel_solver'>
type JobID = string
type SolverID = string

export interface SolverJob {
  job_id: JobID
  solver_id: SolverID
  job: k8s.V1Job
  config_map: k8s.V1ConfigMap
}

type JobContextSolvers = {
  [key: SolverID]: {
    cancelSolver: () => void
  }
}

export interface JobContext {
  job_id: JobID
  solvers: JobContextSolvers
}

export const runningJobs: { [key: JobID]: JobContext } = {}

function createSolverCancelPromise(): {
  promise: CancelSolverPromise
  cancelFn(): void
} {
  let cancelFn = null as unknown as () => void
  const promise = new Promise<'cancel_solver'>((resolve) => {
    cancelFn = () => {
      resolve('cancel_solver')
    }
  })

  return {
    promise,
    cancelFn,
  }
}

export async function startJob(
  client: K8sClient,
  db: Client,
  job_desc: JobDesc
): Promise<SolverJob[]> {
  const configMapName = `minizinc-job-data-${job_desc.job_id}`

  let map = new k8s.V1ConfigMap()
  map.apiVersion = 'v1'
  map.kind = 'ConfigMap'
  map.metadata = {
    name: configMapName,
  }
  map.data = {
    model: job_desc.model.content,
  }
  if (job_desc.data?.data_id) map.data.data = job_desc.data.data_id

  map = (await client.core.createNamespacedConfigMap(client.ns, map)).body

  const watchers = job_desc.solvers.map(async (solver) => {
    const jobResult = await startSolverJob(client, job_desc, solver, map)

    const { cancelFn, promise: cancelPromise } = createSolverCancelPromise()

    return {
      watcher: registerJobWatch(client, db, jobResult, cancelPromise).catch(
        (err) => {
          console.warn('WARN: failed to watch job', err)
        }
      ),
      jobResult,
      cancelFn,
      solver_id: solver.solver_id,
    }
  })

  const watcherResults = await Promise.all(watchers)

  const jobContextSolvers = watcherResults.reduce<JobContextSolvers>(
    (acc, x) => {
      acc[x.solver_id] = { cancelSolver: x.cancelFn }
      return acc
    },
    {}
  )

  if (job_desc.job_id in runningJobs) {
    throw 'runningJobs should not already contain the new job'
  }

  runningJobs[job_desc.job_id] = {
    job_id: job_desc.job_id,
    solvers: jobContextSolvers,
  }

  Promise.all(watcherResults.map((x) => x.watcher)).finally(async () => {
    console.log(`Cleaning up config map for job: ${job_desc.job_id}`)
    client.core.deleteNamespacedConfigMap(configMapName, client.ns)

    delete runningJobs[job_desc.job_id]

    await db.query(
      "UPDATE jobs SET job_status = 'finished', finished_at = CURRENT_TIMESTAMP WHERE job_id = $1",
      [job_desc.job_id]
    )
  })

  return watcherResults.map((x) => x.jobResult)
}

async function startSolverJob(
  client: K8sClient,
  job_desc: JobDesc,
  solver: DBSolver,
  config_map: k8s.V1ConfigMap
): Promise<SolverJob> {
  console.log('starting solver job', solver, job_desc.job_id)

  const commandArgs = [
    'minizinc',
    '-m',
    '/tmp/mzn-model/model.mzn',
    '--output-mode',
    'json',
    '--json-stream', // stream result as newline-separated json objects
    '--intermediate-solutions', // print intermediate solutions
    '--statistics', // print statistics when the solver finishes
    '--output-time', // add output time to json objects
    '--output-objective',
    '--output-output-item',
    '--solver',
    solver.name,
    '--time-limit',
    String(1000 * 60 * 10), // timeout after 10 minutes. TODO: make this customizable
  ]

  if (job_desc.data?.data_id != null) {
    commandArgs.push('-d', '/tmp/mzn-model/model.dzn')
  }

  const jobName = `minizinc-job-${job_desc.job_id}-solver-${solver.solver_id}`
  const configMapName = config_map.metadata!.name!
  if (!configMapName) {
    throw {
      error: 'job config map not found',
      config_map,
    }
  }

  // https://kubernetes.io/docs/concepts/workloads/controllers/job/#running-an-example-job
  let job = new k8s.V1Job()
  job.apiVersion = 'batch/v1'
  job.kind = 'Job'
  job.metadata = {
    name: jobName,
  }
  job.spec = {
    backoffLimit: 0,
    ttlSecondsAfterFinished: 300, // auto-delete after 5 minutes
    template: {
      spec: {
        restartPolicy: 'Never',
        containers: [
          {
            name: 'minizinc-solver',
            image: solver.image,
            command: commandArgs,
            volumeMounts: [
              {
                name: 'mzn-model',
                mountPath: '/tmp/mzn-model',
              },
            ],
          },
        ],
        volumes: [
          {
            name: 'mzn-model',
            configMap: {
              name: configMapName,
              items: [
                {
                  key: 'model',
                  path: 'model.mzn',
                },
              ],
            },
          },
        ],
      },
    },
  }

  try {
    // send the Job object to the kubernetes API to create it
    job = (await client.batch.createNamespacedJob(client.ns, job)).body
  } catch (err) {
    client.core.deleteNamespacedConfigMap(configMapName, client.ns)
    throw {
      error: 'failed to create job',
      job_name: jobName,
      solver,
      exception: err,
    }
  }

  return {
    job_id: job_desc.job_id,
    solver_id: solver.solver_id,
    job,
    config_map,
  }
}
