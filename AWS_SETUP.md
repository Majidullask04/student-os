# Student OS: one-time AWS setup

Result: every push to `main` runs tests, builds the Docker image, pushes it to **ECR**, rolls it out on **App Runner**, and smoke-tests `/health`. The frontend deploys on **Amplify Hosting** on every push to `main`.

```
git push main
   |-- GitHub Actions: test -> docker build -> ECR -> App Runner (backend API)
   '-- Amplify Hosting: npm ci -> vite build -> CloudFront (frontend)
```

Files to copy into your repo (same paths, repo root):

| File | Purpose |
|---|---|
| `.github/workflows/deploy-backend.yml` | test, build, push to ECR, deploy to App Runner |
| `.github/workflows/ci.yml` | replaces your current ci.yml: all 5 test suites, Docker build check, frontend build |
| `amplify.yml` | Amplify build spec for the `frontend/` folder |
| `backend/.dockerignore` | keeps `.env`, caches and tests out of the image |

Do the steps **in this order**. Each needs the one before it.

---

## Step 0. Prerequisites

- AWS account created, student status verified on Builder Center.
- AWS CLI installed and logged in (`aws configure`, or use CloudShell in the console, which needs no setup).
- Set these variables in your terminal (CloudShell works):

```bash
export AWS_REGION=ap-south-1          # use a region where App Runner is available
export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export GH_REPO=Majidullask04/student-os
```

## Step 1. Create the ECR repository

```bash
aws ecr create-repository \
  --repository-name student-os-backend \
  --region $AWS_REGION \
  --image-scanning-configuration scanOnPush=true

# Optional cost hygiene: keep only the 10 newest images
aws ecr put-lifecycle-policy --repository-name student-os-backend --region $AWS_REGION \
  --lifecycle-policy-text '{"rules":[{"rulePriority":1,"description":"keep last 10","selection":{"tagStatus":"any","countType":"imageCountMoreThan","countNumber":10},"action":{"type":"expire"}}]}'
```

## Step 2. Let GitHub deploy without stored keys (OIDC role)

```bash
# 2a. Trust GitHub's OIDC provider (skip if it says EntityAlreadyExists)
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1

# 2b. Trust policy: ONLY your repo's main branch may assume the role
cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::${ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
      "StringLike":   { "token.actions.githubusercontent.com:sub": "repo:${GH_REPO}:ref:refs/heads/main" }
    }
  }]
}
EOF

# 2c. Permissions: push to this one ECR repo, and deploy this one App Runner service
cat > deploy-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    { "Sid": "EcrLogin", "Effect": "Allow", "Action": "ecr:GetAuthorizationToken", "Resource": "*" },
    { "Sid": "EcrPush", "Effect": "Allow",
      "Action": ["ecr:BatchCheckLayerAvailability","ecr:BatchGetImage","ecr:CompleteLayerUpload",
                 "ecr:GetDownloadUrlForLayer","ecr:InitiateLayerUpload","ecr:PutImage","ecr:UploadLayerPart"],
      "Resource": "arn:aws:ecr:${AWS_REGION}:${ACCOUNT_ID}:repository/student-os-backend" },
    { "Sid": "AppRunnerDeploy", "Effect": "Allow",
      "Action": ["apprunner:StartDeployment","apprunner:DescribeService","apprunner:ListOperations"],
      "Resource": "arn:aws:apprunner:${AWS_REGION}:${ACCOUNT_ID}:service/student-os-api/*" }
  ]
}
EOF

aws iam create-role --role-name student-os-github-deploy \
  --assume-role-policy-document file://trust-policy.json
aws iam put-role-policy --role-name student-os-github-deploy \
  --policy-name deploy --policy-document file://deploy-policy.json

echo "AWS_ROLE_ARN = arn:aws:iam::${ACCOUNT_ID}:role/student-os-github-deploy"
```

The App Runner service name in the policy is `student-os-api`. Use exactly that name in Step 4.

## Step 3. Add GitHub settings and push the first image

GitHub repo -> Settings -> Secrets and variables -> Actions:

- **Secret** `AWS_ROLE_ARN` = the ARN printed above
- **Variable** `AWS_REGION` = `ap-south-1` (or your region)

Commit the four files to `main` (merge `majid-1`). Then run the workflow once by hand: Actions tab -> "Deploy backend to AWS" -> Run workflow. It will test, build, and push the image to ECR. It skips the App Runner steps because `APPRUNNER_SERVICE_ARN` isn't set yet. Confirm the image exists:

