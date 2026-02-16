# Alerting setup (Slack / Discord)

Prometheus Alertmanager is configured to send alerts to a messaging app. To receive alerts, set a webhook URL and (optionally) trigger a test alert.

## 1. Create a webhook

### Slack

1. Go to [api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → **From scratch** (or use an existing app).
2. Open **Incoming Webhooks** → turn **On** → **Add New Webhook to Workspace** and pick the channel (e.g. `#alerts`).
3. Copy the webhook URL (e.g. `https://hooks.slack.com/services/T00/B00/xxxx`).

### Discord

1. In your Discord server: **Server settings** → **Integrations** → **Webhooks** → **New Webhook**.
2. Name it (e.g. "Alerts"), choose a channel, copy the **Webhook URL** (e.g. `https://discord.com/api/webhooks/123/abc...`).
3. Alertmanager’s default webhook payload is Slack-oriented. For Discord you can:
   - Use the URL in the **Slack** field below and a bridge (e.g. [prometheus-discord](https://github.com/nicolasvan/prometheus-discord)) that converts Slack-style payloads to Discord, or
   - Use the URL in a **Discord**-specific receiver (see “Optional: Discord receiver” below) and accept that messages may appear as raw JSON unless you add an adapter.

## 2. Set the webhook URL (do not commit it)

**Option A – Values override (recommended)**

1. Create a small override file that is **not** in git (e.g. `argocd/production/applications/values-prometheus-alerts.yaml` and add it to `.gitignore`), or use a CI secret / Argo CD project/secret.
2. In that file (or in the main `values.yaml` only if you are sure it is not pushed), set:

   ```yaml
   applications:
     prometheus:
       # Slack
       alertmanagerWebhookUrl: "https://hooks.slack.com/services/YOUR/WEBHOOK/HERE"
       # Discord (optional; same alerts also go to Discord)
       alertmanagerDiscordWebhookUrl: "https://discord.com/api/webhooks/ID/TOKEN"
   ```

3. Render/sync so the Prometheus app gets this value (e.g. point the app-of-apps at this file, or merge this file into the values used when deploying the parent chart).

**Option B – Argo CD UI**

1. In Argo CD, open the **prometheus** Application.
2. Click **Edit** (or **App Details** → **Edit**).
3. Under **Helm** → **Values**, find the `alertmanager` → `config` → `receivers` → `slack` → `slack_configs` → `api_url` line (or the raw YAML block).
4. Replace the placeholder URL with your webhook URL and save.

**Option C – Secret and template (advanced)**

Store the URL in a Secret (e.g. from External Secrets or GCP Secret Manager) and have your deployment pipeline or a tool inject it into the Application’s Helm values so the chart never sees a literal URL in git.

## 3. Sync and reload

- Sync the **prometheus** (or parent) application in Argo CD so Alertmanager gets the new config.
- Restart Alertmanager so it picks up the config (optional; it often reloads automatically):

  ```powershell
  kubectl rollout restart statefulset alertmanager-prometheus-alertmanager -n monitoring
  ```

## 4. Trigger a test alert

1. **Temporarily scale down a target** so Prometheus marks it down and fires an alert (e.g. `TargetDown`):

   ```powershell
   kubectl scale deployment backend -n sample-app --replicas=0
   ```

2. Wait 1–2 minutes for the alert to fire and Alertmanager to send it.
3. Check your Slack (or Discord) channel for the message.
4. **Scale back up** when done:

   ```powershell
   kubectl scale deployment backend -n sample-app --replicas=1
   ```

## Discord

The chart supports an optional **Discord** receiver. Set `applications.prometheus.alertmanagerDiscordWebhookUrl` (e.g. in the same override as above). Critical alerts will be sent to both Slack and Discord when both URLs are set. Discord receives the default Alertmanager webhook payload (JSON); for a friendlier format in Discord you can use an adapter (e.g. [prometheus-discord](https://github.com/nicolasvan/prometheus-discord)).

## Summary

| Step | Action |
|------|--------|
| 1 | Create Slack and/or Discord webhook; copy the URL(s). |
| 2 | Set `alertmanagerWebhookUrl` (Slack) and optionally `alertmanagerDiscordWebhookUrl` (override or Argo CD UI); do not commit URLs. |
| 3 | Sync the prometheus app and optionally restart Alertmanager. |
| 4 | Trigger a test alert (e.g. scale down `backend`) and confirm the message in Slack/Discord. |
