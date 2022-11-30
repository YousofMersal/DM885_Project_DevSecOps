variable "gke_username" {
  default     = ""
  description = "gke username"
}

variable "gke_password" {
  default     = ""
  description = "gke password"
}

variable "gke_num_nodes" {
  default     = 2
  description = "number of gke nodes"
}

variable "gke_node_machine_type" {
  default     = "n2-standard-4"
  description = "machine type for nodes"
}

# GKE cluster
resource "google_container_cluster" "primary" {
  name     = "${var.project_id}-gke"
  location = var.zone
  initial_node_count = var.gke_num_nodes

  node_config {
    machine_type = var.gke_node_machine_type

    oauth_scopes = [
      "https://www.googleapis.com/auth/compute",
      "https://www.googleapis.com/auth/devstorage.read_only",
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
    ]
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
