import k8s, { V1Job } from '@kubernetes/client-node'
import fs from 'fs'

// kubernetes automatically mounts this file in all Pods by default.
// the name of the namespace this pod is running in.
const ns = fs.readFileSync(
  '/var/run/secrets/kubernetes.io/serviceaccount/namespace',
  { encoding: 'utf8' }
)

// automatically load kubernetes API credentials from Pod environment
const kc = new k8s.KubeConfig()
kc.loadFromDefault()

const k8sApi = kc.makeApiClient(k8s.CoreV1Api)
const batchK8sApi = kc.makeApiClient(k8s.BatchV1Api)

// setup watcher for job events, calls callback everytime jobs are created/deleted/modified
const watch = new k8s.Watch(kc)
watch.watch(
  `/apis/batch/v1/namespaces/${ns}/jobs`,
  {},
  async (type, apiObj: V1Job, _watchObj) => {
    // only process MODIFIED events
    if (type != 'MODIFIED') {
      return
    }

    const jobName = apiObj.metadata!.name!
    const jobFinished = (apiObj.status?.succeeded ?? 0) > 0
    const jobFailed = (apiObj.status?.failed ?? 0) > 0

    console.log('JOBS CHANGED', type, jobName, apiObj.status)

    if (jobFinished) {
      console.log('JOB FINISHED', jobName)

      // get the completed Pod associated with the finished job
      const jobPod = await k8sApi.listNamespacedPod(
        ns,
        undefined,
        undefined,
        undefined,
        undefined,
        `job-name=${jobName}`
      )

      const jobPodName = jobPod.body.items.at(0)?.metadata?.name
      if (!jobPodName) throw 'pod for complete job not found'

      // read the logs of the Pod to get the result of the computation
      const result = await k8sApi.readNamespacedPodLog(jobPodName, ns)
      console.log(`JOB result: ${result.body}`)
    }

    if (jobFailed) {
      console.log('JOB FAILED', jobName)
    }
  },
  (err) => {
    console.error('Watch stream closed:', err)
  }
)

async function startJob() {
  // construct a new kubernetes Job object
  // https://kubernetes.io/docs/concepts/workloads/controllers/job/#running-an-example-job

  const job = new k8s.V1Job()
  job.apiVersion = 'batch/v1'
  job.kind = 'Job'
  job.metadata = {
    name: 'solver-job-test',
  }
  job.spec = {
    backoffLimit: 0,
    ttlSecondsAfterFinished: 10, // auto-delete after 10 seconds
    template: {
      spec: {
        restartPolicy: 'Never',
        containers: [
          {
            name: 'pi',
            image: 'perl:5.34.0',
            command: ['perl', '-Mbignum=bpi', '-wle', 'print bpi(2000)'],
            // command: ['perl', '-wle', 'sleep(2); exit(1)'], // simulate failure
          },
        ],
      },
    },
  }

  // send the Job object to the kubernetes API to create it
  await batchK8sApi.createNamespacedJob(ns, job)
}

await startJob()

console.log('Minizinc controller: running')

registerGracefulExit()
function registerGracefulExit() {
  const exit = () => {
    process.stdout.write(`shutting down gracefully...\n`)
    process.exit()
  }

  process.on('exit', exit)
  //catches ctrl+c event
  process.on('SIGINT', exit)
  process.on('SIGTERM', exit)
  // catches 'kill pid' (for example: nodemon restart)
  process.on('SIGUSR1', exit)
  process.on('SIGUSR2', exit)
}
