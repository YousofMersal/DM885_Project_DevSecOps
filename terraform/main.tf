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

data "kubectl_path_documents" "knative-yamls" {
  pattern = "./knative/*.yaml"
}

resource "kubectl_manifest" "knative-operator" {
  depends_on = [
    helm_release.istio-discovery,
    helm_release.istio-ingressgateway
  ]

  for_each  = toset(data.kubectl_path_documents.knative-yamls.documents)
  yaml_body = each.value
}
