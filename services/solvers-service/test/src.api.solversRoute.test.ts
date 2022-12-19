import {describe, expect, test, beforeAll} from '@jest/globals';
import { outerGetByName, outerAddSolver, outerChangeSolver, outerDeleteSolver } from '../src/api/solversRoute'
import * as fs from 'fs';
import { IMemoryDb, newDb } from "pg-mem";
import { readdir } from 'node:fs/promises';



describe("Solver service unit test", () => {
  var db: IMemoryDb
  beforeAll(async () => {
    const str = await readdir("migrations");
    const dbText = fs.readFileSync('migrations/'+str[str.length-1]).toString();
    db = newDb()
    db.public.many(dbText);
  })

  test('Inserting into DB"', async () => {

    await outerAddSolver(db, "newEntry", "linkminizinc")
  });

  test('Getting newly inserted item from DB"', async () => {

    const dbResult = await outerGetByName(db, "newEntry")
    expect(JSON.stringify(dbResult?.at(0))).toMatch(new RegExp('{\"name\":\"newEntry\",\"image\":\"linkminizinc\",\"solver_id\":[0-9]+}'))
  });

  test('Changing values for newly inserted item in DB', async () => {

    await outerChangeSolver(db, "newEntry", "NewNameHere", "NewImageHere")
  });

  test('Getting newly changed item from DB', async () => {

    const dbResult = await outerGetByName(db, "NewNameHere")
    expect(JSON.stringify(dbResult?.at(0))).toMatch(new RegExp('{\"name\":\"NewNameHere\",\"image\":\"NewImageHere\",\"solver_id\":[0-9]+}'))
  });

  test('Showing that old item does not exist', async () => {

    const dbResult = await outerGetByName(db, "newEntry")
    expect(dbResult?.length).toBe(0)
  });

  test('Deleting item from DB',async () => {
    
    const dbResult = await outerDeleteSolver(db, "5")
  })

  test('Showing that deleted item does not exist', async () => {

    const dbResult = await outerGetByName(db, "5")
    expect(dbResult?.length).toBe(0)
  });

  

});