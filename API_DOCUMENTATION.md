# Keyword Research API Documentation

## Base URL
```
https://keyword-research-agent-eight.vercel.app
```

## Authentication

All API requests require an API key. Include it in the request headers:

```http
X-API-Key: your-api-key-here
```

Or:

```http
Authorization: Bearer your-api-key-here
```

---

## Endpoints

### 1. Start Research Job

Start a new keyword research job for a given niche.

**Endpoint:** `POST /api/research`

**Headers:**
```
Content-Type: application/json
X-API-Key: your-api-key-here
```

**Request Body:**
```json
{
  "niche": "funding pips discount code",
  "country": "us",
  "language": "en",
  "depth": "quick",
  "publishDomain": "https://yourdomain.com",
  "webhookUrl": "https://your-webhook-endpoint.com/callback"
}
```

**Parameters:**
- `niche` (required): The niche/topic to research
- `country` (optional): Country code (default: "us")
- `language` (optional): Language code (default: "en")
- `depth` (optional): "quick", "standard", or "exhaustive" (default: "standard")
- `publishDomain` (optional): Domain for auto-publishing
- `webhookUrl` (optional): URL to receive completion notification

**Response:**
```json
{
  "jobId": "1703001234567",
  "status": "pending",
  "message": "Research job started"
}
```

---

### 2. Get Job Status

Check the status of a research job.

**Endpoint:** `GET /api/jobs/{jobId}`

**Headers:**
```
X-API-Key: your-api-key-here
```

**Response:**
```json
{
  "id": "1703001234567",
  "niche": "funding pips discount code",
  "status": "running",
  "progress": 45,
  "currentStage": "Analyzing SERP results",
  "createdAt": "2024-12-18T10:00:00Z",
  "startedAt": "2024-12-18T10:00:05Z"
}
```

**Status Values:**
- `pending`: Job queued, not started yet
- `running`: Research in progress
- `completed`: Successfully finished
- `failed`: Error occurred

---

### 3. List All Jobs

Get a list of all research jobs.

**Endpoint:** `GET /api/jobs`

**Headers:**
```
X-API-Key: your-api-key-here
```

**Response:**
```json
{
  "jobs": [
    {
      "id": "1703001234567",
      "niche": "funding pips discount code",
      "status": "completed",
      "progress": 100,
      "createdAt": "2024-12-18T10:00:00Z",
      "completedAt": "2024-12-18T10:05:00Z"
    }
  ]
}
```

---

### 4. Get Job Results

Get the complete research results including keywords, topical map, and SERP data.

**Endpoint:** `GET /api/jobs/{jobId}/result`

**Headers:**
```
X-API-Key: your-api-key-here
```

**Response:**
```json
{
  "niche": "funding pips discount code",
  "keywords": [
    {
      "keyword": "funding pips promo code",
      "volume": 1200,
      "difficulty": 35,
      "intent": "transactional",
      "cpc": 3.45
    }
  ],
  "topicalMap": {
    "mainTopic": "Funding Pips Discount Codes",
    "subtopics": [...]
  },
  "serp": {
    "topResults": [...]
  }
}
```

---

### 5. Get Generated Articles

Get all generated articles for a job.

**Endpoint:** `GET /api/jobs/{jobId}/articles`

**Headers:**
```
X-API-Key: your-api-key-here
```

**Response:**
```json
{
  "articles": [
    {
      "title": "Funding Pips Discount Code 2024: Save Up to 50%",
      "content": "...",
      "keywords": ["funding pips discount", "funding pips promo"],
      "wordCount": 1850,
      "meta": {
        "description": "...",
        "keywords": "..."
      }
    }
  ]
}
```

---

## Webhooks

When you provide a `webhookUrl` in your research request, the API will send a POST request to that URL when the job completes.

### Webhook Payload (Success)

```json
{
  "jobId": "1703001234567",
  "status": "completed",
  "niche": "funding pips discount code",
  "result": {
    "articles": [...],
    "keywords": [...],
    "topicalMap": {...}
  },
  "completedAt": "2024-12-18T10:05:00Z"
}
```

### Webhook Payload (Failure)

```json
{
  "jobId": "1703001234567",
  "status": "failed",
  "niche": "funding pips discount code",
  "error": "API rate limit exceeded",
  "completedAt": "2024-12-18T10:02:30Z"
}
```

---

## Rate Limits

- **Free tier:** 10 requests per hour
- **Paid tier:** 100 requests per hour
- **Enterprise:** Unlimited

---

## Error Responses

All errors return a JSON object with an `error` field:

```json
{
  "error": "Invalid API key"
}
```

### Common Error Codes

- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Missing or invalid API key
- `404`: Not Found - Job ID doesn't exist
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error

---

## Examples

### JavaScript/Node.js

```javascript
const response = await fetch('https://keyword-research-agent-eight.vercel.app/api/research', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'
  },
  body: JSON.stringify({
    niche: 'funding pips discount code',
    depth: 'quick',
    webhookUrl: 'https://your-site.com/webhook'
  })
});

const { jobId } = await response.json();
console.log('Job started:', jobId);
```

### cURL

```bash
curl -X POST https://keyword-research-agent-eight.vercel.app/api/research \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "niche": "funding pips discount code",
    "depth": "quick"
  }'
```

### Python

```python
import requests

response = requests.post(
    'https://keyword-research-agent-eight.vercel.app/api/research',
    headers={
        'Content-Type': 'application/json',
        'X-API-Key': 'your-api-key'
    },
    json={
        'niche': 'funding pips discount code',
        'depth': 'quick'
    }
)

job = response.json()
print(f"Job started: {job['jobId']}")
```

---

## Integration Examples

See the `/examples` directory for complete integration examples:

- `cloudflare-worker.js` - CF Worker integration with webhooks
- `batch-research.js` - Process multiple niches in parallel

---

## Support

For API support and questions:
- Email: support@yourdomain.com
- Documentation: https://keyword-research-agent-eight.vercel.app/docs
