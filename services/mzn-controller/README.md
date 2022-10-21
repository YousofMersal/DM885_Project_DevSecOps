# Minizinc solver controller service

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
