# Cloudflare Pages Build Configuration

## For Static HTML Site (No Build Needed)

When setting up the Pages project in Cloudflare Dashboard:

### Build Settings:
- **Framework preset**: `None` or `Plain HTML`
- **Build command**: (leave empty)
- **Build output directory**: `/` (root directory)
- **Root directory**: `/` (or leave default)

### Important:
- **DO NOT** set a deploy command - Pages will auto-detect static files
- The `wrangler.toml` file is for Workers, not Pages
- Pages will automatically serve `index.html` from the root

## Alternative: Remove wrangler.toml for Pages

If Cloudflare Pages keeps trying to use `wrangler deploy`, you can:

1. **Rename `wrangler.toml`** to `wrangler.toml.pages` (so it's ignored)
2. **Or delete it** if you're only deploying Pages (not Workers)
3. **Or create a separate directory** for Pages vs Workers

## Recommended Structure:

```
substack-integration-poc/
├── index.html          # Pages serves this
├── package.json
├── worker.js           # For Worker deployment (separate)
├── wrangler-worker.toml # For Worker deployment
└── (no wrangler.toml)  # Pages doesn't need this
```
