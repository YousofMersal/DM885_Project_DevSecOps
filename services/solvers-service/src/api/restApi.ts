import { K8sClient } from './../jobs/k8s-client.js'
import express, { Request, Response, NextFunction } from 'express'
import os from 'os'

import jobsRoute from './jobsRoute.js'
import solversRoute from './solversRoute.js'
import modelsRoute from './modelsRoute.js'
import type { Client } from 'pg'
import cors from 'cors'
import { jwtMiddleware } from '../jwt.js'
import usersRoute from './usersRoute.js'

function startRestAPI(k8sClient: K8sClient, db: Client) {
  const app = express()
  const port = process.env.PORT || 8080

  app.use(express.json())
  app.use(cors())
  app.use(jwtMiddleware())

  app.use('/api/v1/jobs', jobsRoute(k8sClient, db))
  app.use('/api/v1/solvers', solversRoute(db))
  app.use('/api/v1/models', modelsRoute(db))
  app.use('/api/v1/job-users', usersRoute(db))

  const server = app.listen(port, () => {
    console.log(
      `Solvers service started at http://${os.hostname ?? 'localhost'}:${port}`
    )
  })

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Internal server error: ', err)
    res.status(((err as any).status as number) ?? 500).send(err)
  })

  return server
}

export default startRestAPI
