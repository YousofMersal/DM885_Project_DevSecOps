# How to add monitoring

### Steps

Since we are using Helm, searched 'prometheus' on Artifact Hub, found this:

https://artifacthub.io/packages/helm/prometheus-community/prometheus.

Followed instructions here: https://prometheus-community.github.io/helm-charts/

Added new `helm_release` resource in [main.tf](../terraform/main.tf).

Useful video for understanding the different components of the `kube-prometheus-stack`: https://youtu.be/zW-E8THfvPY?t=1600

### Dashboard

View the prometheus dashboard by running the following in a terminal:

```
minikube service prometheus-kube-prometheus-prometheus --url
```

Grafana is shipped together with the prometheus as part of the `kube-prometheus-stack`. Grafana is not accessible outside the cluster, so we need to do portforwarding.

To view the dashboard, run the following command (this time let's use `kubectl` instead of minikube magic like above) and open up `localhost:3332` in a browser.

```
kubectl port-forward service/prometheus-grafana 3332:80
```

Credentials are stored in kubernetes secret `prometheus-grafana`. It can be viewed using the following command (not a great api but it's needed because it's encrypted):

```
kubectl get secret prometheus-grafana -o jsonpath='{.data.admin-password}' | base64 --decode ; echo
```
