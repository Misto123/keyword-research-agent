# API Key for Keyword Research Agent

Your secure API key:
```
rebel-api-key-2024-secure-kw-research-d8f7a3b9e2c1
```

## Usage:

### With cURL:
```bash
curl -X POST https://keyword-research-agent-eight.vercel.app/api/research \
  -H "Content-Type: application/json" \
  -H "X-API-Key: rebel-api-key-2024-secure-kw-research-d8f7a3b9e2c1" \
  -d '{
    "niche": "funding pips discount code",
    "depth": "quick"
  }'
```

### With JavaScript:
```javascript
const response = await fetch('https://keyword-research-agent-eight.vercel.app/api/research', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'rebel-api-key-2024-secure-kw-research-d8f7a3b9e2c1'
  },
  body: JSON.stringify({
    niche: 'funding pips discount code',
    depth: 'quick'
  })
});

const { jobId } = await response.json();
```

## Set in Vercel:

1. Go to: https://vercel.com/bram-1592s-projects/keyword-research-agent/settings/environment-variables
2. Click "Add Variable"
3. Key: `API_KEY`
4. Value: `rebel-api-key-2024-secure-kw-research-d8f7a3b9e2c1`
5. Environment: Production
6. Click "Save"
7. Redeploy

## Test API Call:

```bash
# Start research
curl -X POST https://keyword-research-agent-eight.vercel.app/api/research \
  -H "Content-Type: application/json" \
  -H "X-API-Key: rebel-api-key-2024-secure-kw-research-d8f7a3b9e2c1" \
  -d '{
    "niche": "funding pips discount code",
    "country": "us",
    "depth": "quick"
  }'

# Response:
# {"jobId":"1703001234567","status":"pending","message":"Research job started"}

# Check status (wait 5 minutes)
curl https://keyword-research-agent-eight.vercel.app/api/jobs/1703001234567 \
  -H "X-API-Key: rebel-api-key-2024-secure-kw-research-d8f7a3b9e2c1"

# Get articles
curl https://keyword-research-agent-eight.vercel.app/api/jobs/1703001234567/articles \
  -H "X-API-Key: rebel-api-key-2024-secure-kw-research-d8f7a3b9e2c1"
```

## Saved Credentials:

**Serper.dev:** e09ed258e1c8db784354868198bd915e1fb7181d
**DataForSEO:** contact@rebelinternet.nl / FKvFltj4q8Ihcwg2

**API Key:** rebel-api-key-2024-secure-kw-research-d8f7a3b9e2c1
