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
It receives Knative ApiServerSource events,[^1] when the `Jobs` status change and updates the database state accordingly.

[^1]: https://knative.dev/docs/eventing/sources/apiserversource/

# Further Documentation

This service is responsible for starting the solver jobs and handling completion and failures

## Testing

Run `skaffold dev` in from _this_ directory `./services/mzn-controller/`.

To rerun delete the dummy job with `kubectl delete job solver-job-test`, and re-save the `src/index.ts` file.

Expected output:

```sh
$ skaffold dev
[ ... ]
[mzn-controller] Minizinc controller: running
[mzn-controller] JOBS CHANGED MODIFIED solver-job-test {
[mzn-controller]   startTime: '2022-10-21T21:01:51Z',
[mzn-controller]   active: 1,
[mzn-controller]   uncountedTerminatedPods: {},
[mzn-controller]   ready: 0
[mzn-controller] }
[mzn-controller] JOBS CHANGED MODIFIED solver-job-test {
[mzn-controller]   startTime: '2022-10-21T21:01:51Z',
[mzn-controller]   active: 1,
[mzn-controller]   uncountedTerminatedPods: {},
[mzn-controller]   ready: 1
[mzn-controller] }
[mzn-controller] JOBS CHANGED MODIFIED solver-job-test {
[mzn-controller]   startTime: '2022-10-21T21:01:51Z',
[mzn-controller]   active: 1,
[mzn-controller]   uncountedTerminatedPods: {},
[mzn-controller]   ready: 0
[mzn-controller] }
[mzn-controller] JOBS CHANGED MODIFIED solver-job-test {
[mzn-controller]   startTime: '2022-10-21T21:01:51Z',
[mzn-controller]   uncountedTerminatedPods: { succeeded: [ '8cc707bc-b0d3-42fe-909e-247d5b4c8bc8' ] },
[mzn-controller]   ready: 0
[mzn-controller] }
[mzn-controller] JOBS CHANGED MODIFIED solver-job-test {
[mzn-controller]   conditions: [
[mzn-controller]     {
[mzn-controller]       type: 'Complete',
[mzn-controller]       status: 'True',
[mzn-controller]       lastProbeTime: '2022-10-21T21:01:59Z',
[mzn-controller]       lastTransitionTime: '2022-10-21T21:01:59Z'
[mzn-controller]     }
[mzn-controller]   ],
[mzn-controller]   startTime: '2022-10-21T21:01:51Z',
[mzn-controller]   completionTime: '2022-10-21T21:01:59Z',
[mzn-controller]   succeeded: 1,
[mzn-controller]   uncountedTerminatedPods: {},
[mzn-controller]   ready: 0
[mzn-controller] }
[mzn-controller] JOB FINISHED solver-job-test
[mzn-controller] JOB result: 3.141592653589793
```
