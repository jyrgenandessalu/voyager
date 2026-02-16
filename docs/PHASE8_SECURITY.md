# Phase 8: Security Hardening

This document covers internal load balancers and VPN access for the Voyager project.

## Internal load balancers

**Requirement:** Internal and external load balancers exist. Production frontend/backend stay public; tooling (Argo CD, Grafana, Prometheus) should be reachable only from within the VPC (or via VPN).

### GKE internal LoadBalancer

On GKE, a **Service** with `type: LoadBalancer` and the annotation `cloud.google.com/load-balancer-type: "Internal"` gets an internal IP (in the VPC) instead of a public one.

- **External load balancer:** Used for production frontend/backend (Ingress with a public IP). Traffic from the internet can reach the app.
- **Internal load balancer:** Used for Argo CD, Grafana, Prometheus. Only clients in the VPC (or connected via VPN) can reach them.

### Argo CD (test cluster)

Argo CD is installed with Helm. To use an **internal** LB instead of external:

1. Get current values:  
   `helm get values argocd -n argocd`
2. Install or upgrade with internal LB:

   ```bash
   helm upgrade argocd argo/argo-cd -n argocd \
     --set server.service.type=LoadBalancer \
     --set server.service.annotations."cloud\.google\.com/load-balancer-type"=Internal \
     --reuse-values
   ```

3. The Argo CD server will get an internal IP. Access it from a bastion/jumphost in the VPC or via VPN (see below).

### Grafana (test)

Grafana is deployed via Argo CD (Helm chart). To expose it with an internal LB:

1. In `argocd/test/applications/values-grafana.yaml`, set:

   ```yaml
   service:
     type: LoadBalancer
   annotations:
     cloud.google.com/load-balancer-type: "Internal"
   ```

   (Adjust the chart’s structure if it uses a different key for service annotations.)

2. Or add a separate `Service` in the repo that selects the Grafana deployment and uses `type: LoadBalancer` with the internal annotation.

### Summary

| Component        | External LB              | Internal LB                          |
|-----------------|--------------------------|--------------------------------------|
| Prod frontend   | Ingress (public)          | —                                    |
| Prod backend    | Ingress (public)         | —                                    |
| Argo CD (test)  | Optional (current prod)  | Recommended for test                 |
| Grafana (test)  | —                        | Recommended                           |
| Prometheus      | —                        | Optional (ClusterIP or internal LB)  |

## VPN access

**Requirement:** Student can access private resources (e.g. Argo CD, Grafana, private DNS) without exposing them to the internet.

### Options

1. **GCP Cloud VPN / Hybrid VPN**  
   Set up a VPN gateway in the project and connect from on-prem or your laptop via a client (e.g. OpenVPN, or GCP’s VPN solution). Traffic to the VPC (e.g. `10.0.0.0/16`, `10.1.0.0/16`) goes through the tunnel.

2. **Bastion / Jumphost in the VPC**  
   Create a small VM in the same VPC as the cluster, with a public IP or IAP. SSH to the bastion and run `kubectl` or open browsers to internal LBs (Argo CD, Grafana) via port-forward or by using the internal LB IP from the bastion.

3. **Identity-Aware Proxy (IAP) + SSH tunnel**  
   Use a GCE instance with no public IP, access via IAP tunnel, then `kubectl port-forward` to Argo CD/Grafana.

4. **Third-party VPN (e.g. Tailscale, WireGuard)**  
   Run a node in the VPC that joins your Tailscale/WireGuard network so your laptop can reach VPC IPs.

### Recommended for this project

- **Test:** Use an internal LB for Argo CD and Grafana; access via a **bastion VM** in the test VPC (e.g. `e2-micro`) and SSH + port-forward, or use IAP.
- **Production:** Keep Argo CD on an internal LB (or ClusterIP and access via VPN/bastion); keep only frontend/backend on the public ingress.

### One-time bastion setup (example)

```bash
# Create a small VM in the test VPC (use the same subnet as GKE nodes)
gcloud compute instances create voyager-bastion \
  --project=voyager-test-486811 \
  --zone=europe-north1-a \
  --machine-type=e2-micro \
  --network-interface=subnet=YOUR_PRIVATE_SUBNET,no-address \
  --no-address  # no public IP; use IAP tunnel to SSH

# SSH via IAP (no public IP on bastion)
gcloud compute ssh voyager-bastion --zone=europe-north1-a --tunnel-through-iap --project=voyager-test-486811
# From bastion: kubectl (install and get credentials) and curl to internal LB IPs.
```

Then point your local browser to the internal Argo CD/Grafana URLs via an SSH tunnel from the bastion if desired.

## Firewall and IAM

- **Firewall:** Restrict ingress to the internal LBs to the VPC CIDR (and VPN range if applicable). GKE and GCE firewall rules are in Terraform (`terraform/test` and `terraform/production`).
- **IAM:** Use least privilege for service accounts (e.g. `external-secrets@`, `external-dns@`, `gitlab-ci@`). No long-lived keys in the repo; use Workload Identity where possible.
