import { describe, expect, test, beforeAll } from '@jest/globals'
import {
  outerGetByUserId,
  outerChangeUser,
  outerDeleteUser,
} from '../src/api/usersRoute'
import * as fs from 'fs'
import { IMemoryDb, newDb } from 'pg-mem'
import { readdir } from 'node:fs/promises'

describe('Solver service unit test on users routes', () => {
  var db: IMemoryDb
  beforeAll(async () => {
    const migs = await readdir('migrations')

    db = newDb()
    migs.forEach((item) => {
      const dbText = fs.readFileSync('migrations/' + item).toString()
      db.public.many(dbText)
    })
  })

  test('Inserting item into database', async () => {

    expect(db.public.query('INSERT INTO user_data (user_id) VALUES (\'testUserId\')'))
  })

  test('Checking item is correctly inserted, and default values are set properly', async () => {
    const dbResult = await outerGetByUserId(2, db, "testUserId")
    expect(dbResult["cpu_limit"]).toBe(4)
    expect(dbResult["mem_limit"]).toBe(100)
    expect(dbResult["user_id"]).toBe("testUserId")
  })

  test('Changing user limits', async () => {
    await outerChangeUser(2, db, "testUserId", 2, 50)
  })

  test('Checking changes on user was made in database', async () => {
    const dbResult = await outerGetByUserId(2, db, "testUserId")
    expect(dbResult["cpu_limit"]).toBe(2)
    expect(dbResult["mem_limit"]).toBe(50)
    expect(dbResult["user_id"]).toBe("testUserId")
  })


  test('Delete user from database', async () => {
    const dbResult = await outerDeleteUser(2, db, "testUserId")
    expect(dbResult).not.toBeNull()
  })

  test('Testing that deleted user no longer exists in database', async () => {
    const dbResult = await outerGetByUserId(2, db, "testUserId")
    expect(dbResult).toBeNull()
  })

})
