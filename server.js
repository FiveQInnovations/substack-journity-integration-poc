/**
 * Optional Proxy Server for Substack Integration
 * 
 * This server acts as a proxy to handle CORS issues when submitting to Substack.
 * It receives form submissions, forwards to both Journity and Substack,
 * and returns combined results.
 * 
 * Usage:
 *   node server.js
 * 
 * Then point the form to: http://localhost:3000/subscribe
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

/**
 * Proxy endpoint that submits to both Journity and Substack
 */
app.post('/subscribe', async (req, res) => {
  const { email, firstName, lastName, journityConfig, substackUrl } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  const results = {
    journity: { status: 'pending', message: '' },
    substack: { status: 'pending', message: '' }
  };
  
  // Submit to Journity if config provided
  if (journityConfig && journityConfig.url) {
    try {
      const journityResult = await submitToJournity({
        url: journityConfig.url,
        aid: journityConfig.aid,
        ctaHashId: journityConfig.ctaHashId,
        email: email,
        firstName: firstName || '',
        lastName: lastName || ''
      });
      results.journity = journityResult;
    } catch (error) {
      results.journity = {
        status: 'error',
        message: error.message
      };
    }
  }
  
  // Submit to Substack
  if (substackUrl) {
    try {
      const substackResult = await submitToSubstack({
        url: substackUrl,
        email: email
      });
      results.substack = substackResult;
    } catch (error) {
      results.substack = {
        status: 'error',
        message: error.message
      };
    }
  }
  
  // Return combined results
  res.json(results);
});

/**
 * Submit email to Journity form-api
 */
async function submitToJournity({ url, aid, ctaHashId, email, firstName, lastName }) {
  const did = generateId();
  const abhash = generateId();
  
  const payload = {
    aid: aid,
    ctaHashId: ctaHashId,
    did: did,
    abhash: abhash,
    data: {
      email: email,
      first: firstName || '',
      last: lastName || ''
    }
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  if (response.ok) {
    const result = await response.text();
    return {
      status: 'success',
      message: result === 'success' ? 'Successfully stored in Journity' : result
    };
  } else {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
}

/**
 * Submit email to Substack
 * 
 * Note: Substack's subscription endpoint may require:
 * - CSRF tokens
 * - Specific headers
 * - Form data format
 * 
 * This is experimental and may need adjustment based on Substack's actual implementation
 */
async function submitToSubstack({ url, email }) {
  // Substack subscription endpoint
  const subscribeUrl = url.endsWith('/') 
    ? url + 'subscribe' 
    : url + '/subscribe';
  
  try {
    // First, try to get the subscription page to extract CSRF token if needed
    const pageResponse = await fetch(subscribeUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    // For now, attempt direct POST
    // In production, you'd need to parse the page for CSRF tokens
    const formData = new URLSearchParams();
    formData.append('email', email);
    
    const response = await fetch(subscribeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': url,
        'Origin': url,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: formData.toString(),
      redirect: 'follow'
    });
    
    // Check if subscription was successful
    // Substack may redirect or return different status codes
    if (response.ok || response.status === 302 || response.status === 200) {
      return {
        status: 'success',
        message: 'Subscription request sent to Substack'
      };
    } else {
      return {
        status: 'error',
        message: `Substack returned status ${response.status}`
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: `Failed to submit to Substack: ${error.message}`
    };
  }
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

app.listen(PORT, () => {
  console.log(`Substack Integration POC server running on http://localhost:${PORT}`);
  console.log(`Open index.html in your browser to test the form`);
});
