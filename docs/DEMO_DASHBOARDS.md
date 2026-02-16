# Demonstrating Grafana Dashboards

Use this guide to show that the monitoring dashboards (requirements 63, 64, 65) are in place and working.

## Prerequisites

- `kubectl` context set to your **production** cluster.
- Sample app frontend reachable (e.g. https://www.voyager-demo.xyz or your prod URL).

---

## Step 1: Open Grafana

**Option A – Port-forward (simplest)**

```powershell
kubectl port-forward svc/grafana -n monitoring 3000:80
```

Then open **http://localhost:3000** in your browser.

**Option B – Internal load balancer**

If you use the internal LB for Grafana (e.g. via IAP or VPN), open that URL instead.

**Login**

- Username: `admin`
- Password: `admin` (or the value you set via `GF_SECURITY_ADMIN_PASSWORD`)

---

## Step 2: Show data sources (requirement 62)

1. Left sidebar → **Connections** (or **Configuration**) → **Data sources**.
2. You should see **Prometheus** (default) and **Loki**.
3. Click **Prometheus** → show URL: `http://prometheus-prometheus.monitoring.svc.cluster.local:9090`.
4. Click **Loki** → show URL: `http://loki.monitoring.svc.cluster.local:3100`.

Say: *"Prometheus and Loki are configured as data sources so we can build dashboards and use Explore."*

---

## Step 3: Dashboard – Kubernetes cluster metrics (requirement 63)

1. Left sidebar → **Dashboards** → **Browse**.
2. Open **Kubernetes cluster** (or **Node Exporter** if that’s what you see first).
3. Ensure the time range (top right) includes “Last 5 minutes” or “Last 15 minutes”.
4. Point at a few panels, for example:
   - CPU usage, memory usage, or pod count.
   - Node status or cluster overview.

**What to say:** *"This dashboard uses Prometheus and shows cluster and node metrics — CPU, memory, pod counts. We use it to see if the cluster or workloads need attention."*

---

## Step 4: Dashboard – Postgres metrics (requirement 64)

1. **Dashboards** → **Browse**.
2. Open **PostgreSQL** (or **Postgres**).
3. Point at panels such as:
   - Connections, transactions, cache hit ratio, table size.

**What to say:** *"These metrics come from the Prometheus Postgres exporter. They show database activity and performance and help spot issues like connection exhaustion or slow queries."*

---

## Step 5: Sample app logs in Loki (requirement 65)

**5.1 Generate logs in the sample app**

1. Open the **sample app frontend** (e.g. https://www.voyager-demo.xyz).
2. **Register** a new user (e.g. test email).
3. **Log in** with that user.
4. **Log out**.

**5.2 Show logs in Grafana**

1. In Grafana, left sidebar → **Explore** (compass icon).
2. At the top, choose data source **Loki**.
3. In the query box, use one of:
   - `{namespace="sample-app"}`
   - `{namespace="sample-app"} |= "login"` (or `"register"`, `"logout"`)
4. Set time range to **Last 15 minutes** (or **Last 5 minutes**).
5. Click **Run query** (or press Enter).
6. Point at log lines that match your actions (e.g. login, register, logout).

**What to say:** *"We registered, logged in, and logged out in the sample app. These log lines in Loki correspond to those actions, so we can trace user activity and troubleshoot issues."*

---

## Quick reference

| Requirement | Where in Grafana | What to show |
|-------------|------------------|--------------|
| 62 – Data sources | Connections → Data sources | Prometheus + Loki with correct URLs |
| 63 – K8s metrics | Dashboards → Kubernetes cluster / Node Exporter | Cluster/node panels, short explanation |
| 64 – Postgres | Dashboards → PostgreSQL | Postgres panels, short explanation |
| 65 – Sample app logs | Explore → Loki, query `{namespace="sample-app"}` | Register/login/logout in app, then matching log lines |

If a dashboard is missing (e.g. not yet provisioned), you can import it:

- **Kubernetes cluster:** ID `7249`, datasource Prometheus.
- **Node Exporter:** ID `1860`, datasource Prometheus.
- **PostgreSQL:** ID `9628`, datasource Prometheus.
- **Loki logs:** ID `13639`, datasource Loki.

(These IDs are already referenced in the Grafana app values.)
