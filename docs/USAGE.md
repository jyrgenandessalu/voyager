# Voyager Usage Guide

This document provides instructions for using and operating the Voyager cloud migration project.

## Accessing Resources

### Kubernetes Cluster Access

#### Via kubectl
```bash
# GCP
gcloud container clusters get-credentials voyager-test-cluster --region=us-central1

# AWS
aws eks update-kubeconfig --name voyager-test-cluster --region us-east-1

# Verify access
kubectl get nodes
```

#### Via VPN
1. Connect to VPN
2. Use private DNS zones (e.g., argocd.test-private.example.com)
3. Access resources via internal load balancers

### ArgoCD Access

#### Via Port Forward (Development)
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Access at https://localhost:8080
```

#### Via VPN (Production)
- Access at: https://argocd.test-private.example.com
- Use admin credentials or SSO

### Grafana Access

#### Via Port Forward (Development)
```bash
kubectl port-forward svc/grafana -n monitoring 3000:80
# Access at http://localhost:3000
```

#### Via VPN (Production)
- Access at: https://grafana.test-private.example.com
- Default credentials: admin/admin (change on first login)

### Application Access

#### Test Environment
- Frontend: https://frontend.test-public.example.com
- Backend: https://backend.test-public.example.com

#### Production Environment
- Frontend: https://www.example.com
- Backend: https://backend.prod-public.example.com

## Deploying Applications

### Manual Deployment via ArgoCD

#### Sync Application
```bash
argocd app sync frontend-test
argocd app sync backend-test
```

#### Check Application Status
```bash
argocd app get frontend-test
argocd app list
```

#### Rollback Application
```bash
argocd app rollback frontend-test <REVISION>
```

### Automated Deployment via CI/CD

1. Make code changes
2. Commit and push to main branch
3. GitLab CI automatically:
   - Runs tests
   - Builds images
   - Pushes to registry
   - Deploys to test environment
4. For production:
   - Manual approval required
   - Approve in GitLab CI pipeline
   - Deployment proceeds automatically

## Monitoring

### Viewing Metrics in Grafana

1. Access Grafana (see Accessing Resources)
2. Navigate to Dashboards
3. Available dashboards:
   - Kubernetes Cluster Metrics
   - Database Metrics
   - Application Logs
   - Cloud Provider Metrics

### Viewing Logs in Grafana

1. Access Grafana
2. Go to Explore
3. Select Loki data source
4. Query application logs:
   ```
   {namespace="sample-app", app="frontend"}
   ```

### Prometheus Alerts

- Alerts are configured in Prometheus
- Notifications sent to: [Slack/Teams/Discord]
- View alerts in Prometheus UI or Grafana

## Database Management

### Accessing Database

#### Via kubectl Port Forward
```bash
# Get database endpoint from Secret Manager
# Port forward to database
kubectl port-forward svc/postgres -n sample-app 5432:5432

# Connect
psql -h localhost -U <username> -d <database>
```

### Backup and Restore

#### View Backups
- Check cloud provider console
- Backups are automated:
  - Test: 7 days retention
  - Prod: 30 days retention

#### Point-in-Time Recovery
- Test: 1 day retention
- Prod: 7 days retention
- Restore via cloud provider console or CLI

## DNS Management

### Automatic DNS Records
- External DNS creates records automatically
- Based on Ingress/HTTPRoute resources
- No manual DNS configuration needed

### Manual DNS Record Creation
If needed, create records in cloud provider DNS console:
- Public zone: test-public.example.com
- Private zone: test-private.example.com

## Troubleshooting

### Application Issues

#### Check Pod Status
```bash
kubectl get pods -n sample-app
kubectl describe pod <pod-name> -n sample-app
kubectl logs <pod-name> -n sample-app
```

#### Check Service Status
```bash
kubectl get svc -n sample-app
kubectl describe svc <service-name> -n sample-app
```

#### Check Ingress Status
```bash
kubectl get ingress -n sample-app
kubectl describe ingress <ingress-name> -n sample-app
```

### ArgoCD Issues

#### Check ArgoCD Application Status
```bash
argocd app get <app-name>
argocd app history <app-name>
```

#### Force Sync
```bash
argocd app sync <app-name> --force
```

#### Refresh Application
```bash
argocd app get <app-name> --refresh
```

### Database Issues

#### Check Database Connection
```bash
# From application pod
kubectl exec -it <backend-pod> -n sample-app -- sh
# Test database connection
```

#### Check External Secrets
```bash
kubectl get secret -n sample-app
kubectl describe secret <secret-name> -n sample-app
```

### Monitoring Issues

#### Check Prometheus
```bash
kubectl get pods -n monitoring | grep prometheus
kubectl logs <prometheus-pod> -n monitoring
```

#### Check Loki
```bash
kubectl get pods -n monitoring | grep loki
kubectl logs <loki-pod> -n monitoring
```

## Cost Management

### Monitoring Costs
- Check billing dashboard regularly
- Review billing alerts
- Use cost explorer tools

### Cost Optimization
- Destroy unused resources
- Use smaller instances in test
- Implement resource cleanup automation
- Review and adjust lifecycle policies

## Maintenance

### Updating Infrastructure
```bash
cd terraform/test  # or prod
terraform plan
terraform apply
```

### Updating Applications
- Update Helm chart values
- Commit changes
- ArgoCD will sync automatically (or trigger via CI/CD)

### Updating Monitoring Stack
- Update Helm chart values in ArgoCD
- Sync applications
- Verify dashboards and alerts

## Best Practices

1. **Always test in test environment first**
2. **Use GitOps for all deployments**
3. **Monitor costs regularly**
4. **Keep documentation updated**
5. **Follow least privilege principle**
6. **Use private resources when possible**
7. **Regularly review and update security configurations**

## Emergency Procedures

### Application Rollback
```bash
# Via ArgoCD
argocd app rollback <app-name> <revision>

# Or via GitLab CI
# Revert commit and push
```

### Infrastructure Rollback
```bash
cd terraform/<environment>
terraform plan
terraform apply -target=<resource>
```

### Database Recovery
1. Access cloud provider console
2. Navigate to database backups
3. Select restore point
4. Initiate restore
5. Update application if needed

---

