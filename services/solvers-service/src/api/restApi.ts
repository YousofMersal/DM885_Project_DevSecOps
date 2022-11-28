import { K8sClient } from './../jobs/k8s-client.js'
import express from 'express'
import os from 'os'

import jobsRoute from './jobsRoute.js'
import solversRoute from './solversRoute.js'
import modelsRoute from './modelsRoute.js'

function startRestAPI(k8sClient: K8sClient) {
  const app = express()
  const port = process.env.PORT || 8080

  app.use('/api/v1/jobs', jobsRoute(k8sClient))
  app.use('/api/v1/solvers', solversRoute())
  app.use('/api/v1/models', modelsRoute())

  const server = app.listen(port, () => {
    console.log(
      `Solvers service started at http://${os.hostname ?? 'localhost'}:${port}`
    )
  })

  return server
}

export default startRestAPI