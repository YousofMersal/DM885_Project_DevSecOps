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

resource "helm_release" "elastic" {
  name             = "elk-elastic"
  namespace        = "monitoring"
  create_namespace = true

  repository = "https://helm.elastic.co"
  chart      = "elasticsearch"

  values = ["${file("elk-elastic.yaml")}"]
}

resource "helm_release" "kibana" {
  name             = "elk-kibana"
  namespace        = "monitoring"
  create_namespace = true
  depends_on       = [helm_release.elastic]

  repository = "https://helm.elastic.co"
  chart      = "kibana"

  values = ["${file("elk-kibana.yaml")}"]
}

resource "helm_release" "logstash" {
  name             = "elk-logstash"
  namespace        = "monitoring"
  create_namespace = true
  depends_on       = [helm_release.elastic]

  repository = "https://helm.elastic.co"
  chart      = "logstash"

  values = ["${file("elk-logstash.yaml")}"]
}

