# Phase 6: GitLab CI One-Time Setup

The pipeline in `.gitlab-ci.yml` runs tests, builds images with GCP Cloud Build, and pushes to Artifact Registry. You need a GCP service account key in GitLab so the runner can authenticate.

## 1. GCP service account for GitLab CI

**Already created:** `gitlab-ci@voyager-shared-486811.iam.gserviceaccount.com` with `roles/cloudbuild.builds.editor`, `roles/artifactregistry.writer`, and `roles/storage.admin` (for Cloud Build’s staging bucket).

**Required for `gcloud builds submit`:** The runner must be allowed to *act as* the build’s worker service account. Grant **Service Account User** on the project’s default Compute Engine SA:

```powershell
gcloud iam service-accounts add-iam-policy-binding 641920169088-compute@developer.gserviceaccount.com --project=voyager-shared-486811 --member="serviceAccount:gitlab-ci@voyager-shared-486811.iam.gserviceaccount.com" --role="roles/iam.serviceAccountUser" --quiet
```

Without this, builds fail with: `PERMISSION_DENIED: caller does not have permission to act as service account ...`.

**Required for log streaming:** So that `gcloud builds submit` can stream build logs and the job can wait for completion, the gitlab-ci SA must have **Viewer** on the project:

```powershell
gcloud projects add-iam-policy-binding voyager-shared-486811 --member="serviceAccount:gitlab-ci@voyager-shared-486811.iam.gserviceaccount.com" --role="roles/viewer" --quiet
```

Without this, the build is created but the job fails with an error about not being able to stream logs from the default logs bucket.

## 2. Create key and add to GitLab

Run once (in a directory you can delete the key from):

```powershell
gcloud iam service-accounts keys create gitlab-ci-key.json --iam-account=gitlab-ci@voyager-shared-486811.iam.gserviceaccount.com --project=voyager-shared-486811
```

Then add the key to GitLab (step 3) and delete the local file: `del gitlab-ci-key.json`

## 3. GitLab CI/CD variables

In GitLab: **Settings → CI/CD → Variables** (or **Settings → Repository → Variables**).

| Variable    | Type | Protected | Masked | Value |
|------------|------|-----------|--------|--------|
| `GCP_SA_KEY` | **File** | ✓ | ✗ | Contents of `gitlab-ci-key.json` (upload or paste). |

- **File** type makes the key available as a path in the job; the pipeline uses it as `$GCP_SA_KEY` and writes it to `/tmp/gcp-key.json` for `gcloud auth`.
- After adding the variable, delete the local `gitlab-ci-key.json` and do not commit it.

## 4. Run the pipeline

Push to `main` or open a merge request:

- **test**: backend `go test ./...`
- **build**: `gcloud builds submit` for backend and frontend; images tagged with `CI_COMMIT_SHA` and `latest`
- **deploy-test**: placeholder; Argo CD will use new images on its next sync (or trigger sync from UI/CLI)

## 5. Optional: trigger Argo CD sync from CI

To trigger a sync after a successful build, add in GitLab CI/CD variables:

- `ARGOCD_SERVER`: e.g. `https://your-argocd-server`
- `ARGOCD_TOKEN`: Argo CD API token (generate from Argo CD UI or CLI)

Then in `.gitlab-ci.yml`, uncomment the `deploy-test` script lines that call the Argo CD API.

## 6. Rollback

Rollback is done in Argo CD: sync to a previous commit or change the image tag in Helm values and sync. No code change required.
