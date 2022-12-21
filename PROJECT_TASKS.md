
#REQS

## Complete
### User
- Create its own profile that can be access with a username and password
- Create, read, update and delete a .mzn instance
- Create, read, update and delete a .dzn instance
- List the name of the solvers supported
- trigger the execution of one or more solvers (to be executed in a concurrent way)
  giving the id of the mzn and dzn instances (only mzn if dzn is not needed),
  selecting the solvers to use and their options,
  the timeout, maximal amount of memory that can be used, number of vCPUs to use.
  When the first solver terminates finding the optimal value, all the other solver in parallel
  must be terminated
- Monitor the termination state of the solver execution returning if one of the 
  solvers have found the optimum, if a solution has been found but the solvers are
  still trying to prove the optimality (i.e., no "==========" in the solution) or
  if the solvers are running but they did not even found a solution
  (i.e., no "----------" in the solution)
- Given a computaton request, retrieve its result if terminated, what solver
  manage to solve it first and the time it took to solve it
- Cancel the execution of a computation request (terminate all the solvers 
  running for the request, delete the result otherwise)
- Stop a solver for a specific request  (e.g., if a request required to use solver
  A and B, you can stop to execute solver A letting B to continue)
- Minimal GUI support
### Admin
- Kill all solver executions started by a user
- Set resources quota to users (e.g., no more than 6 vCPUs in total for user X)
- Delete a user and all his/her data
- Add or remove a solver. It is possible to assume that the solver to add
  satisfy the submission rules of the MiniZinc challenge (note also that you have to handle
  the case when a users asks to use a removed solver)
- A user should have a maximal predefined amount of computational resources that he or she can use (e.g., 6 vCPUs).
### Developer
- Use continuous integration and deployment
- Infrastructure as a Code with an automatic DevOps pipeline
- Scalable, supporting multiple users exploiting if needed more resources in the
  cloud (note: vcpus allocated to a run depending on the parameter "-p")
- Provide user stories to explain how the system is intended to be use
- Provide minimal documentation to deploy and run the system

## Partially complete

### User
### Admin
### Developer
- Have tests to test the system (unit test, integration, ...)
- Security (proper credential management and common standard security practices
  enforced)
- Fairness: if the resources do not allow to run all the solvers at the same time
  the jobs should be delayed and executed fairly (e.g. FIFO).
  User should therefore not wait  indefinitely to run their jobs (optional).

## Not done
### User
### Admin
- Monitor and log the platform using a dashboard
- Deploy the system and add new computing nodes in an easy way
- When this threashold is passed, requests
  should be serialized instead of all running in parallel. If the maximal amount
  of computational resources will not allow to execute a request (e.g., asking to
  solve a problem with 7 different solvers in prallel when he or she can use only
  6 vCPUs) then the request should not be accepted.
### Developer
