import { config } from '../config.js';

/**
 * Publishing service for various platforms
 */
export class PublishingService {
  /**
   * Publish article to WordPress
   */
  async publishToWordPress(article) {
    if (!config.publishing.wordpress.url) {
      throw new Error('WordPress URL not configured');
    }

    const response = await fetch(`${config.publishing.wordpress.url}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.publishing.wordpress.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        status: 'draft', // Change to 'publish' for immediate publish
        slug: article.slug,
        meta: {
          _yoast_wpseo_metadesc: article.metaDescription,
          _yoast_wpseo_focuskw: article.primaryKeyword
        }
      })
    });

    if (!response.ok) {
      throw new Error(`WordPress publish failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Publish article to custom API
   */
  async publishToCustomAPI(article) {
    if (!config.publishing.custom.url) {
      throw new Error('Custom API URL not configured');
    }

    const response = await fetch(config.publishing.custom.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.publishing.custom.key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(article)
    });

    if (!response.ok) {
      throw new Error(`Custom API publish failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Auto-detect and publish to configured platform
   */
  async publish(article) {
    if (config.publishing.wordpress.url) {
      return this.publishToWordPress(article);
    } else if (config.publishing.custom.url) {
      return this.publishToCustomAPI(article);
    } else {
      throw new Error('No publishing platform configured');
    }
  }

  /**
   * Batch publish multiple articles
   */
  async publishBatch(articles, delayMs = 2000) {
    const results = [];

    for (const article of articles) {
      try {
        console.log(`Publishing: ${article.title}`);
        const result = await this.publish(article);
        results.push({ success: true, article: article.title, result });
        
        // Delay between requests to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } catch (error) {
        results.push({ success: false, article: article.title, error: error.message });
      }
    }

    return results;
  }
}
