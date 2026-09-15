import { DataForSEOClient } from './services/dataforseo.js';
import { LLMService } from './services/llm.js';
import { SerpAnalyzer } from './services/serp-analyzer.js';
import { KeywordDeduplicator } from './utils/deduplicator.js';
import { PublishingService } from './services/publisher.js';

/**
 * Main Research Engine - orchestrates the full pipeline
 */
export class ResearchEngine {
  constructor() {
    this.dataForSEO = new DataForSEOClient();
    this.llm = new LLMService();
    this.serpAnalyzer = new SerpAnalyzer();
    this.deduplicator = new KeywordDeduplicator();
    this.publisher = new PublishingService();
  }

  /**
   * Run full research pipeline
   */
  async runResearch(config, onProgress) {
    console.log('🚀 Starting keyword research for:', config.niche);
    
    const locationCode = this.getLocationCode(config.country);
    const languageCode = config.language;
    
    const updateProgress = (stage, progress) => {
      if (onProgress) onProgress(stage, progress);
    };

    // Stage 1: Generate seed keywords
    updateProgress('Generating seed keywords', 5);
    console.log('\n📍 Stage 1: Generating seed keywords...');
    const seeds = await this.llm.generateSeeds(config.niche);
    console.log(`Generated ${seeds.length} seed keywords`);

    // Stage 2: Find keywords
    updateProgress('Finding keywords from seeds', 15);
    console.log('\n🔍 Stage 2: Finding keywords from seeds...');
    const rawKeywords = await this.discoverKeywords(seeds, locationCode, languageCode);
    console.log(`Found ${rawKeywords.length} raw keywords`);

    // Stage 3: Remove duplicates
    updateProgress('Removing duplicates', 20);
    console.log('\n🧹 Stage 3: Removing duplicates...');
    let keywords = this.deduplicator.removeDuplicates(rawKeywords);
    keywords = this.deduplicator.mergeNearDuplicates(keywords);
    console.log(`${keywords.length} unique keywords after deduplication`);

    // Stage 4: SERP analysis for top keywords
    updateProgress('Analyzing SERPs and competitors', 30);
    console.log('\n📊 Stage 4: Analyzing SERPs and competitors...');
    const topKeywords = keywords.sort((a, b) => b.volume - a.volume).slice(0, 50);
    const serpData = await this.analyzeSERPs(topKeywords, locationCode, languageCode);

    // Stage 5: Map topics
    updateProgress('Mapping topics', 40);
    console.log('\n🗺️ Stage 5: Mapping topics...');
    const topics = await this.llm.identifyTopics(keywords);
    console.log(`Identified ${topics.length} main topics`);

    // Stage 6: Find gaps
    updateProgress('Finding keyword gaps', 45);
    console.log('\n🔎 Stage 6: Finding keyword gaps...');
    const gapKeywords = await this.llm.findGaps(keywords, topics);
    console.log(`Found ${gapKeywords.length} potential gap keywords`);

    // Stage 7: Validate gap keywords
    updateProgress('Validating gap keywords', 50);
    console.log('\n✅ Stage 7: Validating gap keywords...');
    const validatedGaps = await this.validateKeywords(gapKeywords, locationCode, languageCode);
    keywords = [...keywords, ...validatedGaps];
    console.log(`Added ${validatedGaps.length} validated gap keywords`);

    // Stage 8: Rank by relevance
    updateProgress('Ranking keywords', 52);
    console.log('\n📈 Stage 8: Ranking keywords...');
    keywords = this.rankKeywords(keywords, config.niche);

    // Stage 9: Group into articles
    updateProgress('Grouping keywords into articles', 54);
    console.log('\n📝 Stage 9: Grouping keywords into articles...');
    const articleClusters = await this.clusterIntoArticles(keywords);
    console.log(`Created ${articleClusters.length} article clusters`);

    // Stage 10: Check SERP overlap
    updateProgress('Validating clusters with SERP overlap', 56);
    console.log('\n🔗 Stage 10: Validating clusters with SERP overlap...');
    const validatedClusters = await this.validateClusters(articleClusters, locationCode, languageCode);

    // Stage 11: Build topical map
    updateProgress('Building topical map', 58);
    console.log('\n🏗️ Stage 11: Building topical map...');
    const topicalMap = await this.llm.generateTopicalMap(validatedClusters, topics);

    // Stage 12: Create article briefs
    updateProgress('Creating article briefs', 60);
    console.log('\n📋 Stage 12: Creating article briefs...');
    const articles = this.createArticleBriefs(validatedClusters, topicalMap);

    updateProgress('Research complete', 60);
    console.log('\n✨ Research complete!');
    console.log(`Total keywords: ${keywords.length}`);
    console.log(`Articles planned: ${articles.length}`);

    return {
      keywords,
      topics,
      serpData,
      topicalMap,
      articles,
      config
    };
  }

