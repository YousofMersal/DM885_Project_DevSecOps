# General setup

1. Install Minikube for local development: https://minikube.sigs.k8s.io/docs/start/

2. Minikube needs container/vm environment. If docker already installed on system, run it.

3. Run `minikube start`

# Kubernetes specific

1. Install helm package manager: https://helm.sh/docs/intro/install/

2. Run `helm repo add bitnami https://charts.bitnami.com/bitnami`

3. Install official rabbitmq package: `helm install dm885-rabbitmq-release bitnami/rabbitmq`

4. Pod crashes with error:

0/1 nodes are available: 1 pod has unbound immediate PersistentVolumeClaims. preemption: 0/1 nodes are available: 1 Preemption is not helpful for scheduling.
Readiness probe failed: /bin/bash: line 1: 335 Segmentation fault rabbitmq-diagnostics -q check_running
Back-off restarting failed container
