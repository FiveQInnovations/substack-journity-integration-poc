# Substack + Journity Integration Proof of Concept

## Research Findings

### Substack API Status
- **No Official API**: Substack does not provide a public API for programmatic email subscriptions
- **Embedded Forms**: Substack uses iframe-based embedded forms that POST to their servers internally
- **Unofficial Options**: 
  - `substack-subscriber` npm package (unofficial, may violate ToS)
  - Third-party services like Supascribe offer embed forms

### Integration Approaches

#### Option 1: Dual Submission (Recommended for POC)
1. User submits email via custom form
2. Form POSTs to Journity `/v1/email-form` endpoint (stores in Cassandra)
3. Form also POSTs to Substack's subscription endpoint (reverse-engineered from embedded forms)
4. Both submissions happen client-side or via a proxy server

#### Option 2: Proxy Server Approach
1. Create a backend service that receives form submissions
2. Store in Journity via form-api
3. Forward to Substack using their subscription endpoint
4. Handle errors gracefully (if Substack fails, Journity still has the data)

#### Option 3: Webhook/Post-Submit Processing
1. Form submits to Journity only
2. Journity stores submission in Cassandra
3. Zapier/webhook triggers Substack subscription
4. Requires finding Substack's subscription endpoint

### Substack Publication URLs
- https://humanitasinstitute.substack.com/ (Humanitas Forum)
- https://christopherperrin.substack.com/
- https://classicaledreview.substack.com/
- https://andrewkern.substack.com/

## Proof of Concept

This POC demonstrates Option 1 (Dual Submission) with a simple HTML/JS form that:
- Captures email address
- Submits to Journity form-api
- Attempts to subscribe to Substack

### Files
- `index.html` - Simple form interface
- `server.js` - Optional Node.js proxy server (if needed)
- `find_waypoint_config.js` - Helper script to find waypoint configuration
- `package.json` - Dependencies

## Testing

### Prerequisites
- Journity form-api endpoint URL
- Substack publication URL
- Form configuration (aid, ctaHashId) for Journity

### Running the POC
1. Open `index.html` in a browser
2. Configure the form with your Journity and Substack details
3. Submit test email addresses
4. Verify submissions in both systems

## Next Steps

1. **Test Substack Endpoint**: Reverse-engineer Substack's subscription POST endpoint
2. **Error Handling**: Implement robust error handling for failed Substack submissions
3. **Production Integration**: Integrate into Journity's form-api as a new integration type
4. **Multi-Publication Support**: Allow selecting which Substack publication(s) to subscribe to

## Notes

- Substack's subscription mechanism may change without notice
- Unofficial methods may violate Substack's Terms of Service
- Consider reaching out to Substack for official integration options
- Alternative: Use Substack's embedded iframe form and capture submissions via webhook
