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

# resource "helm_release" "rabbitmq-operator" {
#   name             = "rabbitmq"
#   namespace        = "project"
#   create_namespace = true

#   repository = "https://charts.bitnami.com/bitnami"
#   chart      = "rabbitmq-cluster-operator"
#   version    = "3.1.0"
# }

# resource "kubectl_manifest" "rabbitmq-cluster" {
#   depends_on = [helm_release.rabbitmq-operator]
#   yaml_body  = <<EOF
#     apiVersion: rabbitmq.com/v1beta1
#     kind: RabbitmqCluster
#     metadata:
#       name: rabbitmq
#       namespace: project
#     EOF
# }

# data "http" "knative-operator-yaml" {
#   url = "https://github.com/knative/operator/releases/download/knative-v1.8.0/operator.yaml"
# }

data "kubectl_path_documents" "knative-yamls" {
  pattern = "./knative/*.yaml"
}

resource "kubectl_manifest" "knative-operator" {
  for_each  = toset(data.kubectl_path_documents.knative-yamls.documents)
  yaml_body = each.value
}

# resource "kubernetes_namespace" "project-namespace" {
#   metadata {
#     name = "project"
#   }
# }
