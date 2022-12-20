import {describe, expect, test, beforeAll} from '@jest/globals';
import { outerGetByName, outerAddSolver, outerChangeSolver, outerDeleteSolver } from '../src/api/solversRoute'
import * as fs from 'fs';
import { IMemoryDb, newDb } from "pg-mem";
import { readdir } from 'node:fs/promises';



describe("Solver service unit test", () => {
  var db: IMemoryDb
  beforeAll(async () => {
    const migs = await readdir("migrations");
    
    db = newDb()
    migs.forEach((item) => {
      const dbText = fs.readFileSync('migrations/'+item).toString();
      db.public.many(dbText);
    })
    
  })

  test('Inserting item into database', async () => {

    expect(await outerAddSolver(2, db, "newEntry", "linkminizinc")).not.toBeNull()
  });

  test('Inserting same item into database, expecting \'null\' returned', async () => {

    expect(await outerAddSolver(2, db, "newEntry", "linkminizinc")).toBeNull()
  });

  test('Getting newly inserted item from database"', async () => {

    const dbResult = await outerGetByName(2, db, "newEntry")
    expect(JSON.stringify(dbResult)).toMatch(new RegExp('{\"name\":\"newEntry\",\"image\":\"linkminizinc\",\"solver_id\":[0-9]+}'))
  });

  test('Changing values for newly inserted item in database', async () => {

    await outerChangeSolver(2, db, "newEntry", "NewNameHere", "NewImageHere")
  });

  test('Getting newly changed item from database', async () => {

    const dbResult = await outerGetByName(2, db, "NewNameHere")
    expect(JSON.stringify(dbResult)).toMatch(new RegExp('{\"name\":\"NewNameHere\",\"image\":\"NewImageHere\",\"solver_id\":[0-9]+}'))
  });

  test('Testing that old item does not exist in database', async () => {

    const dbResult = await outerGetByName(2, db, "newEntry")
    expect(dbResult).toBeNull()
  });

  test('Deleting item from database',async () => {
    
    const dbResult = await outerDeleteSolver(2, db, "5")
  })

  test('Testing that deleted item does not exist in database', async () => {

    const dbResult = await outerGetByName(2, db, "5")
    expect(dbResult).toBeNull()
  });

  

});