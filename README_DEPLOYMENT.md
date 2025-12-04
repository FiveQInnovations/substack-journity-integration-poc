# Quick Deployment Guide

## The Problem

Cloudflare has **two different services**:
- **Workers** - Run JavaScript code (like `worker.js`)
- **Pages** - Serve static files (like `index.html`)

You currently have a **Worker** deployed, but you need **Pages** for your HTML form.

## Quick Fix

### Step 1: Create a Pages Project (Not Worker!)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click **Workers & Pages** → **Pages** (make sure it says "Pages", not "Workers")
3. Click **Create a project**
4. Connect to GitHub repo: `FiveQInnovations/substack-journity-integration-poc`
5. **Build Settings:**
   - Framework: `None`
   - Build command: (empty)
   - **Deploy command**: `./deploy.sh`
   - Root directory: `/`
6. Click **Save and Deploy**

### Step 2: Your Pages URL

After deployment, your Pages URL will be:
```
https://substack-journity-integration-poc.pages.dev
```

This will serve your `index.html` form, not "Hello world".

## Current URLs

- **Worker** (wrong): `https://substack-journity-integration-poc.1-five-q-innovations.workers.dev/` → Returns "Hello world"
- **Pages** (what you need): `https://substack-journity-integration-poc.pages.dev` → Will serve your HTML form

## Two Projects Needed

1. **Pages Project** - Serves your HTML form (`index.html`)
2. **Worker Project** (optional) - Proxies Substack subscriptions (`worker.js`)

These are separate deployments in Cloudflare!
