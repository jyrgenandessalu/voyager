# Requirements Checklist

This checklist ensures all mandatory requirements from the Voyager project specification are met.  

## Documentation Requirements

- [x] README.md exists with:
  - [x] Project overview
  - [x] Architecture diagram (linked in docs/ARCHITECTURE.md)
  - [x] Setup instructions (docs/SETUP.md)
  - [x] Usage guide (docs/USAGE.md)
  - [x] Additional features/bonus functionality (see documentation.md)

- [x] GitLab repository exists with all source code and configuration files

- [x] Repository is well-structured to separate different components

- [x] Each service has its own directory and is logically organized (sample-app/backend, frontend; terraform/shared, test, production; argocd/test, production)

- [x] Architecture diagram exists and clearly communicates key components and relationships (docs/ARCHITECTURE.md, Mermaid)

## Cloud Provider & Accounts

- [x] Student can explain reasoning behind choosing the specific cloud provider (docs/DESIGN_DECISIONS.md, docs/COST_OPTIMIZATION.md)

- [x] Separate user for administrative tasks exists

- [x] Student can explain why separate user is needed and why root user must not be used

- [x] MFA is enabled for all users

- [x] Separate accounts/projects exist for:
  - [x] Testing environment (voyager-test-486811)
  - [x] Production environment (voyager-production-486811)
  - [x] Shared resources (voyager-shared-486811)

- [x] Student can explain benefits and drawbacks of using separate accounts/projects

- [x] Billing alerts exist (25%, 50%, 75% thresholds)

## Infrastructure as Code

- [x] Infrastructure is provisioned using Terraform

- [x] Terraform state is stored in a storage bucket (gs://voyager-terraform-state)

- [x] Terraform is NOT used to install Helm charts (except for ArgoCD)

## Domain & DNS

- [x] Student has registered a domain name for the project (voyager-demo.xyz, Namecheap)

- [x] Private and public DNS zones exist (test-public, test-private, prod-public, prod-private)

- [x] Student can explain the benefits and drawbacks of using private and public DNS zones

- [x] TLS certificates for private and public DNS zones exist (Certificate Manager)

- [x] Student can explain what TLS certificates are and why they are used

## Container Registry

- [x] Private container/artifact registry exists in the shared account (Artifact Registry)

- [x] Private container registry contains images of frontend and backend applications (CI pushes; values reference images)

## Network Infrastructure

- [x] Virtual Private Cloud (VPC) exists (test and production)

- [x] VPC and subnets are configured within appropriate IPv4 address ranges (10.0.0.0/16 test, 10.1.0.0/16 prod)

- [x] Firewall rules/security groups exist and are properly configured

- [x] NAT gateway exists

- [x] Student can explain why NAT gateway is needed and how it works

- [x] Internal and external load balancers exist (external: ingress; internal: Grafana; Argo CD doc in PHASE8_SECURITY.md)

- [x] Student can explain the difference between internal and external load balancers and when they should be used

## Kubernetes

- [x] Kubernetes cluster with three node groups/pools exists (monitoring, tools, main)

- [x] Application pods are deployed to the correct node group/pool:
  - [x] Grafana and Loki to monitoring
  - [x] ArgoCD and External DNS to tools
  - [x] Sample application frontend and backend to main (values-test/prod use main pool)

- [x] Applications are logically organized into namespaces
- [x] Sample application pods are deployed to sample-app namespace

- [x] Production cluster control plane is Highly Available (HA)
- [x] Production cluster node groups/pools are split across multiple availability zones

- [x] Student can explain High Availability (HA), its benefits and drawbacks

- [x] Kubernetes cluster is created using standard mode
- [x] EKS Auto Mode, GKE Autopilot cluster or equivalent is NOT used

- [x] Kubernetes cluster's control plane and nodes do not have public IP addresses

- [x] Student can explain the benefits and drawbacks of not using public IP addresses

## Storage

- [ ] Storage bucket for logs exists

## Database

- [ ] Managed Postgres database exists

- [ ] Production database is Highly Available (HA)

- [ ] Point in time recovery exists for production database

- [ ] Daily backups exist for production database

- [ ] Student can explain the difference between point in time recovery and daily backups

- [ ] Database credentials are stored in cloud provider secret management service
- [ ] Database credentials are accessed using External Secrets

## GitOps & Tooling

- [ ] ArgoCD is installed and operational in the Kubernetes cluster

- [ ] App of apps pattern is used in ArgoCD

- [ ] Student can explain why ArgoCD is used and how it works

- [ ] External Secrets is installed with Helm chart and ArgoCD

- [ ] Student can explain why External Secrets is used and how it works

- [ ] Git repository does not contain any sensitive data (API keys, IAM credentials, passwords, etc.)

- [ ] External DNS is installed with Helm chart and ArgoCD

- [ ] Student can explain why External DNS is used and what it does

- [ ] Student can demonstrate automatic DNS record creation using External DNS

## Monitoring & Logging

- [x] Prometheus is installed with Helm chart and ArgoCD

- [x] Prometheus Postgres exporter is installed with Helm chart and ArgoCD

- [x] Prometheus alerts are configured (Alertmanager with route + receiver; default rules enabled)

- [ ] Alert is sent to configured messaging app (Slack, Teams, Discord, etc.) — replace placeholder webhook in prometheus app values with real webhook (or Secret)

- [x] Loki is installed with Helm chart and ArgoCD

- [x] Grafana is installed with Helm chart and ArgoCD

- [x] Prometheus and Loki are configured as data sources in Grafana

- [x] Dashboard displaying general kubernetes cluster metrics using Prometheus exists (kubernetes-cluster, node-exporter dashboards)

- [x] Dashboard displaying Postgres database metrics using Prometheus Postgres exporter exists (postgresql dashboard)

- [ ] Dashboard displaying logs from Sample application using Loki exists — demonstrate: use app (register/login/logout), then in Grafana Explore (Loki) query e.g. `{namespace="sample-app"}` and show matching log lines

## Application Deployment

- [ ] Sample application is installed with Helm chart and ArgoCD

- [ ] Sample application Helm charts for prod and test environments are identical (reusable)

- [ ] All environment-specific configuration is done in Helm values files

- [ ] Sample application production environment frontend is publicly accessible on the root domain (e.g., https://www.example.com)

- [ ] Sample application production frontend allows anyone to register, login and logout

## CI/CD

- [ ] GitLab CI pipeline exists

- [ ] Container image is built in GitLab CI pipeline and pushed to private registry in the shared account

- [ ] Manual approval is required before deployment to production

- [ ] Pipeline provides correct feedback about the deployment status (if ArgoCD refresh/sync fails, the pipeline should fail)

- [ ] Code changes to main/master branch automatically trigger deployment pipeline

- [ ] Rollback capability exists to restore the Sample application to previous versions

## Cost Optimization

- [x] Student can explain the cost optimization strategies used for cloud resources (docs/COST_OPTIMIZATION.md):
  - [x] Instance size optimization
  - [x] Billing alert implementation
  - [x] Lifecycle policy configuration for buckets and container registries
  - [x] Resource-efficient test environment configuration
  - [x] Resource cleanup strategies and automation

## Security

- [x] Student can explain what is least privilege principle and why it is important

## Extra Requirements (Optional)

- [ ] Self-managed GitLab in the shared account is implemented

- [ ] VPN is configured to access private cloud resources

- [ ] Internal load balancers are used for everything except production frontend and backend

- [ ] Private DNS zone is used to access tooling and monitoring

## Bonus Functionality (Optional)

- [ ] Additional bonus features implemented (if any)

