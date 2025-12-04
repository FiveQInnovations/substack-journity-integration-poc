/**
 * Cloudflare Worker to proxy Substack subscriptions
 * 
 * This worker handles CORS and forwards subscription requests to Substack
 * Deploy this separately from the Pages site
 * 
 * Usage:
 *   wrangler deploy
 */

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const { email, substackUrl } = await request.json();

      if (!email) {
        return new Response(
          JSON.stringify({ error: 'Email is required' }),
          { 
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      // Default to Humanitas Forum if not provided
      const targetUrl = substackUrl || 'https://humanitasinstitute.substack.com/subscribe';

      // Prepare form data for Substack
      const formData = new URLSearchParams();
      formData.append('email', email);

      // Forward request to Substack
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': targetUrl.replace('/subscribe', ''),
          'Origin': targetUrl.replace('/subscribe', ''),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: formData.toString(),
        redirect: 'follow',
      });

      // Check if subscription was successful
      const success = response.ok || response.status === 302 || response.status === 200;

      return new Response(
        JSON.stringify({
          status: success ? 'success' : 'error',
          message: success 
            ? 'Subscription request sent to Substack' 
            : `Substack returned status ${response.status}`,
          statusCode: response.status,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: `Failed to submit to Substack: ${error.message}`,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};
