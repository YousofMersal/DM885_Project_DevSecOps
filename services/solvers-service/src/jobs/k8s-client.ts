import k8s from '@kubernetes/client-node'
import fs from 'fs'

/** Kubernetes client object, used to interact with the Kubernetes environment and manage Kuberentes resources */
export interface K8sClient {
  /** Kubernetes namespace of the running Pod */
  ns: string

  /** Preconfigured KubeConfig object */
  kc: k8s.KubeConfig

  /** Object for interacting with Kubernetes Core API */
  core: k8s.CoreV1Api

  /** Object for interacting with Kubernetes Batch API for Jobs etc. */
  batch: k8s.BatchV1Api
}

export async function configureK8sClient(): Promise<K8sClient> {
  // kubernetes automatically mounts this file in all Pods by default.
  // the name of the namespace this pod is running in.
  const ns = await fs.promises.readFile(
    '/var/run/secrets/kubernetes.io/serviceaccount/namespace',
    { encoding: 'utf8' }
  )

  if (!ns) throw 'Could not determine Pod namespace'

  // automatically load kubernetes API credentials from Pod environment
  const kc = new k8s.KubeConfig()
  kc.loadFromDefault()

  const k8sApi = kc.makeApiClient(k8s.CoreV1Api)
  const batchK8sApi = kc.makeApiClient(k8s.BatchV1Api)

  return {
    ns,
    kc,
    core: k8sApi,
    batch: batchK8sApi,
  }
}
