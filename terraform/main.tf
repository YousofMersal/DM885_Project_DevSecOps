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

resource "helm_release" "solvers-postgres" {
  name       = "solvers-postgres"     
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "postgresql"
  namespace  = "project"
  create_namespace = true

  # set {
  #   name  = "global.postgresql.auth.username"
  #   value = "user"
  # }

  #  set {
  #    name  = "global.postgresql.auth.password"
  #    value = "password"
  #  }

  # set {
  #   name  = "global.postgresql.auth.database"
  #   value = "solver-db"
  # }
}

# istio service mesh used by knative
resource "helm_release" "istio-base" {
  name       = "istio"
  repository = "https://istio-release.storage.googleapis.com/charts"
  chart      = "base"

  namespace        = "istio-system"
  create_namespace = true
}

resource "helm_release" "istio-discovery" {
  depends_on = [
    helm_release.istio-base
  ]

  name       = "istiod"
  repository = "https://istio-release.storage.googleapis.com/charts"
  chart      = "istiod"

  namespace        = "istio-system"
  create_namespace = true
}

resource "helm_release" "istio-ingressgateway" {
  depends_on = [
    helm_release.istio-discovery,
  ]

  name       = "istio-ingressgateway"
  repository = "https://istio-release.storage.googleapis.com/charts"
  chart      = "gateway"

  namespace        = "istio-system"
  create_namespace = true
}

# https://registry.terraform.io/providers/gavinbunney/kubectl/latest/docs/data-sources/kubectl_path_documents
# enable ease of splitting multi-document yaml content, from a collection of matching files
data "kubectl_path_documents" "knative-yamls" {
  pattern = "./knative/*.yaml"
}

# "kubectl_manifest" - Create a Kubernetes resource using raw YAML manifests.
resource "kubectl_manifest" "knative-operator" {
  depends_on = [
    helm_release.istio-discovery,
    helm_release.istio-ingressgateway
  ]

  for_each  = toset(data.kubectl_path_documents.knative-yamls.documents)
  yaml_body = each.value
}

resource "helm_release" "prometheus" {

  name = "prometheus"
  chart = "kube-prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"

}