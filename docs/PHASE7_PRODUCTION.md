# Phase 7: Production Infrastructure & Deployment

Production Terraform lives in **terraform/production/**; Argo CD apps and Helm values for production are in **argocd/production/** and **sample-app/*/helm/values-prod.yaml**.

## What’s in place

### Terraform (terraform/production/)
- **APIs:** Compute, Container, Secret Manager, DNS, Certificate Manager, Storage, Service Networking, SQL Admin.
- **VPC:** `10.1.0.0/16`, subnets, NAT, firewalls.
- **GKE:** Cluster `voyager-prod`, node pools (main, tools, monitoring), deletion protection.
- **Database:** Cloud SQL PostgreSQL REGIONAL (HA), 30-day backups, 7-day PITR; private IP; DNS `db.prod-private.voyager-demo.xyz`.
- **DNS:** Public `prod-public.voyager-demo.xyz`, private `prod-private.voyager-demo.xyz`.
- **TLS:** Certificate Manager certificates for both zones.
- **Secrets:** DB password, DB user, JWT key, connection string in Secret Manager (project `voyager-production-486811`).
- **IAM for GitOps:** GCP SAs `external-secrets` and `external-dns` with Workload Identity so ESO and External DNS can run in the prod cluster.

### Argo CD (argocd/production/)
- **applications/** – Helm chart that defines: External Secrets, External DNS, backend, frontend (all using prod project and `values-prod.yaml`).
- **bootstrap-application.yaml** – Single Application to apply once to create the “app of apps” and sync all prod apps.

### App values
- **sample-app/backend/helm/values-prod.yaml** – ENV=production, prod DB host, prod Secret Manager keys (`prod-db-user`, etc.), prod ingress host.
- **sample-app/frontend/helm/values-prod.yaml** – prod API URL, prod ingress host.

## 1. Apply Terraform (from repo root)

If **node pools already exist** in GCP but Terraform wants to create them (error: "already exists"), import them first, then apply:

```powershell
# If state is locked from a previous run:
terraform -chdir=terraform/production force-unlock 1770828994700613
# (Use the lock ID from the error message if different.)

# Import the three node pools (they exist in GCP but not in state):
terraform -chdir=terraform/production import -var="project_id=voyager-production-486811" "google_container_node_pool.main" "projects/voyager-production-486811/locations/europe-north1/clusters/voyager-prod/nodePools/voyager-prod-main-pool"
terraform -chdir=terraform/production import -var="project_id=voyager-production-486811" "google_container_node_pool.monitoring" "projects/voyager-production-486811/locations/europe-north1/clusters/voyager-prod/nodePools/voyager-prod-monitoring-pool"
terraform -chdir=terraform/production import -var="project_id=voyager-production-486811" "google_container_node_pool.tools" "projects/voyager-production-486811/locations/europe-north1/clusters/voyager-prod/nodePools/voyager-prod-tools-pool"

# Then apply (should show no changes or only minor updates):
terraform -chdir=terraform/production apply -input=false -var="project_id=voyager-production-486811" -auto-approve
```

Otherwise, just run apply:

```bash
terraform -chdir=terraform/production apply -input=false -var="project_id=voyager-production-486811" -auto-approve
```

Or copy `terraform/production/terraform.tfvars.example` to `terraform.tfvars` and run `terraform -chdir=terraform/production apply -input=false -auto-approve`.

If the first apply times out (GKE/Cloud SQL), run the same command again.

## 2. After infrastructure is ready: install Argo CD on prod

1. Get credentials:
   ```bash
   gcloud container clusters get-credentials voyager-prod --region=europe-north1 --project=voyager-production-486811
   ```

2. Create namespace and install Argo CD (same as test, e.g. Helm):
   ```bash
   kubectl create namespace argocd
   helm repo add argo https://argoproj.github.io/argo-helm
   helm install argocd argo/argo-cd -n argocd --set server.service.type=LoadBalancer
   ```

3. Configure GitLab repo access (Personal Access Token with `read_repository`):
   ```bash
   kubectl create secret generic gitlab-repo-cred -n argocd \
     --from-literal=type=git \
     --from-literal=url=https://gitlab.com/jandessalu-kood/voyager.git \
     --from-literal=password=YOUR_GITLAB_TOKEN
   kubectl label secret gitlab-repo-cred -n argocd argocd.argoproj.io/secret-type=repository
   ```

4. Bootstrap the production app of apps:
   ```bash
   kubectl apply -f argocd/production/bootstrap-application.yaml
   ```

5. Create `sample-app` namespace (if not created by Argo CD):
   ```bash
   kubectl create namespace sample-app
   ```

Argo CD will sync External Secrets, External DNS, then backend and frontend. Backend and frontend use images from the shared Artifact Registry (same as test).

## 3. DNS

Point **prod-public.voyager-demo.xyz** at the production cluster’s ingress (or at the GCP load balancer). External DNS will create records for **backend.prod-public.voyager-demo.xyz** and **frontend.prod-public.voyager-demo.xyz** when the ingresses exist.

**Root domain (www.voyager-demo.xyz):** The production frontend ingress includes the host `www.voyager-demo.xyz` so the app is reachable at the root domain once DNS and TLS are set up. To enable it: (1) At your registrar (Namecheap), add a CNAME record `www` → `frontend.prod-public.voyager-demo.xyz` (or an A record to the ingress external IP). (2) Add a Certificate Manager certificate for `www.voyager-demo.xyz` (and optionally a GCP DNS zone for `voyager-demo.xyz` if you manage apex there) and reference it in the frontend ingress annotation if using a different cert for www.

## Cross-project

Production GKE nodes have **Artifact Registry reader** on the shared project. ESO and External DNS use Workload Identity with SAs in `voyager-production-486811` (created by Terraform).
