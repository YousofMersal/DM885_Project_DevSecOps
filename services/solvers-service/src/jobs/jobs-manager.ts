import k8s from '@kubernetes/client-node'
import { K8sClient } from './k8s-client.js'

export interface SolverJobDescription {
  id: string
  mznModel: string
  mznData?: string
}

export async function startJob(
  client: K8sClient,
  jobDesc: SolverJobDescription
) {
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
            command: [
              'minizinc',
              '/tmp/mzn-model/model.mzn',
              '--output-mode',
              'json',
            ],
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

  return {
    job,
    configMap: map,
  }
}
