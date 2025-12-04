# Quick Start Guide

## Option 1: Standalone HTML Form (Simplest)

1. Open `index.html` in a web browser
2. Fill in the configuration:
   - **Journity Form API URL**: Your Journity form-api endpoint (e.g., `https://api.journity.com/v1/email-form`)
   - **App ID (aid)**: Your Journity application ID
   - **CTA Hash ID**: Your form's CTA hash ID
   - **Substack Publication URL**: Select from dropdown or enter custom URL
3. Enter test email address
4. Click "Subscribe"
5. Check results in the status area

**Note**: The standalone version may have CORS issues with Substack. Use Option 2 for better results.

## Option 2: With Proxy Server (Recommended)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open `index.html` in your browser (or navigate to `http://localhost:3000`)

4. Configure and test as described in Option 1

The proxy server handles CORS issues and provides better error handling.

## Configuration

### Journity Configuration
You'll need:
- Form API endpoint URL (e.g., `https://api.journity.com/v1/email-form`)
- App ID (`aid`) - Your Journity organization ID (e.g., `humanitasinstitute.org`)
- CTA Hash ID (`ctaHashId`) - The MongoDB ObjectId of your waypoint

### Finding Your Waypoint Configuration

**Option 1: Use the helper script**
```bash
cd substack-integration-poc
npm install
node find_waypoint_config.js --aid humanitasinstitute.org --name "Grow Email List"
```

This will output:
- Your `aid`: `humanitasinstitute.org`
- Your `ctaHashId`: The MongoDB ObjectId (e.g., `507f1f77bcf86cd799439011`)

**Option 2: Query MongoDB directly**
Connect to your MongoDB and run:
```javascript
db.ctas.findOne({
  aid: "humanitasinstitute.org",
  name: "Grow Email List"
})
```

The `ctaHashId` is the `_id` field converted to a hex string.

**Option 3: Check the Journity Dashboard**
- Navigate to your waypoint settings
- The waypoint ID should be visible in the URL or settings

### Substack Configuration
Select one of the pre-configured publications or enter a custom Substack URL:
- Humanitas Forum: `https://humanitasinstitute.substack.com/`
- Christopher Perrin: `https://christopherperrin.substack.com/`
- Classical Ed Review: `https://classicaledreview.substack.com/`
- Andrew Kern: `https://andrewkern.substack.com/`

## Testing

1. **Test Journity First**: Verify the form-api endpoint works with valid credentials
2. **Test Substack**: Try subscribing with a test email
3. **Verify Results**: Check both Journity Cassandra and Substack dashboard

## Troubleshooting

### CORS Errors
- Use the proxy server (Option 2) instead of standalone HTML
- Or configure CORS headers on your server

### Journity Errors
- Verify `aid` and `ctaHashId` are correct
- Check form-api endpoint is accessible
- Ensure form config exists in MongoDB

### Substack Errors
- Substack may require CSRF tokens (proxy server attempts to handle this)
- Check Substack publication URL is correct
- Verify email isn't already subscribed

## Next Steps

After successful POC testing:
1. Integrate into Journity's form-api as a new integration type
2. Add proper error handling and retry logic
3. Support multiple Substack publications
4. Add monitoring and logging
