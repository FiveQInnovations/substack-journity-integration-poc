#!/usr/bin/env node
/**
 * Verify Cloudflare API Token
 * 
 * Usage:
 *   node verify_token.js
 */

require('dotenv').config();
const fetch = require('node-fetch');

const TOKEN = process.env.CLOUDFLARE_TOKEN_READ_ONLY;

if (!TOKEN) {
  console.error('❌ CLOUDFLARE_TOKEN_READ_ONLY not found in .env file');
  process.exit(1);
}

console.log('🔍 Verifying Cloudflare API Token...\n');
console.log(`Token length: ${TOKEN.length} characters`);
console.log(`Token format: ${TOKEN.substring(0, 10)}...${TOKEN.substring(TOKEN.length - 5)}\n`);

async function verifyToken() {
  try {
    const response = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ Token is valid!\n');
      console.log('Token Details:');
      console.log(`  Status: ${data.result.status}`);
      console.log(`  ID: ${data.result.id}`);
      console.log(`  Issued: ${new Date(data.result.issued_on).toLocaleString()}`);
      console.log(`  Expires: ${data.result.expires_on ? new Date(data.result.expires_on).toLocaleString() : 'Never'}`);
      
      if (data.result.policies && data.result.policies.length > 0) {
        console.log('\nPermissions:');
        data.result.policies.forEach((policy, i) => {
          console.log(`  ${i + 1}. ${policy.effect} ${policy.resources.map(r => Object.keys(r)[0]).join(', ')}`);
          if (policy.permission_groups) {
            policy.permission_groups.forEach(pg => {
              console.log(`     - ${pg.name} (${pg.id})`);
            });
          }
        });
      }
      
      return true;
    } else {
      console.error('❌ Token verification failed\n');
      if (data.errors && data.errors.length > 0) {
        console.error('Errors:');
        data.errors.forEach(err => {
          console.error(`  - ${err.message} (code: ${err.code})`);
        });
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Error verifying token:', error.message);
    return false;
  }
}

verifyToken().then(valid => {
  if (!valid) {
    console.log('\n💡 To create a new token:');
    console.log('   1. Go to https://dash.cloudflare.com/profile/api-tokens');
    console.log('   2. Click "Create Token"');
    console.log('   3. Use "Edit Cloudflare Workers" template OR create custom with:');
    console.log('      - Account → Cloudflare Workers → Read');
    console.log('      - Account → Cloudflare Pages → Read');
    console.log('      - User → User Details → Read');
    console.log('   4. Copy token and add to .env file:');
    console.log('      CLOUDFLARE_TOKEN_READ_ONLY=your_token_here\n');
    process.exit(1);
  }
});
