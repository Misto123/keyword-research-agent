/**
 * Batch Research Example
 * 
 * Process multiple niches in parallel using the Keyword Research API
 */

const RESEARCH_API_URL = 'https://keyword-research-agent-eight.vercel.app';
const API_KEY = 'your-api-key-here';

/**
 * Start research for multiple niches at once
 */
async function batchResearch(niches) {
  console.log(`🚀 Starting research for ${niches.length} niches...`);
  
  // Start all jobs in parallel
  const jobs = await Promise.all(
    niches.map(niche => startResearch(niche))
  );
  
  console.log(`✅ Started ${jobs.length} research jobs`);
  
  // Wait for all to complete
  const results = await Promise.all(
    jobs.map(job => waitForCompletion(job.jobId))
  );
  
  console.log(`✅ All research completed!`);
  
  return results;
}

/**
 * Start a single research job
 */
async function startResearch(niche) {
  const response = await fetch(`${RESEARCH_API_URL}/api/research`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({
      niche: niche,
      country: 'us',
      language: 'en',
      depth: 'quick'
    })
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(`Failed to start research for "${niche}": ${result.error}`);
  }
  
  console.log(`  📊 Started: ${niche} (${result.jobId})`);
  
  return result;
}

/**
 * Wait for a job to complete
 */
async function waitForCompletion(jobId, maxWaitMinutes = 10) {
  const startTime = Date.now();
  const maxWaitMs = maxWaitMinutes * 60 * 1000;
  
  while (true) {
    // Check if timeout
    if (Date.now() - startTime > maxWaitMs) {
      throw new Error(`Job ${jobId} timed out after ${maxWaitMinutes} minutes`);
    }
    
    // Check job status
    const response = await fetch(`${RESEARCH_API_URL}/api/jobs/${jobId}`, {
      headers: { 'X-API-Key': API_KEY }
    });
    
    const job = await response.json();
    
    if (job.status === 'completed') {
      console.log(`  ✅ Completed: ${job.niche}`);
      
      // Get articles
      const articlesRes = await fetch(`${RESEARCH_API_URL}/api/jobs/${jobId}/articles`, {
        headers: { 'X-API-Key': API_KEY }
      });
      
      const articles = await articlesRes.json();
      
      return {
        jobId,
        niche: job.niche,
        articles: articles.articles || [],
        keywords: job.result?.keywords || []
      };
    }
    
    if (job.status === 'failed') {
      throw new Error(`Job ${jobId} failed: ${job.error}`);
    }
    
    // Wait 5 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

/**
 * Example usage
 */
async function main() {
  const niches = [
    'funding pips discount code',
    'forex trading signals',
    'crypto mining software',
    'dropshipping suppliers usa',
    'print on demand products'
  ];
  
  try {
    const results = await batchResearch(niches);
    
    console.log('\n📊 RESULTS SUMMARY:');
    for (const result of results) {
      console.log(`  ${result.niche}:`);
      console.log(`    - ${result.articles.length} articles`);
      console.log(`    - ${result.keywords.length} keywords`);
    }
    
    // Save results
    const fs = require('fs');
    fs.writeFileSync('batch-results.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Results saved to batch-results.json');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { batchResearch, startResearch, waitForCompletion };
