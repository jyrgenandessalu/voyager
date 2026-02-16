# Voyager Setup Instructions

This document provides step-by-step instructions for setting up the Voyager cloud migration project.

## Prerequisites

### Required Accounts
- [ ] Cloud provider account (GCP/AWS/Azure)
- [ ] Domain registrar account
- [ ] GitLab account (or self-managed GitLab)
- [ ] Messaging app account (Slack/Teams/Discord) for alerts

### Required Tools
- [ ] Terraform (>= 1.0)
- [ ] kubectl
- [ ] Helm (>= 3.0)
- [ ] ArgoCD CLI
- [ ] Cloud provider CLI (gcloud/aws/az)
- [ ] Git
- [ ] Docker (for local testing)

### Required Knowledge
- Basic understanding of Kubernetes
- Basic understanding of Terraform
- Basic understanding of Helm
- Basic understanding of GitOps

## Phase 1: Landing Zone Setup

### 1.1 Cloud Provider Setup

#### Create Projects/Accounts
```bash
# GCP Example
gcloud projects create voyager-shared
gcloud projects create voyager-test
gcloud projects create voyager-prod

# AWS Example
aws organizations create-account --email admin@example.com --account-name voyager-shared
# ... repeat for test and prod
```

#### Configure IAM
1. Create admin user (not root)
2. Enable MFA for all users
3. Apply least privilege principle
4. Set up service accounts

#### Set Up Billing Alerts
- Configure alerts at 25%, 50%, 75% thresholds
- Set up budget notifications

### 1.2 Domain Registration
1. Register domain at registrar of choice
2. Note DNS nameservers
3. Configure DNS delegation (if using cloud provider DNS)

### 1.3 Terraform Backend Setup
```bash
cd terraform/shared
terraform init
terraform plan
terraform apply
```

## Phase 2: Shared Infrastructure

### 2.1 Container Registry Setup
```bash
cd terraform/shared
# Configure container registry
terraform apply -target=module.container_registry
```

### 2.2 Configure Cross-Account Access
- Set up IAM permissions for test/prod accounts to access registry
- Test image push/pull

## Phase 3: Test Environment Infrastructure

### 3.1 Initialize Terraform
```bash
cd terraform/test
terraform init
```

### 3.2 Configure Variables
```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

### 3.3 Deploy Infrastructure
```bash
terraform plan
terraform apply
```

### 3.4 Configure kubectl Access
```bash
# GCP Example
gcloud container clusters get-credentials voyager-test-cluster --region=us-central1

# AWS Example
aws eks update-kubeconfig --name voyager-test-cluster --region us-east-1
```

## Phase 4: GitOps & Tooling Setup

### 4.1 Install ArgoCD
```bash
cd terraform/test
terraform apply -target=module.argocd
```

### 4.2 Access ArgoCD
```bash
# Port forward (for initial setup)
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Login
argocd login localhost:8080
```

### 4.3 Install External Secrets
- Deploy via ArgoCD app of apps pattern
- Configure Cluster Secret Store
- Test database credential retrieval

### 4.4 Install External DNS
- Deploy via ArgoCD
- Configure IAM permissions
- Test DNS record creation

### 4.5 Install Monitoring Stack
- Deploy Prometheus via ArgoCD
- Deploy Loki via ArgoCD
- Deploy Grafana via ArgoCD
- Configure data sources
- Import dashboards

## Phase 5: Application Deployment

### 5.1 Build and Push Images
```bash
# Build frontend
cd sample-app/frontend
docker build -t gcr.io/voyager-shared/frontend:latest .
docker push gcr.io/voyager-shared/frontend:latest

# Build backend
cd ../backend
docker build -t gcr.io/voyager-shared/backend:latest .
docker push gcr.io/voyager-shared/backend:latest
```

### 5.2 Deploy via ArgoCD
- Create ArgoCD application definitions
- Sync applications
- Verify deployment

## Phase 6: CI/CD Setup

### 6.1 Configure GitLab CI
1. Create `.gitlab-ci.yml` in repository root
2. Configure CI/CD variables:
   - Container registry credentials
   - ArgoCD token
   - Cloud provider credentials

### 6.2 Test Pipeline
1. Make code change
2. Push to main branch
3. Verify pipeline execution
4. Verify deployment to test

## Phase 7: Production Environment

### 7.1 Deploy Production Infrastructure
```bash
cd terraform/prod
terraform init
terraform plan
terraform apply
```

### 7.2 Deploy Production Application
- Configure production values
- Deploy via ArgoCD
- Verify production deployment

## Phase 8: Security Hardening

### 8.1 Set Up VPN
- Choose VPN solution
- Configure VPN server/client
- Test connectivity

### 8.2 Configure Internal Load Balancers
- Update Ingress configurations
- Verify internal access

## Troubleshooting

### Common Issues

#### Terraform State Lock
```bash
terraform force-unlock <LOCK_ID>
```

#### ArgoCD Sync Issues
```bash
argocd app get <app-name>
argocd app sync <app-name>
```

#### kubectl Access Issues
- Verify IAM permissions
- Check VPN connectivity
- Verify jumphost configuration

## Verification Checklist

- [ ] All infrastructure deployed
- [ ] Kubernetes cluster accessible
- [ ] ArgoCD operational
- [ ] Monitoring stack operational
- [ ] Application deployed
- [ ] CI/CD pipeline working
- [ ] DNS records created
- [ ] TLS certificates valid
- [ ] Database accessible
- [ ] Logs visible in Grafana
- [ ] Metrics visible in Grafana
- [ ] Alerts configured

## Next Steps

After setup is complete:
1. Review architecture documentation
2. Test all functionality
3. Configure monitoring dashboards
4. Set up alerting
5. Document any custom configurations

---

