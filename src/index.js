#!/usr/bin/env node

import { ContentWorkflow } from './content-workflow.js';
import { readFile } from 'fs/promises';

const args = process.argv.slice(2);

async function main() {
  console.log('🔬 Keyword Research & Content Generator\n');

  // Parse command line arguments
  let config;

  if (args[0] === '--config' && args[1]) {
    // Load from config file
    const configData = await readFile(args[1], 'utf-8');
    config = JSON.parse(configData);
  } else if (args[0]) {
    // Quick mode: node index.js "natural soap" US en exhaustive
    config = {
      niche: args[0],
      country: args[1] || 'US',
      language: args[2] || 'en',
      depth: args[3] || 'standard',
      autoPublish: args[4] === 'publish'
    };
  } else {
    // Show usage
    console.log('Usage:');
    console.log('  node src/index.js "your niche" [country] [language] [depth] [publish]');
    console.log('  node src/index.js --config config.json');
    console.log('\nExamples:');
    console.log('  node src/index.js "natural handmade soap" US en exhaustive');
    console.log('  node src/index.js "keto diet" GB en standard publish');
    console.log('  node src/index.js --config my-research.json');
    console.log('\nDepth options: quick, standard, exhaustive');
    console.log('Add "publish" at the end to auto-publish to production');
    process.exit(0);
  }

  console.log('Configuration:');
  console.log(`  Niche: ${config.niche}`);
  console.log(`  Country: ${config.country}`);
  console.log(`  Language: ${config.language}`);
  console.log(`  Depth: ${config.depth}`);
  console.log(`  Auto-publish: ${config.autoPublish ? 'Yes' : 'No'}`);
  console.log();

  // Run the workflow
  const workflow = new ContentWorkflow();
  
  try {
    const result = await workflow.run(config);
    
    console.log('\n🎉 All done!');
    console.log(`\nResults:`);
    console.log(`  Keywords found: ${result.research.keywords.length}`);
    console.log(`  Topics mapped: ${result.research.topics.length}`);
    console.log(`  Articles created: ${result.articles.length}`);
    
    if (result.publishResults) {
      console.log(`  Published successfully: ${result.publishResults.filter(r => r.success).length}`);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
