import { components } from './../../openapi-schema.d.js'
import express from 'express'
import type { Client } from 'pg'

export default (db: Client) => {
  const jobs = express.Router()


  // GET

  // Gets all solvers
  jobs.get('/', async (req, res) => {
    res.send((await db.query('SELECT * FROM solvers')).rows)
  })

  // Gets solver by solver name
  jobs.get('/:name', async (req, res) => {
    const name = req.params.name

    const solver = (
      await db.query('SELECT * FROM solvers WHERE name = $1', [name])
    ).rows

    if (solver.length == 0) {
      return res.status(404).send({ message: 'solver not found' })
    }

    res.send(solver[0])
  })


  // PUT

  // Changes solver
  jobs.put('/:oldName', async (req, res) => {
    const oldName = req.params.oldName
    const body: components['schemas']['Solver_info'] = req.body

    if (!body.name) {
      throw 'missing name'
    } else if (!body.image) {
      throw 'missing image'
    }

    const solverCount = ((await db.query('SELECT * FROM solvers WHERE name = $1', [oldName])).rowCount)

    if (solverCount == 0) {
      return res.status(404).send({ message: 'solver not found' })
    }


    await db.query(
      'UPDATE solvers SET name = $1, image = $2 WHERE name = $3',
      [body.name, body.image, oldName]
    )

    res.sendStatus(204)
  })


  // POST

  // Add solver
  jobs.post('/', async (req, res) => {
    const body: components['schemas']['Solver_create'] = req.body

    if (!body.name) {
      throw 'missing name'
    } else if (!body.image) {
      throw 'missing image'
    }

    await db.query('INSERT INTO solvers (name, image) VALUES ($1, $2)', [
      body.name,
      body.image,
    ])

    res.sendStatus(201)
  })


  // DELETE

  // Delete solver by solver ID
  jobs.delete('/:solver_id', async (req, res) => {
    const solver_id = req.params.solver_id

    const solverCount = ((await db.query('SELECT * FROM solvers WHERE solver_id = $1', [solver_id])).rowCount)

    if (solverCount == 0) {
      return res.status(404).send({ message: 'solver not found' })
    }

    await db.query('DELETE FROM solvers WHERE solver_id = $1', [solver_id])

    res.sendStatus(204)
  })

  return jobs
}