```bash
aws ecr describe-images --repository-name student-os-backend --region $AWS_REGION
```

## Step 4. Create the App Runner service (console, about 5 minutes)

App Runner -> Create service:

1. **Source:** Container registry -> Amazon ECR -> pick `student-os-backend:latest`.
2. **Deployment trigger: Manual** (the workflow triggers deployments itself).
3. **ECR access role:** "Create new service role" (the console creates it).
4. **Service name:** `student-os-api`
5. **Port:** `8000`
6. **Environment variables:**

| Name | Value |
|---|---|
| `SUPABASE_URL` | your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `SUPABASE_JWT_SECRET` | your Supabase project JWT secret |
| `GEMINI_API_KEY` | your Gemini key |
| `CORS_ORIGINS` | `http://localhost:5173,https://student-os-lime-psi.vercel.app` (add the Amplify URL in Step 5) |

7. **Health check:** protocol HTTP, path `/health`.
8. **Instance:** 1 vCPU / 2 GB is plenty. Auto scaling: min 1, max 1 or 2.
9. Create. When it shows **Running**, open the default domain + `/health`.

Then copy the service ARN into GitHub as **Secret** `APPRUNNER_SERVICE_ARN`. From now on every push to `main` redeploys automatically.

Optional upgrade (good for your architecture story): store the keys in AWS Secrets Manager and reference them as App Runner runtime secrets, using an instance role that can read them.

## Step 5. Deploy the frontend on Amplify

Amplify console -> Create new app -> Host web app -> GitHub -> `student-os` -> branch `main`.

1. Environment variables:
   - `AMPLIFY_MONOREPO_APP_ROOT` = `frontend`
   - `VITE_API_URL` = `https://<your-app-runner-domain>` (no trailing slash)
2. The `amplify.yml` at the repo root is picked up automatically. Save and deploy.
3. Rewrites and redirects -> add rule so page refreshes work on React routes:
   - Source: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>`
   - Target: `/index.html`
   - Type: `200 (Rewrite)`
4. Copy the Amplify URL (`https://main.<id>.amplifyapp.com`), add it to `CORS_ORIGINS` on App Runner, then redeploy the service (change the env var and save, or re-run the workflow).

`VITE_API_URL` is baked in at build time. If you change it, trigger a new Amplify build.

## Step 6. Verify (do all of these)

- [ ] `curl https://<app-runner-domain>/health` returns `"status":"healthy"`
- [ ] It says `"database":"connected"`, not `in-memory-active` (otherwise Supabase env vars are missing)
- [ ] Open the Amplify URL, refresh a deep link such as `/roadmap`, and it still loads
- [ ] Browser DevTools -> Network shows calls going to the App Runner domain, with no CORS errors
- [ ] An Assistant reply takes a few seconds and the response says `gemini-live`, not canned data
- [ ] Push a tiny change to `main`, and watch the Actions run go green and the site update

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| `Not authorized to perform sts:AssumeRoleWithWebIdentity` | The trust policy repo or branch doesn't match, or the workflow lacks `id-token: write`. Check `GH_REPO` and that you pushed from `main`. |
| `AccessDenied` on ECR push | Repo name or region mismatch. Names must match `student-os-backend` and your `AWS_REGION`. |
| App Runner deployment FAILED, health check failing | Look at the service's CloudWatch logs. Usually a missing env var crashed startup. Check port `8000` and path `/health`. |
| `exec format error` in logs | The image was built for arm64 (an Apple Silicon local build). Use the CI-built image. |
| Browser CORS error | The exact site URL isn't in `CORS_ORIGINS` (scheme included, no trailing slash). Update it and redeploy. |
| Amplify blank page or 404 on refresh | The rewrite rule in Step 5 is missing. |
| Amplify build fails with a Node or Vite error | Keep the `nvm install 22` lines in `amplify.yml`. Vite needs Node 20.19+ or 22.12+. |
| Site shows data but AI feels canned | `VITE_API_URL` isn't set at Amplify build time, so the app is falling back to mock data. |

## Cost and safety

- Create a billing budget alert (Billing -> Budgets) at a few dollars.
- **Keep the service running until judging is over.** Judges may open your URL after the deadline. After results, `aws apprunner pause-service` or delete the service to stop charges.
- Never commit AWS keys or `.env` files. This setup needs no AWS keys in GitHub at all.
