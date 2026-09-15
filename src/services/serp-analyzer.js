import { DataForSEOClient } from './dataforseo.js';

/**
 * SERP Analysis and Competitor Research
 */
export class SerpAnalyzer {
  constructor() {
    this.client = new DataForSEOClient();
  }

  /**
   * Analyze SERP for a keyword
   */
  async analyzeSERP(keyword, locationCode = 2840, languageCode = 'en') {
    const items = await this.client.getSerpResults(keyword, locationCode, languageCode);
    
    const organicResults = items.filter(item => item.type === 'organic');
    const paa = items.filter(item => item.type === 'people_also_ask');
    const relatedSearches = items.filter(item => item.type === 'related_searches');

    return {
      keyword,
      totalResults: organicResults.length,
      topResults: organicResults.slice(0, 10).map(r => ({
        position: r.rank_group,
        url: r.url,
        domain: r.domain,
        title: r.title,
        description: r.description
      })),
      peopleAlsoAsk: paa.flatMap(p => p.items || []).map(q => q.question),
      relatedSearches: relatedSearches.flatMap(r => r.items || []).map(s => s.query),
      serpFeatures: this.extractSerpFeatures(items)
    };
  }

  /**
   * Extract SERP features
   */
  extractSerpFeatures(items) {
    const features = new Set();

    for (const item of items) {
      if (item.type !== 'organic') {
        features.add(item.type);
      }
    }

    return Array.from(features);
  }

  /**
   * Get top competitors for a keyword
   */
  async getCompetitors(keyword, locationCode = 2840, languageCode = 'en') {
    const serp = await this.analyzeSERP(keyword, locationCode, languageCode);
    
    return serp.topResults.map(r => ({
      domain: r.domain,
      url: r.url,
      title: r.title,
      position: r.position
    }));
  }

  /**
   * Check SERP overlap between two keywords
   */
  async checkSerpOverlap(keyword1, keyword2, locationCode = 2840, languageCode = 'en') {
    const [serp1, serp2] = await Promise.all([
      this.analyzeSERP(keyword1, locationCode, languageCode),
      this.analyzeSERP(keyword2, locationCode, languageCode)
    ]);

    const urls1 = new Set(serp1.topResults.map(r => r.url));
    const urls2 = new Set(serp2.topResults.map(r => r.url));

    const overlap = [...urls1].filter(url => urls2.has(url));
    const overlapPercent = (overlap.length / Math.max(urls1.size, urls2.size)) * 100;

    return {
      keyword1,
      keyword2,
      overlapCount: overlap.length,
      overlapPercent: Math.round(overlapPercent),
      shouldBeSamePage: overlapPercent > 60 // High overlap = same intent
    };
  }

  /**
   * Batch check SERP overlap for keyword clustering
   */
  async batchCheckOverlap(keywords, locationCode = 2840, languageCode = 'en') {
    const clusters = [];
    const processed = new Set();

    for (let i = 0; i < keywords.length; i++) {
      if (processed.has(keywords[i].keyword)) continue;

      const cluster = [keywords[i]];
      processed.add(keywords[i].keyword);

      // Compare with remaining keywords
      for (let j = i + 1; j < Math.min(i + 20, keywords.length); j++) {
        if (processed.has(keywords[j].keyword)) continue;

        const overlap = await this.checkSerpOverlap(
          keywords[i].keyword,
          keywords[j].keyword,
          locationCode,
          languageCode
        );

        if (overlap.shouldBeSamePage) {
          cluster.push(keywords[j]);
          processed.add(keywords[j].keyword);
        }
      }

      if (cluster.length > 0) {
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  /**
   * Extract common patterns from competitor titles
   */
  analyzeCompetitorTitles(serpResults) {
    const titles = serpResults.topResults.map(r => r.title);
    
    const patterns = {
      hasList: titles.filter(t => /\d+|top|best/.test(t.toLowerCase())).length,
      hasYear: titles.filter(t => /202\d/.test(t)).length,
      hasQuestion: titles.filter(t => /how|what|why|when/.test(t.toLowerCase())).length,
      hasComparison: titles.filter(t => /vs|versus|compared/.test(t.toLowerCase())).length,
      avgLength: Math.round(titles.reduce((sum, t) => sum + t.length, 0) / titles.length)
    };

    return patterns;
  }
}
