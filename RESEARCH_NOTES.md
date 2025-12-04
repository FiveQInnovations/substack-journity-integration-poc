# Substack Integration Research Notes

## Task Context
- **Task**: Research Substack subscribe form integration with Journity/Salesforce CRM
- **Client**: Humanitas Institute
- **Goal**: Capture email addresses and send to both Journity and Substack

## Key Findings

### 1. Substack API Limitations
- **No Official API**: Substack does not provide a public API for programmatic subscriptions
- **Support Response**: "There is no timeline for when or if such an API will become available"
- **Source**: https://support.substack.com/hc/en-us/articles/360038433912-Does-Substack-have-an-API

### 2. How Substack Forms Work
- **Embedded Forms**: Substack uses iframe-based embedded forms
- **POST Endpoint**: Forms POST to Substack's servers internally
- **CSRF Protection**: Likely uses CSRF tokens and other security measures
- **CORS Restrictions**: May block cross-origin requests

### 3. Potential Integration Approaches

#### Approach A: Reverse-Engineer Subscription Endpoint
**Pros:**
- Direct integration
- No third-party dependencies

**Cons:**
- May violate Substack ToS
- Unstable (Substack can change implementation)
- Requires CSRF token handling
- CORS issues may require proxy

**Implementation:**
- Inspect Substack embedded form network requests
- Extract subscription POST endpoint
- Handle CSRF tokens
- Use proxy server to avoid CORS

#### Approach B: Unofficial npm Package
**Package**: `substack-subscriber`
- Available on npm
- Unofficial, not supported by Substack
- May violate ToS

**Usage:**
```javascript
const { subscribe } = require('substack-subscriber');
subscribe(email, substackUrl);
```

#### Approach C: Third-Party Service
**Services Available:**
- **Supascribe**: Custom embed forms that sync to Substack
- **SubstackAPI.com**: Custom embed tool
- **NA Beer Finder**: Sign-up form builder

**Pros:**
- User-friendly
- No coding required
- May handle Substack integration internally

**Cons:**
- Additional service dependency
- May have costs
- Less control

#### Approach D: Webhook/Post-Processing
**Flow:**
1. Form submits to Journity only
2. Journity stores in Cassandra
3. Zapier/webhook processes submission
4. Webhook attempts Substack subscription

**Pros:**
- Uses existing Journity infrastructure
- Journity always has the data
- Can retry Substack if it fails

**Cons:**
- Requires webhook setup
- Additional processing step

#### Approach E: Embedded Iframe + Capture
**Flow:**
1. Embed Substack's official iframe form
2. Use postMessage API or form submission listener
3. Capture email from form submission
4. Forward to Journity

**Pros:**
- Uses official Substack form
- No ToS violations
- Reliable

**Cons:**
- Requires iframe communication
- May be blocked by browser security
- Complex implementation

## Recommended Approach for POC

**Hybrid Approach:**
1. Create custom form that submits to Journity (primary)
2. Attempt to submit to Substack via proxy server
3. Handle failures gracefully (Journity always succeeds)
4. Log results for analysis

**Why This Works:**
- Journity always captures the email (primary goal)
- Substack subscription is attempted but not critical
- Can iterate on Substack integration without losing data
- Provides foundation for production implementation

## Technical Implementation Details

### Substack Subscription Endpoint
Based on research, Substack likely uses:
- **URL Pattern**: `{publication-url}/subscribe`
- **Method**: POST
- **Content-Type**: `application/x-www-form-urlencoded`
- **Required Fields**: `email`
- **CSRF**: May require token from page load

### Journity Form API
- **Endpoint**: `/v1/email-form`
- **Method**: POST
- **Content-Type**: `application/json`
- **Required Fields**: `aid`, `ctaHashId`, `did`, `abhash`, `data.email`
- **Optional Fields**: `data.first`, `data.last`, `data.name`

## Testing Strategy

1. **Test Journity Integration First**
   - Verify form-api endpoint is accessible
   - Test with valid `aid` and `ctaHashId`
   - Confirm data is stored in Cassandra

2. **Test Substack Integration**
   - Try direct POST to subscription endpoint
   - Test with proxy server to handle CORS
   - Verify subscription appears in Substack dashboard
   - Test error handling

3. **Test Combined Flow**
   - Submit form with both integrations
   - Verify both succeed
   - Test failure scenarios (one fails, both fail)

## Production Considerations

### Security
- Validate email addresses
- Rate limiting
- CSRF protection for proxy server
- Secure storage of API keys/configs

### Error Handling
- Log all submission attempts
- Retry logic for failed Substack submissions
- User feedback for partial failures
- Monitoring and alerts

### Scalability
- Handle multiple Substack publications
- Support bulk subscriptions
- Queue system for high volume

### Compliance
- GDPR/privacy considerations
- Email consent handling
- Unsubscribe functionality

## Next Steps

1. **Test POC**: Run proof of concept with real credentials
2. **Reverse Engineer**: Inspect Substack form network requests
3. **Contact Substack**: Reach out for official integration options
4. **Production Design**: Design production integration architecture
5. **Documentation**: Document final integration approach

## References

- Substack API Support: https://support.substack.com/hc/en-us/articles/360038433912-Does-Substack-have-an-API
- Substack Embed Forms: https://support.substack.com/hc/en-us/articles/360041759232-Can-I-embed-a-signup-form-for-my-Substack-publication
- Unofficial npm package: https://github.com/Tammilore/substack-subscriber
- Supascribe: https://supascribe.com/embeds/subscribe
