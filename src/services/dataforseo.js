import { config } from '../config.js';

export class DataForSEOClient {
  constructor() {
    this.baseUrl = config.dataforseo.baseUrl;
    this.auth = Buffer.from(
      `${config.dataforseo.login}:${config.dataforseo.password}`
    ).toString('base64');
  }

  async request(endpoint, data) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get keyword suggestions from seed keyword
   */
  async getKeywordSuggestions(keyword, locationCode = 2840, languageCode = 'en') {
    const data = [{
      keyword,
      location_code: locationCode,
      language_code: languageCode,
      limit: 1000
    }];

    const result = await this.request('/dataforseo_labs/google/keyword_suggestions/live', data);
    return result.tasks?.[0]?.result?.[0]?.items || [];
  }

  /**
   * Get related keywords
   */
  async getRelatedKeywords(keyword, locationCode = 2840, languageCode = 'en') {
    const data = [{
      keyword,
      location_code: locationCode,
      language_code: languageCode,
      limit: 1000
    }];

    const result = await this.request('/dataforseo_labs/google/related_keywords/live', data);
    return result.tasks?.[0]?.result?.[0]?.items || [];
  }

  /**
   * Get keyword ideas (broader research)
   */
  async getKeywordIdeas(keywords, locationCode = 2840, languageCode = 'en') {
    const data = [{
      keywords,
      location_code: locationCode,
      language_code: languageCode,
      limit: 1000,
      include_seed_keyword: true
    }];

    const result = await this.request('/dataforseo_labs/google/keyword_ideas/live', data);
    return result.tasks?.[0]?.result?.[0]?.items || [];
  }

  /**
   * Get SERP results for keyword
   */
  async getSerpResults(keyword, locationCode = 2840, languageCode = 'en') {
    const data = [{
      keyword,
      location_code: locationCode,
      language_code: languageCode,
      device: 'desktop',
      os: 'windows',
      depth: 100
    }];

    const result = await this.request('/serp/google/organic/live/advanced', data);
    return result.tasks?.[0]?.result?.[0]?.items || [];
  }

  /**
   * Get keyword metrics (volume, CPC, competition, difficulty)
   */
  async getKeywordMetrics(keywords, locationCode = 2840, languageCode = 'en') {
    const data = [{
      keywords,
      location_code: locationCode,
      language_code: languageCode
    }];

    const result = await this.request('/dataforseo_labs/google/bulk_keyword_difficulty/live', data);
    return result.tasks?.[0]?.result?.[0]?.items || [];
  }

  /**
   * Get search volume and trends
   */
  async getSearchVolume(keywords, locationCode = 2840, languageCode = 'en') {
    const data = [{
      keywords,
      location_code: locationCode,
      language_code: languageCode
    }];

    const result = await this.request('/keywords_data/google_ads/search_volume/live', data);
    return result.tasks?.[0]?.result || [];
  }
}
