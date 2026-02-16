# Expected Outcome

By the end of this project you should have:

- **Migrated** the Sample application to your chosen cloud provider.
- **Implemented** Infrastructure as Code with Terraform.
- **Deployed** two environments: test and prod.
- **Set up** CI/CD with GitLab, Helm charts, and Argo CD.
- **Set up** monitoring and logging with Prometheus, Loki, and Grafana.
- **Demonstrated** understanding of cloud concepts and the ability to explain your design choices.

**Result:** A working cloud setup that runs your app reliably, supports scaling, and has monitoring and management in place.

---

## Quick reference: what & how to run

| Outcome | What it is | How to run / show |
|--------|------------|--------------------|
| **Sample app in cloud** | Frontend + backend on Kubernetes (test/prod). | Open app URL (e.g. https://www.your-domain.com). `kubectl get pods -n sample-app` |
| **IaC with Terraform** | All infra (VPC, GKE, DNS, etc.) in Terraform. | `cd terraform/<env>; terraform plan` / `terraform apply` |
| **Two environments** | Separate test and prod (e.g. clusters, namespaces). | `kubectl config use-context <test\|prod>`; list clusters/namespaces |
| **CI/CD (GitLab + Helm + Argo CD)** | Pipeline builds images, pushes to registry; Argo CD deploys from Git. | Push to main → pipeline runs; Argo CD UI shows apps. `kubectl get applications -n argocd` |
| **Monitoring & logging** | Prometheus (metrics), Loki (logs), Grafana (dashboards). | Port-forward Grafana: `kubectl port-forward svc/grafana -n monitoring 3000:80` → http://localhost:3000. Prometheus: `kubectl port-forward svc/prometheus-prometheus -n monitoring 9090:9090` → http://localhost:9090 |
| **Explain design** | You can describe why you chose provider, IaC, GitOps, monitoring, etc. | Use [docs/](docs/) (e.g. DESIGN_DECISIONS.md, ARCHITECTURE.md, COST_OPTIMIZATION.md) and [review.md](review.md) for talking points. |

---

## One-liners (run from repo root, `kubectl` context = prod)

```bash
# App
kubectl get pods -n sample-app

# Argo CD apps
kubectl get applications -n argocd

# Monitoring
kubectl get pods -n monitoring
kubectl port-forward svc/grafana -n monitoring 3000:80          # Grafana → http://localhost:3000
kubectl port-forward svc/prometheus-prometheus -n monitoring 9090:9090   # Prometheus → http://localhost:9090
```

Full setup and demo steps: [docs/SETUP.md](SETUP.md), [review.md](review.md).
