import { components } from './../../openapi-schema.d.js'
import express from 'express'
import type { Client } from 'pg'

export async function outerGetAll(db: any) {
  var q = 'SELECT * FROM solvers'

  let result = await db.query(q)

  return result.rows ?? []
}

export async function outerGetByName(
  recievedFrom: Number,
  db: any,
  name: string
) {
  var q = `SELECT * FROM solvers WHERE name = \'${name}\'`

  if (db) {
    if (recievedFrom == 1) {
      var result = (await db.query(q)).rows[0]
    } else if (recievedFrom == 2) {
      var result = (await db.public.query(q)).rows[0]
    }
  }
  if (result.length == 0) {
    return null
  }
  return result
}

export async function outerChangeSolver(
  recievedFrom: Number,
  db: any,
  name: string,
  newName: string,
  newImage: string
) {
  var q = `UPDATE solvers SET name = '${newName}', image = '${newImage}' WHERE name = '${name}';`
  var preQ = `SELECT * FROM solvers WHERE name = '${name}'`

  if (db) {
    if (recievedFrom == 1) {
      const solverCount = (await db.query(preQ)).rowCount
      if (solverCount == 0) {
        return null
      }
      var result = (await db.query(q)).rows
    } else if (recievedFrom == 2) {
      const solverCount = (await db.public.query(preQ)).rowCount
      if (solverCount == 0) {
        return null
      }
      var result = (await db.public.query(q)).rows
    }

    return result
  }
}

export async function outerAddSolver(
  recievedFrom: Number,
  db: any,
  name: string,
  image: string
) {
  var q = `INSERT INTO solvers (name, image) VALUES ('${name}', '${image}')`
  var preQ = `SELECT * FROM solvers WHERE name = '${name}'`
  if (db) {
    if (recievedFrom == 1) {
      if ((await db.query(preQ)).rowCount > 0) {
        return null
      } else {
        await db.query(q)
      }
    } else if (recievedFrom == 2) {
      if ((await db.public.query(preQ)).rowCount > 0) {
        return null
      } else {
        await db.public.query(q)
      }
    }
  }
}

export async function outerDeleteSolver(
  recievedFrom: Number,
  db: any,
  id: string
) {
  var q = `DELETE FROM solvers WHERE solver_id = '${id}';`
  var preQ = `SELECT * FROM solvers WHERE solver_id = '${id}'`

  if (db) {
    if (recievedFrom == 1) {
      const solverCount = (await db.query(preQ)).rowCount
      if (solverCount == 0) {
        return null
      }
      var result = (await db.query(q)).rows
    } else {
      const solverCount = (await db.public.query(preQ)).rowCount
      if (solverCount == 0) {
        return null
      }
      var result = (await db.public.query(q)).rows
    }

    return result
  }
}

export default (db: Client) => {
  const jobs = express.Router()

  // GET

  // Gets all solvers
  jobs.get('/', async (req, res) => {
    var dbResult = await outerGetAll(db)
    res.send(dbResult)
  })

  // Gets solver by solver name
  jobs.get('/:name', async (req, res) => {
    const name = req.params.name
    var dbResult = await outerGetByName(1, db, name)

    if (!dbResult) {
      res.send(404).send({ name: 'Not found' })
    } else {
      res.send(dbResult)
    }
  })

  // PUT

  // Changes solver
  jobs.put('/:name', async (req, res) => {
    const name = req.params.name
    const body: components['schemas']['Solver_info'] = req.body

    if (!body.name) {
      throw 'missing name'
    } else if (!body.image) {
      throw 'missing image'
    }

    const dbResult = await outerChangeSolver(1, db, name, body.name, body.image)
    if (db != null && dbResult != null) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404).send({ message: 'solver not found' })
    }
  })

  // POST

  // Add solver
  jobs.post('/', async (req, res) => {
    const body: components['schemas']['Solver_create'] = req.body

    if (!body.name) {
      throw 'Missing name'
    } else if (!body.image) {
      throw 'Missing image'
    }
    const dbResult = await outerAddSolver(1, db, body.name, body.image)
    if (dbResult == null) {
      res.sendStatus(409).send({ name: 'Already exists' })
    } else {
      res.sendStatus(201)
    }
  })

  // DELETE

  // Delete solver by solver ID
  jobs.delete('/:solver_id', async (req, res) => {
    const solver_id = req.params.solver_id

    await outerDeleteSolver(1, db, solver_id)
    if (db != null) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404).send({ message: 'solver not found' })
    }
  })

  return jobs
}
