/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  '/users': {
    /** List users */
    get: operations['get-user']
    /** Create user */
    post: operations['post-user']
  }
  '/users/{username}': {
    /** Get user */
    get: operations['get-users-username']
    /** Update user */
    put: operations['put-users-username']
    /** Delete user */
    delete: operations['delete-users-username']
    parameters: {
      path: {
        username: string
      }
    }
  }
  '/users/{username}/jobs/cancel': {
    /** Cancel user jobs */
    post: operations['post-users-username-jobs-cancel']
    parameters: {
      path: {
        username: string
      }
    }
  }
  '/users/login': {
    /** Login */
    post: operations['post-auth-login']
  }
  '/users/logout': {
    /** Logout */
    post: operations['post-auth-logout']
  }
  '/jobs': {
    /** List jobs */
    get: operations['get-jobs']
    /** Create job */
    post: operations['post-jobs']
  }
  '/jobs/{jobId}': {
    /** Get job */
    get: operations['get-jobs-jobId']
    /** Delete job */
    delete: operations['delete-jobs-jobId']
    parameters: {
      path: {
        jobId: string
      }
    }
  }
  '/jobs/{jobId}/result': {
    /** Get job result */
    get: operations['get-jobs-jobId-result']
    parameters: {
      path: {
        jobId: string
      }
    }
  }
  '/jobs/{jobId}/cancel': {
    /** Cancel job */
    post: operations['post-jobs-jobId-cancel']
    parameters: {
      path: {
        jobId: string
      }
    }
  }
  '/models': {
    /** List models */
    get: operations['get-models']
    /** Create model */
    post: operations['post-models']
  }
  '/models/{modelId}': {
    /** Get model */
    get: operations['get-models-modelId']
    /** Update model */
    put: operations['put-models-modelId']
    /** Delete model */
    delete: operations['delete-models-modelId']
    parameters: {
      path: {
        modelId: string
      }
    }
  }
  '/models/{modelId}/data': {
    /** List data */
    get: operations['get-models-modelId-data']
    /** Add data */
    post: operations['post-models-modelId-data']
    parameters: {
      path: {
        modelId: string
      }
    }
  }
  '/models/{modelId}/data/{dataId}': {
    /** Get data */
    get: operations['get-models-modelId-data-dataId']
    /** Update data */
    put: operations['put-models-modelId-data-dataId']
    /** Delete data */
    delete: operations['delete-models-modelId-data-dataId']
    parameters: {
      path: {
        modelId: string
        dataId: string
      }
    }
  }
  '/solvers': {
    /** List solvers */
    get: operations['get-solvers']
    /** Add solver */
    post: operations['post-solvers']
  }
  '/solvers/{solverName}': {
    /** Get solver */
    get: operations['get-solvers-solverId']
    /** Update solver */
    put: operations['put-solvers-solverId']
    /** Delete solver */
    delete: operations['delete-solvers-solverId']
    parameters: {
      path: {
        solverName: string
      }
    }
  }
}

export type webhooks = Record<string, never>

export interface components {
  schemas: {
    /** User_create */
    User_create: {
      username: string
      password: string
      email: string
    }
    /** User_info */
    User_info: {
      username?: string
      email?: string
      jobIds?: string[]
      modelIds?: string[]
    }
    /** Job_info */
    Job_info: {
      id: string
      solvers: components['schemas']['Solver_info'][]
      model_id: string
      data_id?: string
      username: string
      /** @enum {string} */
      job_status: 'waiting' | 'running' | 'finished'
    }
    /** Job_create */
    Job_create: {
      solver_ids: string[]
      model_id: string
      data_id?: string
    }
    /** Job_result */
    Job_result: {
      id?: string
      solverType?: string
      solution?: string
      solveTimeMs?: number
    }
    /** Model_info */
    Model_info: {
      id?: string
      name?: string
      content?: string
      username?: string
    }
    /** Data_info */
    Data_info: {
      id?: string
      modelId?: string
      name?: string
      content?: string
    }
    /** Data_create */
    Data_create: {
      name: string
      content: string
    }
    /** Solver_info */
    Solver_info: {
      solver_id?: string
      name?: string
      image?: string
    }
    /** Solver_create */
    Solver_create: {
      name?: string
      image?: string
    }
  }
  responses: never
  parameters: never
  requestBodies: never
  headers: never
  pathItems: never
}

export type external = Record<string, never>

