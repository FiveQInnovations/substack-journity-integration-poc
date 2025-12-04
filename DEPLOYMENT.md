# Deployment Guide

## Architecture: Pages + Worker

This project uses a **two-part deployment**:

1. **Cloudflare Pages** - Serves the static HTML form (frontend)
2. **Cloudflare Worker** - Proxies Substack subscriptions (handles CORS)

## Deployment Steps

### Step 1: Deploy the Worker (Substack Proxy)

The Worker handles CORS and forwards requests to Substack.

```bash
# Install Wrangler if you haven't already
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy the Worker
cd /Users/anthony/internal/journity/substack-integration-poc
wrangler deploy --config wrangler-worker.toml
```

After deployment, note your Worker URL (e.g., `https://substack-proxy.your-subdomain.workers.dev`)

### Step 2: Update Worker URL in HTML

Edit `index.html` and update the `WORKER_URL` constant:

```javascript
const WORKER_URL = 'https://substack-proxy.your-subdomain.workers.dev';
```

### Step 3: Deploy Pages (Frontend)

#### Option A: GitHub Integration (Easiest)

1. **Go to Cloudflare Dashboard**
   - Navigate to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Go to **Workers & Pages** → **Pages**
   - Click **Create a project**

2. **Connect to GitHub**
   - Select **Connect to Git**
   - Authorize Cloudflare to access your GitHub
   - Select the repository: `FiveQInnovations/substack-journity-integration-poc`

3. **Configure Build Settings**
   - **Framework preset**: `None` or `Plain HTML`
   - **Build command**: (leave empty)
   - **Deploy command**: `./deploy.sh` (or `bash deploy.sh` if that doesn't work)
   - **Build output directory**: `/` (root directory)
   - **Root directory**: `/` (or leave default)
   - **Environment variables**: (optional) Add any needed vars here

4. **Deploy**
   - Click **Save and Deploy**
   - Your site will be live at: `https://substack-journity-integration-poc.pages.dev`

**Note:** Cloudflare Pages requires a deploy command. The `deploy.sh` script is a minimal no-op script that satisfies this requirement. Pages will automatically serve your static files.

#### Option B: Wrangler CLI

```bash
wrangler pages deploy . --project-name=substack-journity-integration-poc
```

### Step 4: Custom Domain (Optional)

For both Pages and Worker:

**Pages:**
- Go to **Custom domains** in your Pages project
- Add your domain (e.g., `substack-poc.yourdomain.com`)

**Worker:**
- Add route in `wrangler-worker.toml`:
  ```toml
  routes = [
    { pattern = "substack-api.yourdomain.com/*", zone_name = "yourdomain.com" }
  ]
  ```

## Architecture Diagram

```
User Browser
    ↓
Cloudflare Pages (Static HTML/CSS/JS)
    ↓
Form Submission
    ├─→ Journity API (direct, no CORS issues)
    └─→ Cloudflare Worker (proxy)
            ↓
        Substack API (no CORS issues from Worker)
```

## Benefits of This Approach

✅ **No CORS Issues**: Worker acts as proxy, avoiding browser CORS restrictions  
✅ **Better Error Handling**: Can read and parse Substack responses  
✅ **Scalable**: Cloudflare Workers handle high traffic automatically  
✅ **Fast**: Both Pages and Workers run on Cloudflare's edge network  
✅ **Free Tier**: Both Pages and Workers have generous free tiers  

## Environment Variables

### Worker Environment Variables (if needed)

In `wrangler-worker.toml`:
```toml
[vars]
DEFAULT_SUBSTACK_URL = "https://humanitasinstitute.substack.com/"
```

### Pages Environment Variables (if needed)

In Cloudflare Pages dashboard:
- Go to **Settings** → **Environment variables**
- Add variables like:
  - `WORKER_URL` = `https://substack-proxy.your-subdomain.workers.dev`

## Testing After Deployment

1. Visit your Pages URL
2. Verify form fields are pre-filled correctly
3. Test with a real email address
4. Check browser console for any errors
5. Verify both Journity and Substack submissions succeed
6. Check Worker logs in Cloudflare dashboard

## Troubleshooting

### Worker Not Responding
- Check Worker URL is correct in `index.html`
- Verify Worker is deployed: `wrangler tail` to see logs
- Check Worker logs in Cloudflare dashboard

### CORS Errors
- Ensure Worker URL is set correctly
- Verify Worker returns proper CORS headers
- Check browser console for specific error messages

### Form Not Submitting
- Check browser console for errors
- Verify Journity API endpoint is accessible
- Ensure waypoint is active in Journity dashboard
- Test Worker directly: `curl -X POST https://your-worker.workers.dev -d '{"email":"test@example.com"}'`

## Alternative: Single Deployment (Pages Only)

If you don't want to use a Worker, you can deploy just Pages:

1. Set `USE_WORKER_PROXY = false` in `index.html`
2. Deploy only Pages
3. Accept that Substack will show as "pending" (Journity will still work)

## Cost

- **Cloudflare Pages**: Free (unlimited requests)
- **Cloudflare Workers**: Free tier includes 100,000 requests/day
- **Total**: $0/month for typical usage
