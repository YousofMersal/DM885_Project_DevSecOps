

# Kubernetes resources


## Static IP-address

When the cluster is deployed then change the IP-address to static.


## Domain

Update configuration with domain:
```
kubectl patch configmap/config-domain \
      --namespace knative-serving \
      --type merge \
      --patch '{"data":{"dm885.qpqp.dk":""}}'
```

The frontend will be available at: http://frontend.project.dm885.qpqp.dk


## References

https://knative.dev/docs/install/operator/knative-with-operators/#configure-dns
