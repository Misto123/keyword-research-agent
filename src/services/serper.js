import { config } from '../config.js';

/**
 * Serper.dev API client - Fast, affordable SERP scraping
 */
export class SerperClient {
  constructor() {
    this.apiKey = config.serper.apiKey;
    this.baseUrl = config.serper.baseUrl;
  }

  async request(endpoint, data) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get organic search results
   */
  async search(query, options = {}) {
    const data = {
      q: query,
      location: options.location || 'United States',
      gl: options.gl || 'us',
      hl: options.hl || 'en',
      num: options.num || 20
    };

    const result = await this.request('/search', data);
    
    return {
      organic: result.organic || [],
      peopleAlsoAsk: result.peopleAlsoAsk || [],
      relatedSearches: result.relatedSearches || [],
      answerBox: result.answerBox,
      knowledgeGraph: result.knowledgeGraph
    };
  }

  /**
   * Batch search multiple keywords
   */
  async batchSearch(keywords, options = {}) {
    const results = [];
    
    for (const keyword of keywords) {
      try {
        const result = await this.search(keyword, options);
        results.push({ keyword, ...result });
        
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Serper error for "${keyword}":`, error.message);
        results.push({ keyword, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Get autocomplete suggestions
   */
  async autocomplete(query) {
    const data = { q: query };
    const result = await this.request('/autocomplete', data);
    return result.suggestions || [];
  }
}
