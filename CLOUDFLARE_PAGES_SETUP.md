# Cloudflare Pages Setup Instructions

## Required Build Settings

When setting up your Cloudflare Pages project, use these exact settings:

### Build Configuration:

- **Build command**: (leave empty)
- **Deploy command**: `./deploy.sh`
  - If `./deploy.sh` doesn't work, try: `bash deploy.sh`
  - Or: `echo "Deploying static site"`
- **Root directory**: `/`
- **Framework preset**: `None` or `Plain HTML`

### Why a Deploy Command?

Cloudflare Pages requires a deploy command field to be filled. Since this is a static HTML site with no build process, we use a minimal script (`deploy.sh`) that:
- Satisfies Cloudflare's requirement
- Does nothing (no-op) since Pages handles static file serving automatically
- Allows Pages to detect and serve `index.html` automatically

### Alternative Deploy Commands (if deploy.sh doesn't work):

1. `echo "Static site deployment"`
2. `bash deploy.sh`
3. `true` (Unix command that always succeeds)

The deploy command doesn't actually need to do anything - Pages will automatically serve your static files from the repository root.
