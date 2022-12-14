import { DBUser } from './../api/usersRoute.js'
import { Client } from 'pg'
import k8s from '@kubernetes/client-node'
import { registerJobWatch } from './job-watcher.js'
import { K8sClient } from './k8s-client.js'
import { StartJobBodySolver } from '../api/jobsRoute.js'

export interface JobDesc {
  job_id: JobID
  model: DBMznModel
  data?: DBMznData
  dbSolvers: DBSolver[]
  reqSolvers: StartJobBodySolver[]
  user: DBUser
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
  console.log('start job begin', job_desc.job_id, job_desc.reqSolvers)
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
  if (job_desc.data?.data_id) {
    map.data.data = job_desc.data.content
  } else {
    map.data.data = ''
  }

  console.log('creating config map for job')
  map = (await client.core.createNamespacedConfigMap(client.ns, map)).body
  console.log('created config map for job')

  const watchers = job_desc.dbSolvers.map(async (dbSolver) => {
    const reqSolver = job_desc.reqSolvers.find(
      (x) => x.solver_id == dbSolver.solver_id
    )
    if (!reqSolver) throw 'could not find matching reqSolver'

    const jobResult = await startSolverJob(
      client,
      job_desc,
      dbSolver,
      reqSolver,
      map
    )

    const { cancelFn, promise: cancelPromise } = createSolverCancelPromise()

    return {
      watcher: registerJobWatch(client, db, jobResult, cancelPromise).catch(
        (err) => {
          console.warn('WARN: failed to watch job', err)
        }
      ),
      jobResult,
      cancelFn,
      solver_id: dbSolver.solver_id,
    }
  })

  console.log('waiting for all solver jobs to start')
  const watcherResults = await Promise.all(watchers)
  console.log('all solver jobs started')

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

  // when all done clean up in the background (no await)
  Promise.all(watcherResults.map((x) => x.watcher)).finally(async () => {
    console.log(`Cleaning up config map for job: ${job_desc.job_id}`)
    await client.core.deleteNamespacedConfigMap(configMapName, client.ns)

    delete runningJobs[job_desc.job_id]

    await db.query(
      "UPDATE jobs SET job_status = 'finished', finished_at = CURRENT_TIMESTAMP WHERE job_id = $1",
      [job_desc.job_id]
    )
    console.log(`Successfully cleaned config map for job: ${job_desc.job_id}`)
  })

  return watcherResults.map((x) => x.jobResult)
}

async function startSolverJob(
  client: K8sClient,
  job_desc: JobDesc,
  dbSolver: DBSolver,
  reqSolver: StartJobBodySolver,
  config_map: k8s.V1ConfigMap
): Promise<SolverJob> {
  console.log('starting solver job', dbSolver, reqSolver, job_desc.job_id)
  console.log('Job data', job_desc.data)

  const commandArgs = [
    'minizinc',
    '-m',
    '/tmp/mzn-model/model.mzn',
    '-d',
    '/tmp/mzn-model/model.dzn',
    '--output-mode',
    'json',
    '--json-stream', // stream result as newline-separated json objects
    '--intermediate-solutions', // print intermediate solutions
    '--statistics', // print statistics when the solver finishes
    '--output-time', // add output time to json objects
    '--output-objective',
    '--output-output-item',
    '--solver',
    dbSolver.name,
    '-p',
    String(reqSolver.cpus),
    '--time-limit',
    String(reqSolver.timeout),
  ]

  // if (job_desc.time_limit) {
  //   commandArgs.push('--time-limit', String(job_desc.time_limit))
  // }
  
  // if (job_desc.data?.data_id != null) {
  //   commandArgs.push('-d', '/tmp/mzn-model/model.dzn')
  // }

  const configMapName = config_map.metadata?.name
  if (!configMapName) {
    throw {
      error: 'job config map not found',
      config_map,
    }
  }

  console.log('Creating job for user', job_desc.user)

  // https://kubernetes.io/docs/concepts/workloads/controllers/job/#running-an-example-job
  let job = new k8s.V1Job()
  job.apiVersion = 'batch/v1'
  job.kind = 'Job'
  job.metadata = {
    name: jobName(job_desc.job_id, dbSolver.solver_id),
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
            image: dbSolver.image,
            command: commandArgs,
            resources: {
              limits: {
                cpu: String(reqSolver.cpus),
                memory: `${reqSolver.memory}Mi`,
              },
              requests: {
                cpu: '100m',
                memory: '10Mi',
              },
            },
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
                {
                  key: 'data',
                  path: 'model.dzn',
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
    console.log('Starting job', job)
    job = (await client.batch.createNamespacedJob(client.ns, job)).body
  } catch (err) {
    client.core.deleteNamespacedConfigMap(configMapName, client.ns)
    throw {
      error: 'failed to create job',
      job_name: jobName,
      solver: dbSolver,
      exception: err,
    }
  }

  return {
    job_id: job_desc.job_id,
    solver_id: dbSolver.solver_id,
    job,
    config_map,
  }
}

export async function stopSolverJob(client: K8sClient, job_id: string) {
  if (!(job_id in runningJobs)) {
    return
  }

  const promises = Object.keys(runningJobs[job_id].solvers).map((solver_id) => {
    client.batch.deleteNamespacedJob(jobName(job_id, solver_id), client.ns)
  })

  try {
    await Promise.all(promises)
  } catch (e) {
    throw {
      error: `failed to stop solver job: ${job_id}`,
      exception: e,
    }
  }
}

function jobName(job_id: string, solver_id: string): string {
  return `minizinc-job-${job_id}-solver-${solver_id}`
}
