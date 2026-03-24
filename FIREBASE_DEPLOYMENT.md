# Firebase Deployment Guide

This project should be deployed as:

- Firebase Hosting for the frontend
- Cloud Run for the Express backend

Do not deploy this repo to Firebase Hosting only, because `/api/*` routes need a server runtime.

## 1. Prerequisites

Install the CLIs:

```powershell
npm install -g firebase-tools
```

Install Google Cloud CLI:

https://cloud.google.com/sdk/docs/install

Login:

```powershell
firebase login
gcloud auth login
```

Set the correct Google Cloud project:

```powershell
gcloud config set project YOUR_PROJECT_ID
firebase use --add
```

You can copy `.firebaserc.example` to `.firebaserc` and replace the project id.

## 2. Build Locally

Frontend only:

```powershell
npm.cmd run build
```

Full production build:

```powershell
npm.cmd run build:all
```

Outputs:

- frontend: `dist/public`
- backend: `dist/index.cjs`

## 3. Deploy Backend to Cloud Run

This repo includes a `Dockerfile` for Cloud Run.

Deploy:

```powershell
gcloud run deploy neetpeak-api `
  --source . `
  --region asia-south1 `
  --allow-unauthenticated
```

After deployment, set these environment variables in Cloud Run:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `SHIPROCKET_EMAIL`
- `SHIPROCKET_PASSWORD`
- `SHIPROCKET_PICKUP_LOCATION`
- `SHIPROCKET_PICKUP_PINCODE`

Use the Cloud Run console or:

```powershell
gcloud run services update neetpeak-api `
  --region asia-south1 `
  --set-env-vars SUPABASE_URL=...,SUPABASE_SERVICE_KEY=...,RAZORPAY_KEY_ID=...,RAZORPAY_KEY_SECRET=...
```

## 4. Deploy Frontend to Firebase Hosting

The included `firebase.json` is already configured to:

- serve `dist/public`
- rewrite `/api/**` to the Cloud Run service `neetpeak-api`
- rewrite all frontend routes to `index.html`

Deploy Hosting:

```powershell
npm.cmd run build
firebase deploy --only hosting
```

## 5. Custom Domain

In Firebase Console:

- open Hosting
- add custom domain
- update DNS records at your domain provider

## 6. Important Checks After Deploy

Verify these flows:

- homepage loads
- `/materials` works
- `/login` works
- free material download requires login
- paid checkout works
- `/dashboard` loads purchases
- admin routes work
- `/api/*` routes respond through Firebase domain

## 7. Notes

- Hosting rewrite points to:
  - service: `neetpeak-api`
  - region: `asia-south1`
- If you rename the Cloud Run service or region, update `firebase.json`
- Keep production secrets in Cloud Run, not in `.env`
