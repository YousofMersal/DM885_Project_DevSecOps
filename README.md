# Test setup

Testing different tools for managing Kubernetes development.

## Current (WIP) setup / idea

- Use Google's [Skaffold](https://skaffold.dev/) for development of local pods
- Use Terraform to start all 3rd party services (Message queues, Databases, etc...)
- Skaffold has a pipeline to build and deploy to Helm charts, and has guides on how to integrate with CI/CD.
  It also has `profiles` could maybe be used for production and development environments

### How to run it

In the `./terraform/` directory run `terraform apply` to start a RabbitMQ server in Kubernetes.
And potentially other 3rd party services in the future

Run `skaffold dev` in the `./services/` directory, this starts up a `consumer` and `producer` service that automatically restarts when files change.

