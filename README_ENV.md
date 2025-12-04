# Environment Variables Setup

## Cloudflare Token Setup

### 1. Create a Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use **Edit Cloudflare Workers** template OR create custom token with:
   - **Permissions:**
     - Account → Cloudflare Workers → Read
     - Account → Cloudflare Pages → Read
     - User → User Details → Read
   - **Account Resources:** Include your account
4. Copy the token (you'll only see it once!)

### 2. Set Up .env File

Create a `.env` file in the project root:

```bash
# Cloudflare API Token (read-only for listing resources)
CLOUDFLARE_TOKEN_READ_ONLY=your_token_here

# Optional: Full access token for deployments
# CLOUDFLARE_API_TOKEN=your_full_access_token_here
```

**Important:** 
- `.env` is already in `.gitignore` - your token won't be committed
- Never commit tokens to git
- Use read-only token for listing, full access token for deployments

### 3. Verify Token

Run the list script to verify your token works:

```bash
node list_cloudflare_resources.js
```

### 4. Using with Wrangler

For deployments, Wrangler can use environment variables:

```bash
# Set token as environment variable
export CLOUDFLARE_API_TOKEN=your_token_here

# Or use .env file (wrangler reads CLOUDFLARE_API_TOKEN automatically)
wrangler deploy
```

## Token Types

- **Read-Only Token** (`CLOUDFLARE_TOKEN_READ_ONLY`): For listing resources, viewing deployments
- **Full Access Token** (`CLOUDFLARE_API_TOKEN`): For deploying Workers and Pages

## Security Best Practices

✅ Store tokens in `.env` file (already gitignored)  
✅ Use read-only tokens when possible  
✅ Rotate tokens regularly  
✅ Never commit tokens to git  
✅ Use different tokens for different environments  
