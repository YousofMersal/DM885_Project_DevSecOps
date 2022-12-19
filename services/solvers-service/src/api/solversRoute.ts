import { components } from './../../openapi-schema.d.js'
import express from 'express'
import type { Client } from 'pg'


export async function outerGetAll(db: any) {
  var q = "SELECT * FROM solvers"

  if (db){
    if(db.type == "IMemoryDb"){
      result = await db.query(q).rows
    }

    var result = await db.query(q).rows

    return result
  }
}

export async function outerGetByName(db: any, name: string){
  var q = `SELECT * FROM solvers WHERE name = \'${name}\'`
  var result = "VOID"
  if (db){
    if(db.type == "Client"){
      result = await db.query(q).rows
    }
    else{
      result = await db.public.query(q).rows
    }
    if(result.length == 0){
     return ""   
    }
  
    return result
  }
}

export async function outerChangeSolver(db: any, name: string, newName: string, newImage: string){
  var q = `UPDATE solvers SET name = '${newName}', image = '${newImage}' WHERE name = '${name}';`
  var preQ = `SELECT * FROM solvers WHERE name = '${name}'`
  var result = "VOID"

  if (db){

    if(db.type == "Client"){
      const solverCount = ((await db.query(preQ)).rowCount)
      if (solverCount == 0) {
        return null
      }
      result = await db.query(q).rows
    }
    else{
      const solverCount = ((await db.public.query(preQ)).rowCount)
      if (solverCount == 0) {
        return null
      }
      result = await db.public.query(q).rows
    }
  
    return result
  }
}

export async function outerAddSolver(db: any, name: string, image: string){
  var q = `INSERT INTO solvers (name, image) VALUES ('${name}', '${image}')`
  var result = "VOID"
  if (db){
    if(db.type == "Client"){
      result = await db.query(q)
    }
    else{
      result = await db.public.query(q)
    }
  }
}

export async function outerDeleteSolver(db: any, id: string){
  var q = `DELETE FROM solvers WHERE solver_id = '${id}';`
  var preQ = `SELECT * FROM solvers WHERE solver_id = '${id}'`
  var result = "VOID"

  if (db){
    
    if(db.type == "Client"){
      const solverCount = ((await db.query(preQ)).rowCount)
      if (solverCount == 0) {
        return null
      }
      result = await db.query(q).rows
    }
    else{
      const solverCount = ((await db.public.query(preQ)).rowCount)
      if (solverCount == 0) {
        return null
      }
      result = await db.public.query(q).rows
    }
  
    return result
  }
}


export default (db: Client) => {
  const jobs = express.Router()

  // GET

  // Gets all solvers
  jobs.get('/', async (req, res) => {
    //var dbResult = outerGetAll(db)
    res.send((await db.query("SELECT * FROM solvers")).rows)
  })

  // Gets solver by solver name
  jobs.get('/:name', async (req, res) => {
    const name = req.params.name
    var dbResult = outerGetByName(db, name)
    res.send(dbResult)
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

    const dbResult = outerChangeSolver(db, name, body.name, body.image)
    if(db != null && await dbResult != ""){
      res.sendStatus(204)
    }
    else{
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
    var dbResult = outerAddSolver(db, body.name, body.image)

    res.sendStatus(201)
  })


  // DELETE

  // Delete solver by solver ID
  jobs.delete('/:solver_id', async (req, res) => {
    const solver_id = req.params.solver_id

    const dbResult = outerDeleteSolver(db, solver_id)
    if(db != null){
      res.sendStatus(204)
    }
    else{
      res.sendStatus(404).send({ message: 'solver not found' })
    }
 })

  return jobs
}