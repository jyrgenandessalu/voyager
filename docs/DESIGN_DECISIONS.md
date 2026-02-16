# Design Decisions

This document records key design decisions made during the Voyager project implementation, including rationale and trade-offs.

## Cloud Provider Selection

### Decision
**Selected:** GCP (Google Cloud Platform)

### Rationale
- **Cost:** GCP was chosen based on cost analysis (e.g. Cloud Cartographer); typically lower than AWS/Azure for comparable GKE vs EKS/AKS; free GKE control plane.
- **Region:** europe-north1 for latency and compliance.
- **Ecosystem:** GKE Standard (required; no Autopilot), integrated Secret Manager, Cloud DNS, Certificate Manager, and Artifact Registry fit the stack.
- **Tooling:** Terraform GCP provider, Workload Identity for ESO/External DNS, good fit with GitOps.

### Alternatives Considered
- **AWS:** Higher cost for similar setup; EKS control plane paid.
- **Azure:** AKS viable but less familiar for this project; cost comparison favoured GCP.

### Trade-offs
- **Pros:** Cost-effective, strong Kubernetes and networking primitives, Secret Manager + IAM integrate well with External Secrets.
- **Cons:** Lock-in to GCP; multi-cloud would require abstraction or duplication.

---

## Kubernetes Cluster Mode

### Decision
**Selected:** Standard Mode (NOT Autopilot/Auto Mode)

### Rationale
- Requirement specifies standard mode
- More control over node configuration
- Ability to configure specific node pools
- Better for learning and understanding

### Alternatives Considered
- Autopilot/Auto Mode (rejected - not allowed per requirements)

### Trade-offs
- More configuration required
- More control and flexibility
- Better understanding of infrastructure

---

## Node Pool Architecture

### Decision
**Selected:** Three separate node pools (monitoring, tools, main)

### Rationale
- Separation of concerns
- Resource isolation
- Different scaling requirements
- Easier management and troubleshooting

### Alternatives Considered
- Single node pool (rejected - less isolation)
- More pools (rejected - unnecessary complexity)

### Trade-offs
- More configuration
- Better resource management
- Clearer organization

---

## GitOps Tool Selection

### Decision
**Selected:** ArgoCD with app of apps pattern

### Rationale
- Industry standard for GitOps
- Good Helm chart support
- App of apps pattern for organization
- Active community and documentation

### Alternatives Considered
- Flux (rejected - less familiar)
- Other GitOps tools (rejected - less common)

### Trade-offs
- Learning curve
- Powerful and flexible
- Good ecosystem

---

## CI/CD Approach

### Decision
**Selected:** GitLab CI + ArgoCD

### Rationale
- GitLab CI for build and test
- ArgoCD for deployment (GitOps)
- Separation of concerns
- Manual approval for production

### Alternatives Considered
- GitLab CI only (rejected - not GitOps)
- ArgoCD only (rejected - need CI for builds)

### Trade-offs
- Two systems to manage
- Clear separation of CI and CD
- Follows GitOps principles

---

## Monitoring Stack

### Decision
**Selected:** Prometheus + Loki + Grafana

### Rationale
- Industry standard stack
- Good Kubernetes integration
- Comprehensive monitoring and logging
- Good Helm chart support

### Alternatives Considered
- Cloud provider native monitoring (rejected - less portable)
- Other stacks (rejected - less common)

### Trade-offs
- More components to manage
- Comprehensive solution
- Portable across cloud providers

---

## Secrets Management

### Decision
**Selected:** Cloud provider Secret Manager + External Secrets Operator

### Rationale
- Secure storage in cloud provider
- Kubernetes integration via External Secrets
- No secrets in Git repository
- Follows best practices

### Alternatives Considered
- Kubernetes Secrets only (rejected - less secure)
- Other secret managers (rejected - more complexity)

### Trade-offs
- Additional component (External Secrets)
- Secure and compliant
- Good integration

---

## Database Configuration

### Decision
**Selected:** Managed PostgreSQL with HA in production

### Rationale
- Requirement for managed database
- HA for production reliability
- Point-in-time recovery
- Automated backups

### Alternatives Considered
- Self-managed database (rejected - more operational overhead)
- Other databases (rejected - requirement specifies PostgreSQL)

### Trade-offs
- Higher cost for managed service
- Less operational overhead
- Better reliability

---

## Network Architecture

### Decision
**Selected:** Private nodes, NAT gateway, VPN access

### Rationale
- Security best practice
- No public IPs for nodes
- VPN for secure access
- NAT for outbound internet access

### Alternatives Considered
- Public nodes (rejected - security risk)
- Other access methods (rejected - less secure)

### Trade-offs
- More complex networking
- Better security
- VPN required for access

---

## DNS Strategy

### Decision
**Selected:** Separate public and private DNS zones

### Rationale
- Requirement for both zones
- Clear separation of public and private resources
- Better security
- Easier management

### Alternatives Considered
- Single DNS zone (rejected - less secure)
- Other DNS strategies (rejected - doesn't meet requirements)

### Trade-offs
- More DNS zones to manage
- Better organization
- Clearer security boundaries

---

## Helm Chart Structure

### Decision
**Selected:** Separate Helm charts for frontend and backend

### Rationale
- Requirement for independent deployment
- Better separation of concerns
- Easier to manage and update
- Reusable across environments

### Alternatives Considered
- Single chart (rejected - can't deploy independently)
- Monolithic chart (rejected - less flexible)

### Trade-offs
- More charts to maintain
- Better flexibility
- Independent deployment

---

## Cost Optimization Strategies

### Decision
**Selected:** Multiple strategies (instance sizing, lifecycle policies, test environment optimization)

### Rationale
- Requirement to optimize costs
- Billing alerts to prevent overruns
- Smaller test environment
- Automated cleanup

### Strategies Implemented
1. **Instance Sizing:** [Details]
2. **Lifecycle Policies:** [Details]
3. **Test Environment:** Smaller instances, no HA
4. **Resource Cleanup:** [Details]

### Trade-offs
- Some complexity in automation
- Significant cost savings
- Better cost control

---

## Security Decisions

### Decision
**Selected:** Least privilege, MFA, private resources, VPN

### Rationale
- Security best practices
- Requirement for least privilege
- Requirement for MFA
- Better security posture

### Implementations
- IAM with least privilege
- MFA for all users
- Private nodes and resources
- VPN for access
- Internal load balancers

### Trade-offs
- More configuration
- Better security
- VPN required for access

---

## Additional Notes

### Decisions Pending
- [Any decisions not yet made]

### Future Considerations
- [Potential future changes or improvements]

---

