import { components } from './../../openapi-schema.d.js'
import {
  DBMznModel,
  DBMznData,
} from './../jobs/jobs-manager.js'
import express from 'express'
import { Client } from 'pg'

export default (db: Client) => {
  const models = express.Router()

  models.get('/', async (req, res) => {
    const models = (await db.query('SELECT * FROM mzn_models')).rows

    res.send(models)
  })

  models.get<{ model_id: string }>('/:model_id', async (req, res) => {
    const model_id = req.params.model_id

    const models = await (
      await db.query('SELECT * FROM mzn_models WHERE model_id = $1', [model_id])
    ).rows

    if (models.length == 0) {
      return res.status(404).send({ message: 'model not found' })
    }

    res.send(models[0])
  })

  models.post('/', async (req, res) => {
    if (!req.body.name) {
      throw 'missing `name`'
    }

    if (!req.body.content) {
      throw 'missing `content`'
    }
   
    let model = {} as DBMznModel
    model = (
      await db.query(
        "INSERT INTO mzn_models (name, content) VALUES ($1, $2)",
        [req.body.name, req.body.content]
      )
    ).rows[0]

    res.status(201).send({
      status: 'created',
      model: model
    })
  })

  models.put<{ model_id: string }>('/:model_id', async (req, res) => {
    const model_id = req.params.model_id

    if (!req.body.name) {
      throw 'missing name'
    } else if (!req.body.content) {
      throw 'missing content'
    }

    await db.query(
      'UPDATE mzn_models SET name = $1, content = $2 WHERE model_id = $3',
      [req.body.name, req.body.content, model_id]
    )

    res.sendStatus(204)
  })

  models.delete<{ model_id: string }>('/:model_id', async (req, res) => {
    const model_id = req.params.model_id

    const models = await (
      await db.query('DELETE FROM mzn_models WHERE model_id = $1 RETURNING *', [model_id])
    ).rows

    if (models.length == 0) {
      return res.status(404).send({ message: 'model not found' })
    }

    res.send({
      message: 'model deleted',
      model: models[0],
    })
  })

  models.get<{ model_id: string }>('/:model_id/data', async (req, res) => {
    const model_id = req.params.model_id

    const data = (await db.query('SELECT * FROM mzn_data WHERE model_id = $1', [model_id])).rows

    res.send(data)
  })

  models.get<{ model_id: string, data_id: string }>('/:model_id/data/:data_id', async (req, res) => {
    const model_id = req.params.model_id
    const data_id = req.params.data_id

    const data = await (
      await db.query('SELECT * FROM mzn_data WHERE model_id = $1 AND data_id = $2', [model_id, data_id])
    ).rows

    if (data.length == 0) {
      return res.status(404).send({ message: 'data not found' })
    }

    res.send(data[0])
  })

  models.post<{ model_id: string }>('/:model_id/data', async (req, res) => {
    if (!req.body.name) {
      throw 'missing `name`'
    }

    if (!req.body.content) {
      throw 'missing `content`'
    }
   
    const data = (
      await db.query(
        "INSERT INTO mzn_data (model_id, name, content) VALUES ($1, $2, $3)",
        [req.params.model_id, req.body.name, req.body.content]
      )
    ).rows[0]

    res.status(201).send({
      status: 'created',
      data: data
    })
  })

  models.put<{ model_id: string, data_id: string }>('/:model_id/data/:data_id', async (req, res) => {
    const model_id = req.params.model_id
    const data_id = req.params.data_id

    if (!req.body.name) {
      throw 'missing name'
    } else if (!req.body.content) {
      throw 'missing content'
    }

    await db.query(
      'UPDATE mzn_data SET name = $1, content = $2 WHERE model_id = $3 AND data_id = $4',
      [req.body.name, req.body.content, model_id, data_id]
    )

    res.sendStatus(204)
  })

  models.delete<{ model_id: string, data_id: string }>('/:model_id/data/:data_id', async (req, res) => {
    const model_id = req.params.model_id
    const data_id = req.params.data_id

    const data = await (
      await db.query('DELETE FROM mzn_data WHERE model_id = $1 AND data_id = $2 RETURNING *', [model_id, data_id])
    ).rows

    if (data.length == 0) {
      return res.status(404).send({ message: 'data not found' })
    }

    res.send({
      message: 'data deleted',
      model: data[0],
    })
  })

  models.use('*', (req, res) => {
    res.send({
      msg: `Solvers service /models: ${req.path} ${req.method}`,
      env: process.env.NODE_ENV,
      time: Date.now(),
    })
  })

  return models
}
