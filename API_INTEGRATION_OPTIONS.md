# API Integration Options for Niche Site Generation

## Your Use Case

You want to quickly generate keywords for multiple niche sites to feed into your current site builder system.

---

## 🎯 RECOMMENDED: REST API (Standalone Service)

### Why This is Best for You:

1. **Already Built** ✅
   - System is working
   - Deployed on Vercel
   - Just expose the endpoints

2. **Multiple Niches** ✅
   - Call API for each niche idea
   - Parallel processing
   - Batch operations

3. **Reusable** ✅
   - Use from any system
   - CF Workers can call it
   - Other projects can use it
   - Future integrations easy

4. **Independent Scaling** ✅
   - Doesn't affect your main site
   - Can handle heavy loads
   - Separate rate limits

---

## 📡 REST API Endpoints (Already Available)

### 1. Start Research Job
```http
POST /api/research
Content-Type: application/json

{
  "niche": "funding pips discount code",
  "country": "us",
  "language": "en",
  "depth": "quick",
  "publishDomain": "https://yourdomain.com"
}

Response:
{
  "jobId": "abc123",
  "status": "pending"
}
```

### 2. Check Job Status
```http
GET /api/jobs/abc123

Response:
{
  "id": "abc123",
  "status": "completed",
  "progress": 100,
  "niche": "funding pips discount code",
  "startedAt": "2024-12-18T10:00:00Z",
  "completedAt": "2024-12-18T10:05:00Z"
}
```

### 3. Get Keywords & Results
```http
GET /api/jobs/abc123/result

Response:
{
  "niche": "funding pips discount code",
  "keywords": [
    {
      "keyword": "funding pips promo code",
      "volume": 1200,
      "difficulty": 35,
      "intent": "transactional"
    },
    // ... more keywords
  ],
  "topicalMap": { ... },
  "serp": { ... }
}
```

### 4. Get Generated Articles
```http
GET /api/jobs/abc123/articles

Response:
{
  "articles": [
    {
      "title": "Funding Pips Discount Code 2024",
      "content": "...",
      "keywords": [...],
      "wordCount": 1850
    },
    // ... more articles
  ]
}
```

---

## 🔧 Integration with Your Cloudflare Workers

### Option A: Call REST API from CF Worker

```javascript
// In your CF Worker
async function generateNicheSite(niche) {
  // 1. Start research
  const jobRes = await fetch('https://keyword-research-agent-eight.vercel.app/api/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      niche: niche,
      country: 'us',
      depth: 'quick'
    })
  });
  
  const { jobId } = await jobRes.json();
  
  // 2. Poll for completion (or use webhook)
  let status = 'pending';
  while (status !== 'completed') {
    await new Promise(r => setTimeout(r, 5000));
    const statusRes = await fetch(`https://keyword-research-agent-eight.vercel.app/api/jobs/${jobId}`);
    const job = await statusRes.json();
    status = job.status;
  }
  
  // 3. Get articles
  const articlesRes = await fetch(`https://keyword-research-agent-eight.vercel.app/api/jobs/${jobId}/articles`);
  const { articles } = await articlesRes.json();
  
  // 4. Generate site with articles
  return articles;
}
```

### Option B: Webhook Notification (Better!)

```javascript
// 1. Start research with webhook
const jobRes = await fetch('https://keyword-research-agent-eight.vercel.app/api/research', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    niche: niche,
    country: 'us',
    depth: 'quick',
    webhookUrl: 'https://your-worker.workers.dev/webhook'  // <-- Add this
  })
});

// 2. Your CF Worker webhook receives results when done
export default {
  async fetch(request) {
    if (request.url.includes('/webhook')) {
      const { jobId, status, articles } = await request.json();
      
      if (status === 'completed') {
        // Generate site with articles
        await generateSitePages(articles);
      }
    }
  }
}
```

---

## 🚀 Batch Processing Multiple Niches

```javascript
// Generate multiple niche sites in parallel
const niches = [
  'funding pips discount code',
  'forex trading signals',
  'crypto mining software',
  'dropshipping suppliers'
];

const jobs = await Promise.all(
  niches.map(niche => 
    fetch('https://keyword-research-agent-eight.vercel.app/api/research', {
      method: 'POST',
      body: JSON.stringify({ niche, depth: 'quick' })
    }).then(r => r.json())
  )
);

console.log('Started', jobs.length, 'research jobs');
// Jobs run in parallel, webhook notifies when each completes
```

---

## 🔐 Authentication (Add This)

For production, add API key authentication:

```javascript
// Add to your requests
headers: {
  'Authorization': 'Bearer your-api-key',
  'Content-Type': 'application/json'
}
```

I can add this to the API if needed!

---

## 💰 Cost Comparison

### REST API (Recommended)
- **Cost:** $1-2 per niche (Quick mode)
- **Speed:** 5 minutes per niche
- **Parallel:** Unlimited
- **Infrastructure:** Vercel (free tier)

### Embedded in CF Workers
- **Cost:** Same APIs ($1-2)
- **Speed:** Same (5 min)
- **Parallel:** Limited by CF Worker CPU
- **Infrastructure:** CF Worker limits

---

## 🎯 My Recommendation for You

### Use REST API with Webhook Pattern

**Why:**
1. **Flexibility** - Can be used anywhere
2. **Scalability** - Process many niches in parallel
3. **Separation** - Site builder stays fast
4. **Reusability** - Use for other projects
5. **Webhooks** - No polling needed

**Implementation:**
1. Keep keyword research as separate API
2. Your CF Worker calls API to start jobs
3. API sends webhook when done
4. CF Worker generates site pages
5. Done!

**Example Flow:**
```
Your Idea → CF Worker → Research API → Webhook → CF Worker → Site Generated
            (trigger)   (background)              (receive)   (build pages)
```

---

## 🔧 Next Steps

1. **Add webhook support** to research API ✅
2. **Add API key authentication** 🔐
3. **Create CF Worker integration example** 📝
4. **Test with your niche ideas** 🧪

Want me to implement any of these?
