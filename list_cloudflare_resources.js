#!/usr/bin/env node
/**
 * List Cloudflare Workers and Pages resources
 * 
 * Uses CLOUDFLARE_TOKEN_READ_ONLY from .env file
 * 
 * Usage:
 *   node list_cloudflare_resources.js
 */

require('dotenv').config();
const fetch = require('node-fetch');

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';
const TOKEN = process.env.CLOUDFLARE_TOKEN_READ_ONLY;

if (!TOKEN) {
  console.error('❌ Error: CLOUDFLARE_TOKEN_READ_ONLY not found in .env file');
  console.error('   Create a .env file with: CLOUDFLARE_TOKEN_READ_ONLY=your_token_here');
  process.exit(1);
}

async function makeRequest(endpoint) {
  // Try Bearer token first (API Token)
  let headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };

  let response = await fetch(`${CLOUDFLARE_API_BASE}${endpoint}`, { headers });

  // If Bearer token fails, try API Key format (legacy)
  if (!response.ok && response.status === 401) {
    console.log('   ⚠️  Bearer token failed, trying API Key format...');
    // API Key format requires email, but we don't have it
    // Just return the original error
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    const errorMsg = error.errors?.[0]?.message || error.message || response.statusText;
    
    if (response.status === 401) {
      throw new Error(`Authentication failed: ${errorMsg}\n   💡 Make sure your token is valid and has the correct permissions.`);
    }
    
    throw new Error(`API Error (${response.status}): ${errorMsg}`);
  }

  return response.json();
}

async function getAccountId() {
  try {
    const data = await makeRequest('/user/tokens/verify');
    return data.result?.id || null;
  } catch (error) {
    console.error('❌ Error verifying token:', error.message);
    // Try to get account from user info
    try {
      const userData = await makeRequest('/user');
      if (userData.result?.organizations && userData.result.organizations.length > 0) {
        return userData.result.organizations[0].id;
      }
    } catch (e) {
      // Fallback: try to list accounts
      const accounts = await makeRequest('/accounts');
      if (accounts.result && accounts.result.length > 0) {
        return accounts.result[0].id;
      }
    }
    throw error;
  }
}

async function listWorkers(accountId) {
  try {
    console.log('\n📦 Cloudflare Workers:');
    console.log('─'.repeat(60));
    
    const data = await makeRequest(`/accounts/${accountId}/workers/scripts`);
    
    if (!data.result || data.result.length === 0) {
      console.log('   No Workers found');
      return;
    }

    for (const worker of data.result) {
      console.log(`\n   Name: ${worker.id}`);
      console.log(`   Created: ${new Date(worker.created_on).toLocaleString()}`);
      console.log(`   Modified: ${new Date(worker.modified_on).toLocaleString()}`);
      
      // Get routes
      try {
        const routes = await makeRequest(`/accounts/${accountId}/workers/scripts/${worker.id}/routes`);
        if (routes.result && routes.result.length > 0) {
          console.log(`   Routes:`);
          routes.result.forEach(route => {
            console.log(`     - ${route.pattern}`);
          });
        }
      } catch (e) {
        // Routes might not be accessible with read-only token
      }
    }
  } catch (error) {
    console.error(`   ❌ Error listing Workers: ${error.message}`);
  }
}

async function listPages(accountId) {
  try {
    console.log('\n📄 Cloudflare Pages:');
    console.log('─'.repeat(60));
    
    const data = await makeRequest(`/accounts/${accountId}/pages/projects`);
    
    if (!data.result || data.result.length === 0) {
      console.log('   No Pages projects found');
      return;
    }

    for (const project of data.result) {
      console.log(`\n   Project: ${project.name}`);
      console.log(`   Created: ${new Date(project.created_on).toLocaleString()}`);
      console.log(`   Production URL: ${project.production_branch ? `https://${project.name}.pages.dev` : 'Not deployed'}`);
      
      // Get deployments
      try {
        const deployments = await makeRequest(`/accounts/${accountId}/pages/projects/${project.name}/deployments?per_page=1`);
        if (deployments.result && deployments.result.length > 0) {
          const latest = deployments.result[0];
          console.log(`   Latest Deployment:`);
          console.log(`     Status: ${latest.latest_stage?.status || 'unknown'}`);
          console.log(`     URL: ${latest.url || 'N/A'}`);
          console.log(`     Created: ${new Date(latest.created_on).toLocaleString()}`);
        }
      } catch (e) {
        // Deployments might not be accessible
      }
      
      // Get domains
      if (project.domains && project.domains.length > 0) {
        console.log(`   Custom Domains:`);
        project.domains.forEach(domain => {
          console.log(`     - ${domain}`);
        });
      }
    }
  } catch (error) {
    console.error(`   ❌ Error listing Pages: ${error.message}`);
  }
}

async function main() {
  console.log('🔍 Fetching Cloudflare resources...\n');
  
  try {
    // Verify token and get account info
    const verifyData = await makeRequest('/user/tokens/verify');
    console.log('✅ Token verified');
    console.log(`   Email: ${verifyData.result?.email || 'N/A'}`);
    console.log(`   Status: ${verifyData.result?.status || 'N/A'}`);
    
    // Get account ID
    const accountId = await getAccountId();
    if (!accountId) {
      console.error('❌ Could not determine account ID');
      process.exit(1);
    }
    console.log(`   Account ID: ${accountId}\n`);
    
    // List resources
    await listWorkers(accountId);
    await listPages(accountId);
    
    console.log('\n✅ Done!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('Authentication')) {
      console.error('\n💡 Make sure your token has the correct permissions:');
      console.error('   - Account:Cloudflare Workers:Read');
      console.error('   - Account:Cloudflare Pages:Read');
    }
    process.exit(1);
  }
}

main();