export interface operations {
  'get-user': {
    /** List users */
    responses: {
      /** @description OK */
      200: {
        content: {
          'application/json': components['schemas']['User_info'][]
          'application/xml': Record<string, never>
        }
      }
      /** @description Bad Request */
      400: never
      /** @description Forbidden */
      403: never
    }
  }
  'post-user': {
    /** Create user */
    requestBody?: {
      content: {
        'application/json': components['schemas']['User_create']
      }
    }
    responses: {
      /** @description Created */
      201: never
      /** @description Forbidden */
      403: never
    }
  }
  'get-users-username': {
    /** Get user */
    responses: {
      /** @description OK */
      200: {
        content: {
          'application/json': components['schemas']['User_info']
        }
      }
    }
  }
  'put-users-username': {
    /** Update user */
    requestBody?: {
      content: {
        'application/json': components['schemas']['User_create']
      }
    }
    responses: {
      /** @description OK */
      200: never
    }
  }
  'delete-users-username': {
    /** Delete user */
    responses: {
      /** @description No Content */
      204: never
    }
  }
  'post-users-username-jobs-cancel': {
    /** Cancel user jobs */
    responses: {
      /** @description No Content */
      204: never
    }
  }
  'post-auth-login': {
    /** Login */
    requestBody?: {
      content: {
        'application/json': {
          username?: string
          password?: string
        }
      }
    }
    responses: {
      /** @description No Content */
      204: never
    }
  }
  'post-auth-logout': {
    /** Logout */
    responses: {
      /** @description No Content */
      204: never
    }
  }
  'get-jobs': {
    /** List jobs */
    responses: {
      /** @description OK */
      200: {
        content: {
          'application/json': components['schemas']['Job_info'][]
        }
      }
    }
  }
  'post-jobs': {
    /** Create job */
    requestBody?: {
      content: {
        'application/json': components['schemas']['Job_create']
      }
    }
    responses: {
      /** @description Created */
      201: never
    }
  }
  'get-jobs-jobId': {
    /** Get job */
    responses: {
      /** @description OK */
      200: {
        content: {
          'application/json': components['schemas']['Job_info']
        }
      }
    }
  }
  'delete-jobs-jobId': {
    /** Delete job */
    responses: {
      /** @description No Content */
      204: never
    }
  }
  'get-jobs-jobId-result': {
    /** Get job result */
    responses: {
      /** @description OK */
      200: {
        content: {
          'application/json': components['schemas']['Job_result']
        }
      }
    }
  }
  'post-jobs-jobId-cancel': {
    /** Cancel job */
    /** @description Specify which solvers to cancel */
    requestBody?: {
      content: {
        'application/json': string[]
      }
    }
    responses: {
      /** @description No Content */
      204: never
    }
  }
  'get-models': {
    /** List models */
    responses: {
      /** @description OK */
      200: {
        content: {
          'application/json': components['schemas']['Model_info'][]
        }
      }
    }
  }
  'post-models': {
    /** Create model */
    requestBody?: {
      content: {
        'application/json': {
          name: string
          content: string
        }
      }
    }
    responses: {
      /** @description Created */
      201: never
    }
  }
  'get-models-modelId': {
    /** Get model */
    responses: {
      /** @description OK */
      200: {
        content: {
          'application/json': components['schemas']['Model_info']
        }
      }
    }
  }
  'put-models-modelId': {
    /** Update model */
    responses: {
      /** @description Created */
      201: never
    }
  }
  'delete-models-modelId': {
    /** Delete model */
    responses: {
      /** @description No Content */
      204: never
    }
  }
  'get-models-modelId-data': {
    /** List data */
    responses: {
      /** @description OK */
      200: {
        content: {
          'application/json': components['schemas']['Data_info'][]
        }
      }
    }
  }
  'post-models-modelId-data': {
    /** Add data */
    requestBody?: {
      content: {
        'application/json': components['schemas']['Data_create']
      }
    }
    responses: {
      /** @description Created */
      201: never
    }
  }
  'get-models-modelId-data-dataId': {
    /** Get data */
    responses: {
      /** @description OK */
      200: {
        content: {
          'application/json': components['schemas']['Data_info']
        }
      }
    }
  }
  'put-models-modelId-data-dataId': {
    /** Update data */
    requestBody?: {
      content: {
        'application/json': {
          name?: string
          content?: string
        }
      }
    }
    responses: {
      /** @description OK */
      200: never
    }
  }
  'delete-models-modelId-data-dataId': {
    /** Delete data */
    responses: {
      /** @description No Content */
      204: never
    }
  }
  'get-solvers': {
    /** List solvers */
    responses: {
      /** @description OK */
      200: {
        content: {
          'application/json': components['schemas']['Solver_info'][]
        }
      }
    }
  }
  'post-solvers': {
    /** Add solver */
    requestBody?: {
      content: {
        'application/json': components['schemas']['Solver_info']
      }
    }
    responses: {
      /** @description Created */
      201: never
    }
  }
  'get-solvers-solverId': {
    /** Get solver */
    responses: {
      /** @description OK */
      200: {
        content: {
          'application/json': components['schemas']['Solver_info']
        }
      }
    }
  }
  'put-solvers-solverId': {
    /** Update solver */
    requestBody?: {
      content: {
        'application/json': components['schemas']['Solver_info']
      }
    }
    responses: {
      /** @description OK */
      200: never
    }
  }
  'delete-solvers-solverId': {
    /** Delete solver */
    responses: {
      /** @description No Content */
      204: never
    }
  }
}
