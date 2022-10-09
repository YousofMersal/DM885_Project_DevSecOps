provider "helm" {
  kubernetes {
    config_path = "~/.kube/config"
  }
}

resource "helm_release" "rabbitmq" {
  name             = "rabbitmq"
  namespace        = "test-mq"
  create_namespace = true

  repository = "https://charts.bitnami.com/bitnami"
  chart      = "rabbitmq"
  version    = "10.3.9"
}
