# Quick Start - API Usage

## Your API Key
```
rebel-api-key-2024-secure-kw-research-d8f7a3b9e2c1
```

## API Endpoint
```
https://keyword-research-agent-eight.vercel.app
```

## Make Your First API Call

### 1. Start Research
```bash
curl -X POST https://keyword-research-agent-eight.vercel.app/api/research \
  -H "Content-Type: application/json" \
  -H "X-API-Key: rebel-api-key-2024-secure-kw-research-d8f7a3b9e2c1" \
  -d '{
    "niche": "funding pips discount code",
    "country": "us",
    "language": "en",
    "depth": "quick"
  }'
```

**Response:**
```json
{
  "jobId": "1703001234567",
  "status": "pending",
  "message": "Research job started"
}
```

### 2. Check Status (~5 minutes)
```bash
curl https://keyword-research-agent-eight.vercel.app/api/jobs/1703001234567 \
  -H "X-API-Key: rebel-api-key-2024-secure-kw-research-d8f7a3b9e2c1"
```

**Response:**
```json
{
  "id": "1703001234567",
  "niche": "funding pips discount code",
  "status": "completed",
  "progress": 100,
  "completedAt": "2024-12-18T10:05:00Z"
}
```

### 3. Get Articles
```bash
curl https://keyword-research-agent-eight.vercel.app/api/jobs/1703001234567/articles \
  -H "X-API-Key: rebel-api-key-2024-secure-kw-research-d8f7a3b9e2c1"
```

**Response:**
```json
{
  "articles": [
    {
      "title": "Funding Pips Discount Code 2024",
      "content": "...",
      "wordCount": 1850,
      "keywords": ["funding pips", "discount code"]
    }
  ]
}
```

## Your Saved Credentials

**Serper.dev:**
- API Key: `e09ed258e1c8db784354868198bd915e1fb7181d`

**DataForSEO:**
- Email: `contact@rebelinternet.nl`
- Password: `FKvFltj4q8Ihcwg2`

**API Key:**
- `rebel-api-key-2024-secure-kw-research-d8f7a3b9e2c1`

## Costs

- **Quick mode:** $1-2 per niche
- **Duration:** ~5 minutes
- **Output:** 10+ articles, keywords, topical map

## Next Steps

1. Wait for Vercel environment variable setup
2. Make your first API call
3. Get articles in ~5 minutes
4. Use articles in your site builder!

Ready to generate unlimited niche content! 🚀
