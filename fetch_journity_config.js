/**
 * Fetch Journity configuration from MongoDB
 * 
 * Usage:
 *   MONGO_URI=mongodb://localhost:27017/ node fetch_journity_config.js
 */

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/meteor';
const AID = 'humanitasinstitute.org';
const WAYPOINT_NAME = 'Grow Email List';
const FORM_API_BASE_URL = process.env.FORM_API_URL || 'https://f.journity.com';

async function fetchJournityConfig() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('meteor');
    
    // Find the waypoint
    console.log(`\n🔍 Searching for waypoint:`);
    console.log(`   AID: ${AID}`);
    console.log(`   Name: ${WAYPOINT_NAME}`);
    
    const waypoint = await db.collection('ctas').findOne({
      aid: AID,
      name: WAYPOINT_NAME,
      deleted: { $ne: true }
    });
    
    if (!waypoint) {
      console.log(`\n❌ Waypoint not found. Trying partial match...`);
      
      const partialMatch = await db.collection('ctas').findOne({
        aid: AID,
        name: { $regex: WAYPOINT_NAME, $options: 'i' },
        deleted: { $ne: true }
      });
      
      if (partialMatch) {
        console.log(`\n✅ Found waypoint with partial match: "${partialMatch.name}"`);
        displayConfig(partialMatch, db);
      } else {
        console.log(`\n📋 Available waypoints for ${AID}:`);
        const allWaypoints = await db.collection('ctas').find({
          aid: AID,
          deleted: { $ne: true },
          form: true,
          form_type: 'email'
        }).toArray();
        
        if (allWaypoints.length === 0) {
          console.log('   No email form waypoints found');
        } else {
          allWaypoints.forEach(wp => {
            console.log(`   - ${wp.name} (ID: ${wp._id})`);
          });
        }
      }
    } else {
      displayConfig(waypoint, db);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Make sure MongoDB is accessible.');
      console.error('   If using port-forward: kubectl port-forward -n journity-prod service/mongo 27017:27017');
    }
  } finally {
    await client.close();
  }
}

async function displayConfig(waypoint, db) {
  const ctaHashId = waypoint._id.toHexString();
  
  console.log(`\n✅ Found waypoint:`);
  console.log(`   Name: ${waypoint.name}`);
  console.log(`   AID: ${waypoint.aid}`);
  console.log(`   CTA Hash ID: ${ctaHashId}`);
  console.log(`   Form Type: ${waypoint.form_type || 'N/A'}`);
  console.log(`   Active: ${waypoint.active ? 'Yes' : 'No'}`);
  
  let formConfig = null;
  try {
    // Check for form config
    formConfig = await db.collection('formConfigs').findOne({
      aid: AID,
      ctaHashId: ctaHashId
    });
    
    if (formConfig) {
      console.log(`\n✅ Form config found:`);
      console.log(`   Form Type: ${formConfig.form_type || 'N/A'}`);
      console.log(`   Integration: ${formConfig.integration || 'None'}`);
    } else {
      console.log(`\n⚠️  No form config found for this waypoint`);
      console.log(`   You may need to create a form config in the Journity dashboard`);
    }
  } catch (error) {
    console.log(`\n⚠️  Error checking form config: ${error.message}`);
  }
  
  // Generate configuration object
  const config = {
    journityUrl: `${FORM_API_BASE_URL}/v1/email-form`,
    aid: AID,
    ctaHashId: ctaHashId,
    waypointName: waypoint.name,
    formConfigExists: !!formConfig,
    integration: formConfig?.integration || null
  };
  
  console.log(`\n📋 Configuration for POC:`);
  console.log(JSON.stringify(config, null, 2));
  
  // Also write to a file for easy import
  const fs = require('fs');
  fs.writeFileSync(
    'journity_config.json',
    JSON.stringify(config, null, 2)
  );
  console.log(`\n💾 Configuration saved to journity_config.json`);
  
  return config;
}

fetchJournityConfig().catch(console.error);
