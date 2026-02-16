# Backend .env.test in Kubernetes

When `ENV=test`, the backend app looks for a file at `/.env.test` (from working dir `/app`, path `../.env.test` → `/.env.test`).

- **ConfigMap** `backend-env-file` provides a minimal `.env.test` with non-secret keys only.
- **Secrets** (POSTGRES_USER, POSTGRES_PASSWORD, JWT_KEY) are injected by the deployment from the ExternalSecret; they are not put in the ConfigMap so they are not overwritten when the app loads the file.

The deployment mounts the ConfigMap at `/.env.test` so the app finds the file and starts.
