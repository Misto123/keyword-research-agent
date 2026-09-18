/**
 * Cloudflare Worker Integration Example
 * 
 * This worker integrates with the Keyword Research API to automatically
 * generate content for niche sites.
 */

// Configuration
const RESEARCH_API_URL = 'https://keyword-research-agent-eight.vercel.app';
const API_KEY = 'your-api-key-here'; // Set in Worker environment variables

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Route: Start research for a niche
    if (url.pathname === '/generate-site' && request.method === 'POST') {
      return handleGenerateSite(request, env);
    }
    
    // Route: Webhook receiver for completed research
    if (url.pathname === '/webhook' && request.method === 'POST') {
      return handleWebhook(request, env);
    }
    
    return new Response('Keyword Research CF Worker', { status: 200 });
  }
};

/**
 * Start keyword research for a niche
 */
async function handleGenerateSite(request, env) {
  try {
    const { niche, domain } = await request.json();
    
    if (!niche) {
      return jsonResponse({ error: 'Niche is required' }, 400);
    }
    
    // Start research job with webhook
    const webhookUrl = `${new URL(request.url).origin}/webhook`;
    
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
        depth: 'quick',
        publishDomain: domain,
        webhookUrl: webhookUrl
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return jsonResponse({ error: result.error }, response.status);
    }
    
    // Store job ID in KV for tracking
    await env.RESEARCH_JOBS.put(result.jobId, JSON.stringify({
      niche,
      domain,
      status: 'pending',
      startedAt: new Date().toISOString()
    }));
    
    return jsonResponse({
      success: true,
      jobId: result.jobId,
      message: `Research started for "${niche}". You'll be notified when complete.`
    });
    
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

/**
 * Handle webhook notification from Research API
 */
async function handleWebhook(request, env) {
  try {
    const payload = await request.json();
    const { jobId, status, niche, result, error } = payload;
    
    console.log(`📥 Webhook received: ${jobId} - ${status}`);
    
    if (status === 'completed') {
      // Research completed successfully
      const articles = result?.articles || [];
      
      console.log(`✅ Research completed for "${niche}": ${articles.length} articles`);
      
      // Generate site pages from articles
      await generateSitePages(niche, articles, env);
      
      // Update job status
      await env.RESEARCH_JOBS.put(jobId, JSON.stringify({
        niche,
        status: 'completed',
        articleCount: articles.length,
        completedAt: new Date().toISOString()
      }));
      
      return jsonResponse({ success: true, message: 'Site generated' });
      
    } else if (status === 'failed') {
      // Research failed
      console.error(`❌ Research failed for "${niche}": ${error}`);
      
      await env.RESEARCH_JOBS.put(jobId, JSON.stringify({
        niche,
        status: 'failed',
        error: error,
        completedAt: new Date().toISOString()
      }));
      
      return jsonResponse({ success: false, error: error });
    }
    
    return jsonResponse({ success: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}

/**
 * Generate site pages from articles
 */
async function generateSitePages(niche, articles, env) {
  console.log(`🏗️ Generating site for "${niche}" with ${articles.length} articles`);
  
  // Your site generation logic here
  // Examples:
  // 1. Store articles in KV/R2
  // 2. Trigger your static site generator
  // 3. Create pages in your CMS
  // 4. Deploy to your hosting
  
  for (const article of articles) {
    const slug = slugify(article.title);
    
    // Store article in KV
    await env.ARTICLES.put(`${niche}/${slug}`, JSON.stringify(article));
    
    console.log(`  📄 Saved: ${article.title}`);
  }
  
  // Create site index
  await env.ARTICLES.put(`${niche}/index`, JSON.stringify({
    niche,
    articleCount: articles.length,
    articles: articles.map(a => ({
      title: a.title,
      slug: slugify(a.title),
      wordCount: a.wordCount
    })),
    createdAt: new Date().toISOString()
  }));
  
  console.log(`✅ Site generated for "${niche}"`);
}

/**
 * Helper: Create JSON response
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Helper: Create URL-friendly slug
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
