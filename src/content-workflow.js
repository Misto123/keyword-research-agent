import { ResearchEngine } from './research-engine.js';
import { LLMService } from './services/llm.js';
import { PublishingService } from './services/publisher.js';
import fs from 'fs/promises';

/**
 * Content generation and publishing workflow
 */
export class ContentWorkflow {
  constructor() {
    this.researchEngine = new ResearchEngine();
    this.llm = new LLMService();
    this.publisher = new PublishingService();
  }

  /**
   * Run complete workflow: research → write → publish
   */
  async run(config, options = {}) {
    const { onProgress, outputDir } = options;
    const baseDir = outputDir || './output';
    
    console.log('🎯 Starting complete content workflow...\n');

    // Step 1: Research
    onProgress?.('Running research pipeline', 10);
    const research = await this.researchEngine.runResearch(config, onProgress);

    // Save research results
    onProgress?.('Saving research data', 60);
    await this.saveResearch(research, baseDir);

    // Step 2: Write articles
    onProgress?.('Writing articles', 70);
    console.log('\n✍️ Writing articles...');
    const articles = await this.writeArticles(research.articles, research, onProgress);

    // Save articles
    onProgress?.('Saving articles', 90);
    await this.saveArticles(articles, baseDir);

    // Step 3: Publish to production
    if (config.autoPublish) {
      onProgress?.('Publishing to production', 95);
      console.log('\n🚀 Publishing to production...');
      const publishResults = await this.publisher.publishBatch(articles);
      
      console.log('\n📊 Publishing results:');
      console.log(`✅ Success: ${publishResults.filter(r => r.success).length}`);
      console.log(`❌ Failed: ${publishResults.filter(r => !r.success).length}`);

      return { research, articles, publishResults };
    }

    onProgress?.('Complete', 100);
    console.log('\n✅ Workflow complete! Articles saved');
    return { research, articles };
  }

  /**
   * Write articles from briefs
   */
  async writeArticles(articleBriefs, researchData) {
    const articles = [];

    for (let i = 0; i < articleBriefs.length; i++) {
      const brief = articleBriefs[i];
      console.log(`\nWriting ${i + 1}/${articleBriefs.length}: ${brief.title}`);

      try {
        // Get relevant research data for this article
        const relevantData = {
          serpData: researchData.serpData[brief.primaryKeyword],
          keywords: researchData.keywords.filter(kw => 
            brief.secondaryKeywords.includes(kw.keyword)
          ),
          topics: researchData.topics
        };

        // Write the article
        const article = await this.llm.writeArticle(brief, relevantData);

        articles.push({
          ...article,
          slug: brief.slug,
          primaryKeyword: brief.primaryKeyword,
          secondaryKeywords: brief.secondaryKeywords,
          intent: brief.intent
        });

        console.log(`✅ Completed: ${article.title}`);

        // Rate limit to avoid API throttling
        await this.delay(2000);
      } catch (error) {
        console.error(`❌ Error writing "${brief.title}":`, error.message);
      }
    }

    return articles;
  }

  /**
   * Save research data to JSON
   */
  async saveResearch(research, baseDir = './output') {
    await fs.mkdir(baseDir, { recursive: true });
    await fs.writeFile(
      `${baseDir}/research.json`,
      JSON.stringify(research, null, 2)
    );
    console.log(`💾 Research saved to ${baseDir}/research.json`);
  }

  /**
   * Save articles to files
   */
  async saveArticles(articles, baseDir = './output') {
    await fs.mkdir(`${baseDir}/articles`, { recursive: true });

    // Save individual articles
    for (const article of articles) {
      const filename = `${baseDir}/articles/${article.slug}.json`;
      await fs.writeFile(filename, JSON.stringify(article, null, 2));
    }

    // Save index
    await fs.writeFile(
      `${baseDir}/articles/index.json`,
      JSON.stringify(articles.map(a => ({
        title: a.title,
        slug: a.slug,
        primaryKeyword: a.primaryKeyword
      })), null, 2)
    );

    console.log(`💾 Saved ${articles.length} articles to ${baseDir}/articles/`);
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
