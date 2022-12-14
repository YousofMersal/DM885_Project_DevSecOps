# GKE Cluster


## Configuration

The configuration variables are in ´terraform.tfvars´.

By default it uses ´e2-standard-4´ instances'. Beaware small instances may not be able to run Istio.


## Static IP-address

When the cluster is deployed then change the IP-address to static.


## Run

Get the credentials and configure kubectl:
```
gcloud container clusters get-credentials steam-airfoil-367315-gke --region europe-west8-b
```

Provision the cluster:
```
terraform init
terraform apply
```

For now the serivce is available on: http://dm885.qpqp.dk/


## Debugging

List routes: kubectl get rt -A


## References

https://developer.hashicorp.com/terraform/tutorials/kubernetes/gke
https://docs.github.com/en/actions/deployment/deploying-to-your-cloud-provider/deploying-to-google-kubernetes-engine#configuring-a-service-account-and-storing-its-credentials