  /**
   * Discover keywords from seeds
   */
  async discoverKeywords(seeds, locationCode, languageCode) {
    const allKeywords = [];

    for (const seed of seeds) {
      try {
        // Get keyword suggestions
        const suggestions = await this.dataForSEO.getKeywordSuggestions(seed, locationCode, languageCode);
        
        // Get related keywords
        const related = await this.dataForSEO.getRelatedKeywords(seed, locationCode, languageCode);
        
        // Combine and format
        const combined = [...suggestions, ...related].map(kw => ({
          keyword: kw.keyword,
          volume: kw.search_volume || 0,
          cpc: kw.cpc || 0,
          competition: kw.competition || 0,
          difficulty: kw.keyword_difficulty || 0
        }));

        allKeywords.push(...combined);
      } catch (error) {
        console.error(`Error fetching keywords for "${seed}":`, error.message);
      }
    }

    return allKeywords;
  }

  /**
   * Analyze SERPs for keywords
   */
  async analyzeSERPs(keywords, locationCode, languageCode) {
    const serpData = {};

    for (const kw of keywords.slice(0, 20)) { // Limit to avoid API costs
      try {
        const analysis = await this.serpAnalyzer.analyzeSERP(kw.keyword, locationCode, languageCode);
        serpData[kw.keyword] = analysis;
      } catch (error) {
        console.error(`SERP analysis error for "${kw.keyword}":`, error.message);
      }
    }

    return serpData;
  }

  /**
   * Validate gap keywords against actual search data
   */
  async validateKeywords(keywords, locationCode, languageCode) {
    try {
      const metrics = await this.dataForSEO.getKeywordMetrics(keywords, locationCode, languageCode);
      
      return metrics
        .filter(kw => kw.search_volume > 0) // Only keep keywords with actual volume
        .map(kw => ({
          keyword: kw.keyword,
          volume: kw.search_volume,
          cpc: kw.cpc || 0,
          competition: kw.competition || 0,
          difficulty: kw.keyword_difficulty || 0
        }));
    } catch (error) {
      console.error('Error validating keywords:', error.message);
      return [];
    }
  }

  /**
   * Rank keywords by opportunity score
   */
  rankKeywords(keywords, niche) {
    return keywords.map(kw => {
      const relevance = 100; // Could use LLM to score relevance to niche
      const demand = Math.min(kw.volume / 1000, 100);
      const commercial = kw.cpc * 10;
      const difficulty = kw.difficulty || 50;

      const opportunityScore = ((relevance + demand + commercial) / 3) / (difficulty / 100);

      return { ...kw, opportunityScore };
    }).sort((a, b) => b.opportunityScore - a.opportunityScore);
  }

  /**
   * Cluster keywords into article groups
   */
  async clusterIntoArticles(keywords) {
    const topKeywords = keywords.slice(0, 100);
    const clusters = await this.llm.clusterKeywords(topKeywords);
    return clusters;
  }

  /**
   * Validate clusters using SERP overlap
   */
  async validateClusters(clusters, locationCode, languageCode) {
    // For now, return as-is. Full implementation would check SERP overlap
    return clusters;
  }

  /**
   * Create article briefs from clusters
   */
  createArticleBriefs(clusters, topicalMap) {
    return clusters.map((cluster, i) => ({
      id: `article-${i + 1}`,
      title: cluster.suggestedTitle,
      slug: this.slugify(cluster.suggestedTitle),
      primaryKeyword: cluster.primaryKeyword,
      secondaryKeywords: cluster.secondaryKeywords,
      intent: cluster.intent,
      h2Suggestions: this.generateH2Suggestions(cluster),
      priority: i < 20 ? 'high' : i < 50 ? 'medium' : 'low'
    }));
  }

  /**
   * Generate H2 suggestions from cluster
   */
  generateH2Suggestions(cluster) {
    return [
      `What is ${cluster.primaryKeyword}?`,
      `Benefits of ${cluster.primaryKeyword}`,
      `How to choose ${cluster.primaryKeyword}`,
      `Common mistakes to avoid`,
      `Conclusion`
    ];
  }

  /**
   * Create URL slug
   */
  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }

  /**
   * Get location code for country
   */
  getLocationCode(country) {
    const codes = {
      'US': 2840,
      'GB': 2826,
      'CA': 2124,
      'AU': 2036,
      'DE': 2276,
      'FR': 2250,
      'ES': 2724,
      'IT': 2380,
      'NL': 2528,
      'BR': 2076
    };
    return codes[country] || 2840;
  }
}
