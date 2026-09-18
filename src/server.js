import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { ResearchEngine } from './research-engine.js';
import { ContentWorkflow } from './content-workflow.js';
import { SettingsManager } from './services/settings.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// In-memory job storage (use DB in production)
const jobs = new Map();
const settingsManager = new SettingsManager();

// API Key Authentication Middleware
const API_KEY = process.env.API_KEY || 'dev-key-change-in-production';

function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  // Allow requests without API key in development
  if (process.env.NODE_ENV !== 'production' && !apiKey) {
    return next();
  }
  
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized. Valid API key required.' });
  }
  
  next();
}

// Apply authentication to API routes (except health check)
app.use('/api/research', authenticateApiKey);
app.use('/api/jobs', authenticateApiKey);
app.use('/api/settings', authenticateApiKey);

/**
 * GET /api/settings - Get current settings (masked)
 */
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await settingsManager.getSettings();
    
    // Mask sensitive values
    const masked = JSON.parse(JSON.stringify(settings));
    if (masked.dataforseo?.password) masked.dataforseo.password = '••••••••';
    if (masked.serper?.apiKey) masked.serper.apiKey = masked.serper.apiKey.substring(0, 8) + '••••••••';
    if (masked.llmsrelay?.apiKey) masked.llmsrelay.apiKey = masked.llmsrelay.apiKey.substring(0, 8) + '••••••••';
    if (masked.openai?.apiKey) masked.openai.apiKey = masked.openai.apiKey.substring(0, 8) + '••••••••';
    if (masked.deepseek?.apiKey) masked.deepseek.apiKey = masked.deepseek.apiKey.substring(0, 8) + '••••••••';
    if (masked.wordpress?.token) masked.wordpress.token = '••••••••';
    if (masked.customApi?.key) masked.customApi.key = '••••••••';
    
    res.json(masked);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/settings - Update settings
 */
app.put('/api/settings', async (req, res) => {
  try {
    await settingsManager.saveSettings(req.body);
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/settings/test - Test API connection
 */
app.post('/api/settings/test', async (req, res) => {
  try {
    const { provider, credentials } = req.body;
    
    // Test the API connection based on provider
    let result = { success: false, message: '' };
    
    switch (provider) {
      case 'dataforseo':
        // Test DataForSEO connection
        const auth = Buffer.from(`${credentials.login}:${credentials.password}`).toString('base64');
        const dfRes = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([{ keyword: 'test', location_code: 2840 }])
        });
        result.success = dfRes.ok;
        result.message = dfRes.ok ? 'Connected successfully' : 'Invalid credentials';
        break;
        
      case 'serper':
        const serperRes = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': credentials.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ q: 'test' })
        });
        result.success = serperRes.ok;
        result.message = serperRes.ok ? 'Connected successfully' : 'Invalid API key';
        break;
        
      case 'llmsrelay':
        const llmsRes = await fetch(`${credentials.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${credentials.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 5
          })
        });
        result.success = llmsRes.ok;
        result.message = llmsRes.ok ? 'Connected successfully' : 'Invalid API key';
        break;
        
      default:
        result.message = 'Unknown provider';
    }
    
    res.json(result);
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

/**
 * POST /api/research - Start new research job
 */
app.post('/api/research', async (req, res) => {
  try {
    const { niche, country, language, depth, autoPublish } = req.body;
    
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    jobs.set(jobId, {
      id: jobId,
      config: { niche, country, language, depth, autoPublish },
      status: 'queued',
      progress: 0,
      stage: 'Initializing...',
      createdAt: new Date().toISOString(),
      result: null
    });

    // Run async
    runResearch(jobId, { niche, country, language, depth, autoPublish });
    
    res.json({ jobId, status: 'queued' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jobs/:id - Get job status
 */
app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

/**
 * GET /api/jobs - List all jobs
 */
app.get('/api/jobs', (req, res) => {
  const allJobs = Array.from(jobs.values()).sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(allJobs);
});

/**
 * GET /api/jobs/:id/result - Get full research result
 */
app.get('/api/jobs/:id/result', async (req, res) => {
  try {
    const job = jobs.get(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    if (job.status !== 'completed') {
      return res.status(400).json({ error: 'Job not completed yet' });
    }
    
    const resultPath = path.join(config.app.jobsDir, job.id, 'research.json');
    const data = await fs.readFile(resultPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jobs/:id/articles - Get articles list
 */
app.get('/api/jobs/:id/articles', async (req, res) => {
  try {
    const job = jobs.get(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    const articlesPath = path.join(config.app.jobsDir, job.id, 'articles', 'index.json');
    const data = await fs.readFile(articlesPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jobs/:id/articles/:slug - Get specific article
 */
app.get('/api/jobs/:id/articles/:slug', async (req, res) => {
  try {
    const job = jobs.get(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    const articlePath = path.join(config.app.jobsDir, job.id, 'articles', `${req.params.slug}.json`);
    const data = await fs.readFile(articlePath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/jobs/:id - Delete job
 */
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const job = jobs.get(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    jobs.delete(req.params.id);
    
    // Delete files
    const jobDir = path.join(config.app.jobsDir, req.params.id);
    await fs.rm(jobDir, { recursive: true, force: true });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Run research job asynchronously
 */
async function runResearch(jobId, researchConfig) {
  const job = jobs.get(jobId);
  
  try {
    job.status = 'running';
    job.startedAt = new Date().toISOString();
    
    // Load and apply settings
    const settings = await settingsManager.getSettings();
    settingsManager.applyToConfig(config, settings);
    
    const workflow = new ContentWorkflow();
    
    // Override save paths to use job-specific directory
    const jobDir = path.join(config.app.jobsDir, jobId);
    await fs.mkdir(jobDir, { recursive: true });
    
    // Run research with progress updates
    const result = await workflow.run(researchConfig, {
      onProgress: (stage, progress) => {
        job.stage = stage;
        job.progress = progress;
      },
      outputDir: jobDir
    });
    
    job.status = 'completed';
    job.progress = 100;
    job.stage = 'Done';
    job.completedAt = new Date().toISOString();
    job.result = {
      keywordCount: result.research.keywords.length,
      articleCount: result.articles.length,
      topicCount: result.research.topics.length
    };
  } catch (error) {
    job.status = 'failed';
    job.error = error.message;
    job.errorStack = error.stack;
    job.errorDetails = {
      message: error.message,
      name: error.name,
      timestamp: new Date().toISOString()
    };
    job.completedAt = new Date().toISOString();
    console.error('❌ Research job failed:', {
      jobId,
      error: error.message,
      stack: error.stack,
      config: researchConfig
    });
  }
}
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

const PORT = config.app.port;

// Only start server if not in Vercel (serverless) environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 API server running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
  });
}

export default app;
