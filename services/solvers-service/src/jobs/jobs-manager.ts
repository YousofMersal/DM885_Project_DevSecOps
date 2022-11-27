import k8s from '@kubernetes/client-node'
import { registerJobWatch } from './job-watcher.js'
import { K8sClient } from './k8s-client.js'

export interface SolverJobDescription {
  id: string
  mznModel: string
  mznData?: string
}

export interface SolverJob {
  id: string
  job: k8s.V1Job
  configMap: k8s.V1ConfigMap
}

export async function startJob(
  client: K8sClient,
  jobDesc: SolverJobDescription
): Promise<SolverJob> {
  const configMapName = `minizinc-job-data-${jobDesc.id}`
  const jobName = `minizinc-job-${jobDesc.id}`

  let map = new k8s.V1ConfigMap()
  map.apiVersion = 'v1'
  map.kind = 'ConfigMap'
  map.metadata = {
    name: configMapName,
  }
  map.data = {
    model: jobDesc.mznModel,
  }
  if (jobDesc.mznData) map.data.data = jobDesc.mznData

  map = (await client.core.createNamespacedConfigMap(client.ns, map)).body

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
  ]

  if (jobDesc.mznData != null) {
    commandArgs.push('-d', '/tmp/mzn-model/model.dzn')
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
            image: 'minizinc/minizinc:latest',
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
    throw err
  }

  const jobResult = {
    id: jobDesc.id,
    job,
    configMap: map,
  }

  registerJobWatch(client, jobResult)
    .catch((err) => {
      console.warn('WARN: failed to watch job', err)
    })
    .finally(() => {
      console.log(`Cleaning up config map for job: ${jobDesc.id}`)
      client.core.deleteNamespacedConfigMap(configMapName, client.ns)
    })

  return jobResult
}
