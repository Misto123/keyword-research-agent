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
   * Write articles from briefs using Content Creator API
   */
  async writeArticles(articleBriefs, researchData) {
    const articles = [];
    const contentCreatorUrl = 'https://kalswipohwljtousvacy.supabase.co/functions/v1/public-api';
    const contentCreatorKey = process.env.CONTENT_CREATOR_API_KEY;

    if (!contentCreatorKey) {
      console.warn('⚠️ CONTENT_CREATOR_API_KEY not set, using fallback generation');
      return this.writeArticlesFallback(articleBriefs);
    }

    for (let i = 0; i < articleBriefs.length; i++) {
      const brief = articleBriefs[i];
      console.log(`\nWriting ${i + 1}/${articleBriefs.length}: ${brief.title}`);

      try {
        // Call Content Creator API
        const response = await fetch(contentCreatorUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': contentCreatorKey
          },
          body: JSON.stringify({
            keywords: {
              main_keyword: brief.primaryKeyword,
              secondary_keywords: brief.secondaryKeywords || []
            },
            language: 'English',
            article_length_words: 600,
            paragraph_count: 3,
            tone: 'conversational',
            search_intent: brief.intent || 'informational',
            enable_no_ai_slop: true,
            enable_api_output: true,
            enable_seo_optimization: true,
            include_seo_insights: true
          })
        });

        if (!response.ok) {
          console.error(`❌ Content Creator API error: ${response.status}`);
          continue;
        }

        const result = await response.json();

        if (!result.success || !result.data) {
          console.error(`❌ Invalid response from Content Creator`);
          continue;
        }

        // Convert Content Creator format
        const content = result.data.content;
        let html = `<h1>${content.h1}</h1>\n\n<p>${content.intro}</p>\n\n`;
        for (const section of content.sections) {
          html += `<h2>${section.heading}</h2>\n${section.body}\n\n`;
        }
        if (content.cta) html += `<p><strong>${content.cta}</strong></p>\n`;

        articles.push({
          title: result.data.meta.title,
          content: html,
          slug: brief.slug || result.data.meta.slug,
          primaryKeyword: brief.primaryKeyword,
          secondaryKeywords: brief.secondaryKeywords,
          intent: brief.intent,
          meta: {
            description: result.data.meta.description,
            keywords: [brief.primaryKeyword, ...(brief.secondaryKeywords || [])]
          },
          wordCount: html.split(/\s+/).length,
          seo: result.data.seo_insights || null,
          schema: result.data.schema || null
        });

        console.log(`✅ Completed: ${result.data.meta.title} (${articles[articles.length-1].wordCount} words)`);

        // Rate limit
        await this.delay(1000);
      } catch (error) {
        console.error(`❌ Error writing "${brief.title}":`, error.message);
      }
    }

    return articles.length > 0 ? articles : this.writeArticlesFallback(articleBriefs);
  }

  /**
   * Fallback article generation
   */
  async writeArticlesFallback(articleBriefs) {
    console.log('📝 Using fallback article generation...');
    return articleBriefs.map(brief => ({
      title: brief.title,
      content: `<h1>${brief.title}</h1>\n\n<p>Comprehensive guide about ${brief.primaryKeyword}.</p>`,
      slug: brief.slug,
      primaryKeyword: brief.primaryKeyword,
      secondaryKeywords: brief.secondaryKeywords,
      intent: brief.intent,
      meta: {
        description: `Learn about ${brief.primaryKeyword}.`,
        keywords: [brief.primaryKeyword]
      },
      wordCount: 150
    }));
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
