# Troubleshooting Guide

This document provides solutions to common issues encountered during the Voyager project implementation and operation.

## Table of Contents

- [Terraform Issues](#terraform-issues)
- [Kubernetes Issues](#kubernetes-issues)
- [ArgoCD Issues](#argocd-issues)
- [CI/CD Issues](#cicd-issues)
- [Database Issues](#database-issues)
- [DNS Issues](#dns-issues)
- [Monitoring Issues](#monitoring-issues)
- [Network Issues](#network-issues)
- [Application Issues](#application-issues)

## Terraform Issues

### State Lock Errors

**Problem:** Terraform state is locked by another process.

**Solution:**
```bash
# Find lock ID
terraform force-unlock <LOCK_ID>

# Or wait for the lock to be released
```

### State File Not Found

**Problem:** Terraform cannot find state file in backend.

**Solution:**
```bash
# Verify backend configuration
cat terraform/backend.tf

# Reinitialize backend
terraform init -reconfigure

# Verify backend bucket exists and is accessible
```

### Provider Authentication Errors

**Problem:** Cannot authenticate with cloud provider.

**Solution:**
```bash
# GCP
gcloud auth application-default login
gcloud auth login

# AWS
aws configure
aws sso login

# Verify credentials
gcloud auth list  # or aws sts get-caller-identity
```

## Kubernetes Issues

### Cannot Connect to Cluster

**Problem:** kubectl cannot connect to cluster.

**Solution:**
```bash
# Verify cluster credentials
gcloud container clusters get-credentials <cluster-name> --region=<region>

# Check VPN connection (if using private cluster)
# Verify IAM permissions
# Check firewall rules
```

### Pods Stuck in Pending

**Problem:** Pods are not starting, stuck in Pending state.

**Solution:**
```bash
# Check pod events
kubectl describe pod <pod-name> -n <namespace>

# Check node resources
kubectl get nodes
kubectl describe node <node-name>

# Check node pool capacity
# Verify resource requests/limits
```

### Image Pull Errors

**Problem:** Cannot pull container images.

**Solution:**
```bash
# Verify image exists in registry
# Check IAM permissions for registry access
# Verify image pull secrets
kubectl get secrets -n <namespace>

# Check node IAM permissions
```

## ArgoCD Issues

### Application Out of Sync

**Problem:** ArgoCD shows application as OutOfSync.

**Solution:**
```bash
# Check application status
argocd app get <app-name>

# Refresh application
argocd app get <app-name> --refresh

# Force sync
argocd app sync <app-name> --force

# Check application logs
argocd app logs <app-name>
```

### Cannot Access ArgoCD

**Problem:** Cannot access ArgoCD UI.

**Solution:**
```bash
# Port forward for local access
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Check ArgoCD pod status
kubectl get pods -n argocd

# Verify ingress configuration (if using ingress)
kubectl get ingress -n argocd
```

### Sync Failures

**Problem:** ArgoCD sync fails.

**Solution:**
```bash
# Check sync status
argocd app get <app-name>

# View sync operation details
argocd app history <app-name>

# Check Helm chart values
# Verify image tags exist
# Check resource quotas
kubectl get resourcequota -n <namespace>
```

## CI/CD Issues

### Pipeline Fails on Build

**Problem:** GitLab CI pipeline fails during build stage.

**Solution:**
- Check Dockerfile syntax
- Verify build context
- Check for missing dependencies
- Review build logs
- Test build locally

### Pipeline Fails on Deploy

**Problem:** GitLab CI pipeline fails during deployment.

**Solution:**
- Verify ArgoCD token is valid
- Check ArgoCD CLI installation in pipeline
- Verify image tags are correct
- Check ArgoCD application status
- Review ArgoCD sync logs

### Manual Approval Not Working

**Problem:** Cannot approve production deployment.

**Solution:**
- Check GitLab CI/CD settings
- Verify manual approval job configuration
- Check user permissions
- Review pipeline configuration

## Database Issues

### Cannot Connect to Database

**Problem:** Application cannot connect to database.

**Solution:**
```bash
# Check database endpoint
# Verify External Secrets configuration
kubectl get secret -n sample-app
kubectl describe secret <secret-name> -n sample-app

# Test connection from pod
kubectl exec -it <backend-pod> -n sample-app -- sh
# Test database connection

# Check database firewall rules
# Verify private IP connectivity
```

### Database Credentials Not Found

**Problem:** External Secrets cannot retrieve database credentials.

**Solution:**
```bash
# Check External Secrets status
kubectl get externalsecret -n sample-app
kubectl describe externalsecret <name> -n sample-app

# Verify Secret Store configuration
kubectl get secretstore -n sample-app

# Check IAM permissions
# Verify credentials exist in Secret Manager
```

## DNS Issues

### DNS Records Not Created

**Problem:** External DNS is not creating DNS records.

**Solution:**
```bash
# Check External DNS logs
kubectl logs -n tools -l app.kubernetes.io/name=external-dns

# Verify IAM permissions for DNS
# Check Ingress/HTTPRoute resources
kubectl get ingress -n sample-app
kubectl describe ingress <name> -n sample-app

# Verify DNS zone configuration
```

### DNS Records Point to Wrong IP

**Problem:** DNS records resolve to incorrect IP addresses.

**Solution:**
- Check load balancer configuration
- Verify Ingress controller
- Check DNS propagation (may take time)
- Verify DNS zone configuration

## Monitoring Issues

### Prometheus Not Scraping Metrics

**Problem:** Prometheus is not collecting metrics.

**Solution:**
```bash
# Check Prometheus targets
# Access Prometheus UI and check targets

# Verify ServiceMonitor resources
kubectl get servicemonitor -n monitoring

# Check Prometheus configuration
kubectl get configmap -n monitoring prometheus-server
```

### Grafana Cannot Access Data Sources

**Problem:** Grafana cannot connect to Prometheus or Loki.

**Solution:**
- Verify data source URLs
- Check network connectivity
- Verify service names and ports
- Check Grafana configuration
- Review data source credentials

### Alerts Not Firing

**Problem:** Prometheus alerts are not triggering.

**Solution:**
- Check alert rules configuration
- Verify alertmanager configuration
- Check notification channel settings
- Review alert conditions
- Test alert manually

## Network Issues

### Cannot Access Private Resources

**Problem:** Cannot access private resources via VPN.

**Solution:**
- Verify VPN connection
- Check VPN client configuration
- Verify DNS resolution (private DNS zone)
- Check firewall rules
- Verify routing configuration

### NAT Gateway Not Working

**Problem:** Pods cannot access internet.

**Solution:**
- Verify NAT gateway exists
- Check route tables
- Verify subnet configuration
- Check firewall rules
- Test connectivity from node

## Application Issues

### Frontend Not Loading

**Problem:** Frontend application is not accessible.

**Solution:**
```bash
# Check frontend pod status
kubectl get pods -n sample-app -l app=frontend

# Check frontend service
kubectl get svc -n sample-app -l app=frontend

# Check ingress
kubectl get ingress -n sample-app -l app=frontend

# Check DNS
nslookup frontend.test-public.example.com

# Verify TLS certificate
```

### Backend API Errors

**Problem:** Backend API is returning errors.

**Solution:**
```bash
# Check backend pod logs
kubectl logs -n sample-app -l app=backend

# Check backend pod status
kubectl get pods -n sample-app -l app=backend

# Verify database connection
# Check environment variables
kubectl describe pod <backend-pod> -n sample-app
```

### Database Connection Errors

**Problem:** Backend cannot connect to database.

**Solution:**
- Verify database endpoint
- Check database credentials
- Verify network connectivity
- Check database firewall rules
- Review External Secrets configuration

## General Debugging Tips

### Check Pod Logs
```bash
kubectl logs <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace> --previous  # Previous container
kubectl logs -l app=<app-label> -n <namespace>  # All pods with label
```

### Check Resource Status
```bash
kubectl get all -n <namespace>
kubectl describe <resource-type> <resource-name> -n <namespace>
```

### Check Events
```bash
kubectl get events -n <namespace> --sort-by='.lastTimestamp'
```

### Verify Configuration
```bash
# Check ConfigMap
kubectl get configmap -n <namespace>
kubectl describe configmap <name> -n <namespace>

# Check Secrets (values hidden)
kubectl get secret -n <namespace>
kubectl describe secret <name> -n <namespace>
```

## Getting Help

If issues persist:
1. Review relevant documentation
2. Check cloud provider status pages
3. Review component-specific logs
4. Consult project documentation
5. Review architecture diagrams

---

