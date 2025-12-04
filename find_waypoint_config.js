/**
 * Helper script to find waypoint configuration details
 * 
 * Usage:
 *   node find_waypoint_config.js --aid humanitasinstitute.org --name "Grow Email List"
 * 
 * Or set environment variables:
 *   MONGO_URI=mongodb://... node find_waypoint_config.js --aid humanitasinstitute.org --name "Grow Email List"
 */

const { MongoClient } = require('mongodb');

// Default MongoDB URI - update if needed
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/journity';

async function findWaypointConfig(aid, waypointName) {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const ctasCollection = db.collection('ctas');
    
    // Search for waypoint by aid and name
    const waypoint = await ctasCollection.findOne({
      aid: aid,
      name: waypointName,
      deleted: { $ne: true }
    });
    
    if (!waypoint) {
      console.log(`\n❌ Waypoint not found:`);
      console.log(`   AID: ${aid}`);
      console.log(`   Name: ${waypointName}`);
      console.log(`\n💡 Try searching with partial name match...`);
      
      // Try partial match
      const partialMatch = await ctasCollection.findOne({
        aid: aid,
        name: { $regex: waypointName, $options: 'i' },
        deleted: { $ne: true }
      });
      
      if (partialMatch) {
        console.log(`\n✅ Found waypoint with partial match:`);
        console.log(`   Name: ${partialMatch.name}`);
        displayWaypointInfo(partialMatch);
        return;
      }
      
      // List all waypoints for this aid
      console.log(`\n📋 Available waypoints for ${aid}:`);
      const allWaypoints = await ctasCollection.find({
        aid: aid,
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
      
      return;
    }
    
    console.log(`\n✅ Found waypoint:`);
    displayWaypointInfo(waypoint);
    
    // Check for form config
    const formConfigsCollection = db.collection('formConfigs');
    const formConfig = await formConfigsCollection.findOne({
      aid: aid,
      ctaHashId: waypoint._id.toHexString()
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
    console.error('Error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Make sure MongoDB is running and MONGO_URI is correct');
    }
  } finally {
    await client.close();
  }
}

function displayWaypointInfo(waypoint) {
  console.log(`\n📋 Waypoint Details:`);
  console.log(`   Name: ${waypoint.name}`);
  console.log(`   AID: ${waypoint.aid}`);
  console.log(`   CTA Hash ID: ${waypoint._id.toHexString()}`);
  console.log(`   Form Type: ${waypoint.form_type || 'N/A'}`);
  console.log(`   Active: ${waypoint.active ? 'Yes' : 'No'}`);
  console.log(`   Published: ${waypoint.deleted ? 'No' : 'Yes'}`);
  
  console.log(`\n🔧 Configuration for POC:`);
  console.log(`   aid: "${waypoint.aid}"`);
  console.log(`   ctaHashId: "${waypoint._id.toHexString()}"`);
}

// Parse command line arguments
const args = process.argv.slice(2);
let aid = null;
let name = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--aid' && args[i + 1]) {
    aid = args[i + 1];
    i++;
  } else if (args[i] === '--name' && args[i + 1]) {
    name = args[i + 1];
    i++;
  } else if (args[i] === '--help') {
    console.log(`
Usage:
  node find_waypoint_config.js --aid <aid> --name "<waypoint name>"

Options:
  --aid <aid>              Journity organization ID (e.g., humanitasinstitute.org)
  --name "<name>"          Waypoint name (exact or partial match)
  --help                   Show this help message

Environment Variables:
  MONGO_URI                MongoDB connection URI (default: mongodb://localhost:27017/journity)

Example:
  node find_waypoint_config.js --aid humanitasinstitute.org --name "Grow Email List"
    `);
    process.exit(0);
  }
}

if (!aid || !name) {
  console.error('❌ Missing required arguments');
  console.error('Usage: node find_waypoint_config.js --aid <aid> --name "<waypoint name>"');
  console.error('Use --help for more information');
  process.exit(1);
}

findWaypointConfig(aid, name).catch(console.error);
