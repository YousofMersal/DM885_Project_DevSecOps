import { components } from './../../openapi-schema.d.js'
import express from 'express'
import { Client } from 'pg'

export interface DBUser {
  user_id: string
  cpu_limit: number
  mem_limit: number
}

export async function outerGetAll(db: Client) {
  var q = 'SELECT * FROM user_data'
  let result = await db.query<DBUser>(q)
  return result.rows ?? []
}

export async function outerGetByUserId(
  receivedFrom: Number,
  db: any,
  userId: string
) {
  var q = `SELECT * FROM user_data WHERE user_id = '$1'`

  if (db) {
    if (receivedFrom == 1) {
      var result = (await db.query(q, [userId])).rows[0]
    } else if (receivedFrom == 2) {
      var result = (await db.public.query(q, [userId])).rows[0]
    }
  }

  if (result == undefined) {
    return null
  }
  return result
}

export async function outerChangeUser(
  receivedFrom: Number,
  db: any,
  userId: string,
  newCpuLimit: Number,
  newMemoryLimit: Number
) {
  var q = `UPDATE user_data SET cpu_limit = $1, mem_limit = $2 WHERE user_id = $3;`
  var preQ = `SELECT * FROM user_data WHERE user_id = $1;`

  if (db) {
    if (receivedFrom == 1) {
      const userCount = (await db.query(preQ, [userId])).rowCount
      if (userCount == 0) {
        return null
      }
      var result = (await db.query(q, [newCpuLimit, newMemoryLimit, userId]))
        .rows
    } else if (receivedFrom == 2) {
      const userCount = (await db.public.query(preQ, [userId])).rowCount
      if (userCount == 0) {
        return null
      }
      var result = (
        await db.public.query(q, [newCpuLimit, newMemoryLimit, userId])
      ).rows
    }

    return result
  }
}

export async function outerDeleteUser(
  receivedFrom: Number,
  db: any,
  userId: string
) {
  var q = `DELETE FROM user_data WHERE user_id = '$1';`
  var preQ = `SELECT * FROM user_data WHERE user_id = '$1';`

  if (db) {
    if (receivedFrom == 1) {
      const userCount = (await db.query(preQ, [userId])).rowCount
      if (userCount == 0) {
        return null
      }
      var result = (await db.query(q, [userId])).rows
    } else {
      const userCount = (await db.public.query(preQ, [userId])).rowCount
      if (userCount == 0) {
        return null
      }
      var result = (await db.public.query(q, [userId])).rows
    }

    return result
  }
}

export default (db: Client) => {
  const users = express.Router()

  users.get('/', async (req, res) => {
    var dbResult = await outerGetAll(db)
    res.send(dbResult)
  })

  users.get<{ user_id: string }>('/:user_id', async (req, res) => {
    const user_id = req.params.user_id
    var dbResult = await outerGetByUserId(1, db, user_id)

    if (!dbResult) {
      res.send(404).send({ user_id: 'Not found' })
    } else {
      res.send(dbResult)
    }
  })

  users.put<{ user_id: string }>('/:user_id', async (req, res) => {
    const user_id = req.params.user_id

    type ReqBody = {
      user_id: string
      cpu_limit: Number
      mem_limit: Number
    }

    const body: ReqBody = req.body

    if (!body.cpu_limit) {
      throw 'missing cpu_limit'
    } else if (!body.mem_limit) {
      throw 'missing mem_limit'
    }

    const dbResult = await outerChangeUser(
      1,
      db,
      user_id,
      body.cpu_limit,
      body.mem_limit
    )
    if (db != null && dbResult != null) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404).send({ message: 'user not found' })
    }
  })

  users.delete<{ user_id: string }>('/:user_id', async (req, res) => {
    const user_id = req.params.user_id
    await outerDeleteUser(1, db, user_id)
    if (db != null) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404).send({ message: 'solver not found' })
    }
  })

  users.use('*', (req, res) => {
    res.send({
      msg: `Solvers service /job-users: ${req.path} ${req.method}`,
      env: process.env.NODE_ENV,
      time: Date.now(),
    })
  })

  return users
}
