terraform {
  required_version = ">= 0.13"

  required_providers {
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = ">= 1.7.0"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

provider "helm" {
  kubernetes {
    config_path = "~/.kube/config"
  }
}

provider "kubectl" {
  config_path = "~/.kube/config"
}

data "kubectl_path_documents" "knative-yamls" {
  pattern = "./knative/*.yaml"
}

resource "kubectl_manifest" "knative-operator" {
  for_each  = toset(data.kubectl_path_documents.knative-yamls.documents)
  yaml_body = each.value
}
