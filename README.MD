# DM885 MiniZinc solver service DevOps

## General project structure

- Use Google's [Skaffold](https://skaffold.dev/) for development of local pods
- Use Terraform to start all 3rd party services (Message queues, Databases, etc...)
- Skaffold has a pipeline to build and deploy to Helm charts, and has guides on how to integrate with CI/CD.
  It also has `profiles` could maybe be used for production and development environments

## Local development

Testing different tools for managing Kubernetes development.

### How to run it

- Make sure Minikube is running `minikube start`.
  Then make sure the tunnel is running by running `minikube tunnel` in a separate terminal.

- In the `./terraform/development` directory:

  - run `terraform init`
  - run `terraform apply` to start 3rd party dependencies
  - wait for it to completeley finish without errors before proceeding.

- Before starting the local services set the `PROJECT_DOMAIN` environment variable appropriateley.
  For local development, this should be something like `project.127.0.0.1.sslip.io`, but with the external IP of the Istio Loadbalancer.

  This can be configured with this one-liner:

  ```
  export PROJECT_DOMAIN=$(kubectl get svc istio-ingressgateway -n istio-system -o jsonpath="project.{.status.loadBalancer.ingress[0].ip}.sslip.io")
  ```

- Run `skaffold dev` in the `./services/` directory, to build and start all micro services at once.
  When changes are made to any service, Skaffold will automatically rebuild them.

The project can now be accessed at http://project.127.0.0.1.sslip.io/

### Interacting with the services

The `kubectl` CLI can be used to interact with the local Kubernetes cluster.

- `kubectl get all -A` get an overview of most of the running resources.
- `kubectl get kservice -n project` get all running Knative services and their exposed URLs.
- `kubectl get virtualservice -n project` get all Istio VirtualServices (API routes).
- `kubectl get vs -n project api-service-routes -o yaml` get info about a specific VirtualService.

## Project setup in cloud

### Configuration

Change skaffold config where images is tagged: yousofmersal.

Change cluster configuration in Terraform and in the deploy pipeline.

#### List and set project

`gcloud projects list`

`gcloud projects create dm885-dev`

`gcloud config set project dm885-dev`

##### Enable GKE

`gcloud --project=dm885-dev services enable container.googleapis.com`

`gcloud --project=dm885-dev services enable compute.googleapis.com`

#### Get credentials for cluster

`gcloud container clusters list`

`gcloud container clusters get-credentials dm885-dev-gke --region europe-north1`


#### Get service-account key
 * Add secret in github action to enable pipeline
 
`gcloud iam service-accounts list`

```
gcloud iam service-accounts keys create key.json --iam-account=954508260996-compute@developer.gserviceaccount.com
```
