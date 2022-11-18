// setup watcher for job events, calls callback everytime jobs are created/deleted/modified
// const watch = new k8s.Watch(kc)
// watch.watch(
//   `/apis/batch/v1/namespaces/${ns}/jobs`,
//   {},
//   async (type, apiObj: V1Job, _watchObj) => {
//     // only process MODIFIED events
//     if (type != 'MODIFIED') {
//       return
//     }

//     const jobName = apiObj.metadata!.name!
//     const jobFinished = (apiObj.status?.succeeded ?? 0) > 0
//     const jobFailed = (apiObj.status?.failed ?? 0) > 0

//     console.log('JOBS CHANGED', type, jobName, apiObj.status)

//     if (jobFinished) {
//       console.log('JOB FINISHED', jobName)

//       // get the completed Pod associated with the finished job
//       const jobPod = await k8sApi.listNamespacedPod(
//         ns,
//         undefined,
//         undefined,
//         undefined,
//         undefined,
//         `job-name=${jobName}`
//       )

//       const jobPodName = jobPod.body.items.at(0)?.metadata?.name
//       if (!jobPodName) throw 'pod for complete job not found'

//       // read the logs of the Pod to get the result of the computation
//       const result = await k8sApi.readNamespacedPodLog(jobPodName, ns)
//       console.log(`JOB result: ${result.body}`)
//     }

//     if (jobFailed) {
//       console.log('JOB FAILED', jobName)
//     }
//   },
//   (err) => {
//     console.error('Watch stream closed:', err)
//   }
// )
