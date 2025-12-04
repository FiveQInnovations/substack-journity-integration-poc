# Deployment Guide

## Cloudflare Pages (Recommended)

This is a static site (HTML/CSS/JS) that's perfect for Cloudflare Pages.

### Option 1: Deploy via GitHub Integration (Easiest)

1. **Go to Cloudflare Dashboard**
   - Navigate to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Go to **Workers & Pages** → **Pages**
   - Click **Create a project**

2. **Connect to GitHub**
   - Select **Connect to Git**
   - Authorize Cloudflare to access your GitHub
   - Select the repository: `FiveQInnovations/substack-journity-integration-poc`

3. **Configure Build Settings**
   - **Framework preset**: None (or "Plain HTML")
   - **Build command**: (leave empty - no build needed)
   - **Build output directory**: `/` (root directory)
   - **Root directory**: `/` (or leave default)

4. **Deploy**
   - Click **Save and Deploy**
   - Your site will be live at: `https://substack-journity-integration-poc.pages.dev`

5. **Custom Domain (Optional)**
   - Go to **Custom domains** in your Pages project
   - Add your domain (e.g., `substack-poc.yourdomain.com`)

### Option 2: Deploy via Wrangler CLI

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy from the project directory
cd /Users/anthony/internal/journity/substack-integration-poc
wrangler pages deploy . --project-name=substack-journity-integration-poc
```

## Important Considerations

### CORS Issues with Substack

The form attempts to submit directly to Substack, but this will likely fail due to:
- **CORS restrictions**: Substack blocks cross-origin requests
- **CSRF protection**: Substack requires CSRF tokens

**Solutions:**

1. **Use the Proxy Server** (`server.js`):
   - Deploy the Node.js server separately (e.g., Railway, Render, Fly.io)
   - Update the form to POST to your proxy server instead
   - Proxy server handles CORS and forwards to both services

2. **Use Cloudflare Workers** (Recommended):
   - Create a Cloudflare Worker to handle the Substack submission
   - Worker acts as a proxy, avoiding CORS issues
   - Can be deployed alongside Pages

### Environment Variables (if needed)

If you need to configure different endpoints per environment:

1. In Cloudflare Pages dashboard:
   - Go to **Settings** → **Environment variables**
   - Add variables like:
     - `FORM_API_URL` = `https://f.journity.com/v1/email-form`
     - `SUBSTACK_URL` = `https://humanitasinstitute.substack.com/`

2. Update `index.html` to read from environment:
   ```javascript
   const FORM_API_URL = import.meta.env.VITE_FORM_API_URL || 'https://f.journity.com/v1/email-form';
   ```

## Alternative Hosting Options

### GitHub Pages
```bash
# Enable GitHub Pages in repo settings
# Select main branch, / (root) directory
# Site will be at: https://fiveqinnovations.github.io/substack-journity-integration-poc/
```

### Netlify
1. Connect GitHub repo to Netlify
2. Build command: (empty)
3. Publish directory: `/`
4. Deploy!

### Vercel
```bash
npm install -g vercel
vercel
```

## Testing After Deployment

1. Visit your deployed URL
2. Verify form fields are pre-filled correctly
3. Test with a real email address
4. Check browser console for any CORS errors
5. Verify Journity submission succeeds
6. Note Substack submission status (may show as pending)

## Troubleshooting

### CORS Errors
- Substack will block direct browser requests
- Use proxy server or Cloudflare Worker solution

### Form Not Submitting
- Check browser console for errors
- Verify Journity API endpoint is accessible
- Ensure waypoint is active in Journity dashboard

### Build Failures
- This is a static site - no build needed
- If Cloudflare Pages shows build errors, set build command to empty
