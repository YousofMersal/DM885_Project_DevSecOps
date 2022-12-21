# Configuration

Change skaffold config where images is tagged: yousofmersal.

Change cluster configuration in Terraform and in the deploy pipeline.

## List and set project

gcloud projects list

gcloud projects create dm885-dev

gcloud config set project dm885-dev

## Enable GKE

gcloud --project=dm885-dev services enable container.googleapis.com

gcloud --project=dm885-dev services enable compute.googleapis.com

## Get credentials for cluster

gcloud container clusters list

gcloud container clusters get-credentials dm885-dev-gke --region europe-north1


## Get service-account key
 * Add secret in github action to enable pipeline
 
gcloud iam service-accounts list

gcloud iam service-accounts keys create key.json --iam-account=954508260996-compute@developer.gserviceaccount.com
