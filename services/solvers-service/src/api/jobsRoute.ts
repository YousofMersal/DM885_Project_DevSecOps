import { K8sClient } from './../jobs/k8s-client.js'
import express from 'express'
import { startJob } from '../jobs/jobs-manager.js'
import { randomUUID } from 'crypto'

export default (client: K8sClient) => {
  const jobs = express.Router()

  jobs.post('/start', async (req, res) => {
    console.log('Starting solver job requested')

    try {
      const { job } = await startJob(client, {
        id: randomUUID(),
        mznModel: `
        % Colouring Australia using nc colours
        int: nc = 3;

        var 1..nc: wa;   var 1..nc: nt;  var 1..nc: sa;   var 1..nc: q;
        var 1..nc: nsw;  var 1..nc: v;   var 1..nc: t;

        constraint wa != nt;
        constraint wa != sa;
        constraint nt != sa;
        constraint nt != q;
        constraint sa != q;
        constraint sa != nsw;
        constraint sa != v;
        constraint q != nsw;
        constraint nsw != v;
        solve satisfy;

        output ["wa=\\(wa)\\t nt=\\(nt)\\t sa=\\(sa)\\n",
                "q=\\(q)\\t nsw=\\(nsw)\\t v=\\(v)\\n",
                "t=", show(t),  "\\n"];
      `,
      })

      res.send({
        status: 'starting a job',
        jobName: job.metadata?.name,
      })
    } catch (e) {
      res.status(500).send({
        status: 'failed to start job',
        error: e,
      })
    }
  })

  jobs.use('*', (req, res) => {
    res.send({
      msg: `Solvers service /jobs: ${req.path} ${req.method}`,
      env: process.env.NODE_ENV,
      time: Date.now(),
    })
  })

  return jobs
}
