/**
 * Supabase Entry Point for Vercel Builds
 * 
 * This script is executed before the Next.js build process starts.
 * It applies all necessary polyfills for Supabase to work in server environments.
 */
console.log('🚀 Starting Supabase entry setup...');

try {
  // Apply universal polyfills for global variables
  require('./universal-polyfill.js');
  console.log('✅ Successfully loaded universal polyfills');
  
  // Additional polyfills for specific Supabase needs
  global.fetch = global.fetch || require('node-fetch');
  console.log('✅ Fetch polyfill applied');
  
  // Support for FormData
  if (!global.FormData) {
    global.FormData = class FormData {
      constructor() {
        this.parts = [];
      }
      append(name, value) {
        this.parts.push({ name, value });
      }
    };
    console.log('✅ FormData polyfill applied');
  }
  
  // Support for FileReader
  if (!global.FileReader) {
    global.FileReader = class FileReader {
      readAsDataURL() { 
        this.onload && setTimeout(() => this.onload({ target: { result: '' } }), 0);
      }
    };
    console.log('✅ FileReader polyfill applied');
  }
  
  // Blob polyfill
  if (!global.Blob) {
    global.Blob = class Blob {
      constructor(parts = [], options = {}) {
        this.parts = parts;
        this.size = parts.reduce((acc, part) => acc + part.length, 0);
        this.type = options.type || '';
      }
      text() {
        return Promise.resolve(this.parts.join(''));
      }
    };
    console.log('✅ Blob polyfill applied');
  }
  
  // Validate environment variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('⚠️ Setting MOCK_DB=true to use mock data instead');
    process.env.MOCK_DB = 'true';
  } else {
    console.log('✅ All required environment variables are present');
  }
  
  // Create mock data directory if it doesn't exist
  const fs = require('fs');
  const path = require('path');
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Created data directory for mock data');
    
    // Create initial data files
    const votes = {
      votes: {},
      voteCounts: {},
      userVotes: [],
      lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(dataDir, 'votes.json'),
      JSON.stringify(votes, null, 2)
    );
    
    const activities = {
      activities: [],
      lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(dataDir, 'activities.json'),
      JSON.stringify(activities, null, 2)
    );
    
    console.log('✅ Created initial data files');
  } else {
    console.log('✅ Data directory already exists');
  }
  
  console.log('🎉 Supabase entry setup completed successfully!');
} catch (error) {
  console.error('❌ Error during Supabase entry setup:', error);
  process.exit(1);
} 