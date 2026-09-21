# 🔬 Keyword Research Agent

**AI-Powered Keyword Research & Content Generation System**

Automatically finds high-value keywords and generates SEO-optimized articles using your Content Creator API.

---

## 🔗 Important Links

### Live Application
- **Dashboard:** https://keyword-research-agent-eight.vercel.app
- **GitHub Repository:** https://github.com/Misto123/keyword-research-agent

### APIs & Services
- **Content Creator API:** https://content-creator-reb.vercel.app
- **Content Creator Dashboard:** https://content-creator-reb.vercel.app/api-settings
- **Vercel Project:** https://vercel.com/bram-1592s-projects/keyword-research-agent

---

## 🔐 API Credentials

### Keyword Research Agent API
```
API Endpoint: https://keyword-research-agent-eight.vercel.app/api/research
API Key: rebel-api-key-2024-secure-kw-research-d8f7a3b9e2c1
```

### Content Creator API
```
API Endpoint: https://kalswipohwljtousvacy.supabase.co/functions/v1/public-api
API Key: hfc_Q2eeLra9LWtpQBXmTVFliUbukobVZuYj
```

### Research APIs
```
Serper.dev API Key: e09ed258e1c8db784354868198bd915e1fb7181d

DataForSEO:
  Email: contact@rebelinternet.nl
  Password: FKvFltj4q8Ihcwg2
```

---

## 🚀 Quick Start

### Make Your First API Call

```bash
curl -X POST https://keyword-research-agent-eight.vercel.app/api/research \
  -H "Content-Type: application/json" \
  -H "X-API-Key: rebel-api-key-2024-secure-kw-research-d8f7a3b9e2c1" \
  -d '{
    "niche": "funding pips discount code",
    "country": "us",
    "depth": "quick"
  }'
```

**Response:**
```json
{
  "jobId": "1734539123456",
  "status": "pending",
  "message": "Research job started"
}
```

### Check Status (~5 minutes)

```bash
curl https://keyword-research-agent-eight.vercel.app/api/jobs/1734539123456 \
  -H "X-API-Key: rebel-api-key-2024-secure-kw-research-d8f7a3b9e2c1"
```

### Get Articles

```bash
curl https://keyword-research-agent-eight.vercel.app/api/jobs/1734539123456/articles \
  -H "X-API-Key: rebel-api-key-2024-secure-kw-research-d8f7a3b9e2c1"
```

---

## 💡 How It Works

```
1. Keyword Research (Serper/DataForSEO)
   ↓
2. Find high-value keywords
   ↓
3. Call YOUR Content Creator API for each keyword
   ↓
4. Generate SEO-optimized articles (DeepSeek + humanizer)
   ↓
5. Return structured JSON with articles
```

---

## 📊 Features

✅ **Keyword Research**
- Search volume analysis
- Keyword difficulty scoring
- Search intent detection
- LSI keyword extraction

✅ **Content Generation**
- Uses YOUR Content Creator API
- SEO-optimized articles
- Schema.org markup
- No AI slop (humanized)
- 600+ words per article

✅ **API-First Design**
- RESTful API
- Webhook support
- API key authentication
- Batch processing

---

## 💰 Pricing

**Quick Mode (~5 min):**
- Keyword research: ~$0.50
- 10 articles: ~$0.20
- **Total: ~$0.70 per research job**

**Standard Mode (~15 min):**
- ~$3-5 per job

**Exhaustive Mode (~45 min):**
- ~$10-20 per job

---

## 🎯 Use Cases

1. **Niche Site Generation**
   - Find keywords for a niche
   - Generate articles automatically
   - Feed to your site builder

2. **Content Planning**
   - Research topical maps
   - Identify content gaps
   - Plan content calendar

3. **SEO Research**
   - Analyze competitors
   - Find opportunities
   - Track search trends

---

## 📁 Project Structure

```
keyword-research-agent/
├── src/
│   ├── server.js              # API server
│   ├── content-workflow.js    # Content generation (calls YOUR API)
│   ├── research-engine.js     # Keyword research
│   └── services/
│       ├── settings.js        # Settings management
│       └── llm.js             # LLM service
├── public/
│   ├── index.html             # Dashboard UI
│   └── app.js                 # Frontend JS
├── examples/
│   ├── cloudflare-worker.js   # CF Worker integration
│   └── batch-research.js      # Batch processing
├── API_DOCUMENTATION.md       # Complete API docs
├── CONTENT_CREATOR_INTEGRATION.md  # Integration guide
└── QUICK_START_API.md         # Quick start guide
```

---

## 🔧 Environment Variables

Required environment variables (set in Vercel):

```env
API_KEY=rebel-api-key-2024-secure-kw-research-d8f7a3b9e2c1
CONTENT_CREATOR_API_KEY=hfc_Q2eeLra9LWtpQBXmTVFliUbukobVZuYj
```

---

## 📖 Documentation

- **API Documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Content Creator Integration:** [CONTENT_CREATOR_INTEGRATION.md](./CONTENT_CREATOR_INTEGRATION.md)
- **Quick Start Guide:** [QUICK_START_API.md](./QUICK_START_API.md)
- **API Key Reference:** [API_KEY.md](./API_KEY.md)

---

## 🛠️ Development

### Local Setup

```bash
# Clone repository
git clone https://github.com/Misto123/keyword-research-agent.git
cd keyword-research-agent

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Run locally
npm start
```

### Deploy to Vercel

```bash
vercel deploy --prod
```

---

## 🎨 Dashboard Features

- ✅ Light/bright theme
- ✅ Sticky footer for notifications
- ✅ Password visibility toggles
- ✅ Real-time progress tracking
- ✅ Job history
- ✅ Settings management
- ✅ API status indicators

---

## 🔗 Integration Examples

### Cloudflare Workers
See: [examples/cloudflare-worker.js](./examples/cloudflare-worker.js)

### Batch Processing
See: [examples/batch-research.js](./examples/batch-research.js)

---

## 📊 Output Format

Each research job produces:

```json
{
  "keywords": [
    {
      "keyword": "funding pips discount code",
      "volume": 1200,
      "difficulty": 35,
      "intent": "transactional"
    }
  ],
  "articles": [
    {
      "title": "Funding Pips Discount Code 2024",
      "content": "<h1>...</h1>...",
      "meta": {
        "description": "...",
        "keywords": [...]
      },
      "schema": {...},
      "seo": {...}
    }
  ],
  "topicalMap": {...}
}
```

---

## ✅ Status

- [x] Keyword research engine
- [x] Content Creator API integration
- [x] Webhook support
- [x] API authentication
- [x] Dashboard UI
- [x] Batch processing
- [x] Documentation
- [x] Deployed to production

---

## 🤝 Support

- **GitHub Issues:** https://github.com/Misto123/keyword-research-agent/issues
- **Email:** contact@rebelinternet.nl

---

## 📝 License

Private project - All rights reserved

---

**Built with ❤️ for automated niche site generation**

Last updated: December 2024
