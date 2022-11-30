# GKE Cluster


## Configuration

Update the configuration in ´terraform.tfvars´

n2-standard-4 instances are used by default. Beaware small GKE instances may not be able to run Istio.


## Run

```
terraform init
terraform apply
```

List routes: kubectl get rt -A

For now the auth serivce is available on: http://auth-service.project.34.154.63.245.sslip.io/api/v1/auth


## References

https://developer.hashicorp.com/terraform/tutorials/kubernetes/gke
https://docs.github.com/en/actions/deployment/deploying-to-your-cloud-provider/deploying-to-google-kubernetes-engine#configuring-a-service-account-and-storing-its-credentials

