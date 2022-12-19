# Solvers service

This micro service is responsible for handling the part of the REST API that handles the following:

- Creating, deleting, updating MiniZinc models and datafiles (.mzn, .dzn files)
- Starting, stopping, monitoring solver jobs
- Getting results of completed solver jobs
- Adding, removing solver images

## General architecture

This service consists of a web server that serves a REST API.
It is connected to a database that stores info about jobs, models and solvers.
It uses the Kubernetes API to start new `Jobs` inside Kubernetes which runs the actual solvers
It uses the Kubernetes API to read logs from the running solvers and saves the results to the database.

## API Examples

Request:

```http
POST /api/v1/jobs/ HTTP/1.1
Content-Type: application/json
Host: project.127.0.0.1.sslip.io

{"model_id":"1","solver_ids":["1","2"],"data_id":""}
```

Response:

```http
HTTP/1.1 201 Created

{"status":"starting job","job_id":"8265ed3e-8f52-4d08-86da-4ea571197869"}
```

### Jobs kan listes

Request:

```http
GET /api/v1/jobs/ HTTP/1.1
Host: project.127.0.0.1.sslip.io
```

Response:

```http
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8

[{"job_id":"8265ed3e-8f52-4d08-86da-4ea571197869","model_id":1,"data_id":null,"created_at":"2022-12-04T13:07:45.121Z","finished_at":"2022-12-04T13:07:52.256Z","job_status":"finished"},{"job_id":"04637593-d799-4c8d-97da-289579f890c3","model_id":1,"data_id":null,"created_at":"2022-12-04T13:15:31.190Z","finished_at":null,"job_status":"running"},{"job_id":"8cbd1d99-bffb-46ba-8791-902dbc32715c","model_id":1,"data_id":null,"created_at":"2022-12-04T13:15:32.414Z","finished_at":null,"job_status":"running"}]
```

### Hent specifikt job

Request:

```http
GET /api/v1/jobs/8cbd1d99-bffb-46ba-8791-902dbc32715c HTTP/1.1
Host: project.127.0.0.1.sslip.io
```

Response:

```http
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8

{"job_id":"8cbd1d99-bffb-46ba-8791-902dbc32715c","model_id":1,"data_id":null,"created_at":"2022-12-04T13:15:32.414Z","finished_at":null,"job_status":"running"}
```

### Slet job

Request:

```http
DELETE /api/v1/jobs/8cbd1d99-bffb-46ba-8791-902dbc32715c HTTP/1.1
Host: project.127.0.0.1.sslip.io
```

Response:

```http
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8

{"message":"job deleted","job":{"job_id":"387975a7-a4ae-4a1d-88e6-8fba65b1c757","model_id":1,"data_id":null,"created_at":"2022-12-04T13:05:12.166Z","finished_at":null,"job_status":"running"}}
```
