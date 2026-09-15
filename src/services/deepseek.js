import { config } from '../config.js';

/**
 * DeepSeek API client - Cost-effective AI for content generation
 * Compatible with OpenAI API format
 */
export class DeepSeekClient {
  constructor() {
    this.apiKey = config.deepseek.apiKey;
    this.baseUrl = config.deepseek.baseUrl;
  }

  async chat(messages, options = {}) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || 'deepseek-chat',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.choices[0].message.content;
  }

  /**
   * Generate seed keywords
   */
  async generateSeeds(niche) {
    const prompt = `Generate 15-20 seed keywords for the niche: "${niche}"

These should be the core search terms someone would use when looking for information in this niche.
Return ONLY a JSON array of keywords, no explanation.

Example format: ["keyword 1", "keyword 2", "keyword 3"]`;

    const response = await this.chat([
      { role: 'system', content: 'You are a keyword research expert. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ]);

    return JSON.parse(response);
  }

  /**
   * Identify topics from keywords
   */
  async identifyTopics(keywords) {
    const prompt = `Analyze these keywords and identify the main topics/themes:

${keywords.slice(0, 200).map(k => k.keyword).join('\n')}

Group them into 5-10 main topics. For each topic, provide:
- name: topic name
- description: brief description
- subtopics: array of subtopic names

Return as JSON array.`;

    const response = await this.chat([
      { role: 'system', content: 'You are a topical clustering expert. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ]);

    return JSON.parse(response);
  }

  /**
   * Find keyword gaps
   */
  async findGaps(existingKeywords, topics) {
    const prompt = `Given these existing keywords and topics, identify keyword gaps.

Topics:
${JSON.stringify(topics, null, 2)}

Existing keywords (sample):
${existingKeywords.slice(0, 100).map(k => k.keyword).join(', ')}

Generate 20-30 new keyword ideas that:
1. Fill obvious gaps in the topic coverage
2. Address related questions or problems
3. Cover different angles (how-to, best, reviews, comparisons, etc.)

Return ONLY a JSON array of new keyword strings.`;

    const response = await this.chat([
      { role: 'system', content: 'You are a keyword gap analysis expert. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ]);

    return JSON.parse(response);
  }

  /**
   * Cluster keywords into articles
   */
  async clusterKeywords(keywords) {
    const prompt = `Cluster these keywords into article topics. Keywords that should target the same page should be grouped together.

Keywords:
${keywords.slice(0, 100).map(k => `${k.keyword} (vol: ${k.volume})`).join('\n')}

Return JSON array of clusters:
[{
  "primaryKeyword": "main keyword",
  "secondaryKeywords": ["related keyword 1", "related keyword 2"],
  "intent": "informational|commercial|transactional",
  "suggestedTitle": "article title"
}]`;

    const response = await this.chat([
      { role: 'system', content: 'You are a content clustering expert. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ]);

    return JSON.parse(response);
  }

  /**
   * Write article content
   */
  async writeArticle(articleBrief, researchData) {
    const prompt = `Write a comprehensive, SEO-optimized article.

Title: ${articleBrief.title}
Primary keyword: ${articleBrief.primaryKeyword}
Secondary keywords: ${articleBrief.secondaryKeywords.join(', ')}
Intent: ${articleBrief.intent}

Research data:
${JSON.stringify(researchData, null, 2)}

Write a complete article (1500-2500 words) that:
1. Targets the primary keyword naturally
2. Incorporates secondary keywords
3. Matches the search intent
4. Uses clear H2/H3 structure
5. Provides genuine value

Return as JSON:
{
  "title": "final title",
  "content": "full HTML content with proper headings",
  "metaDescription": "meta description (150-160 chars)",
  "excerpt": "short excerpt (150 chars)"
}`;

    const response = await this.chat([
      { role: 'system', content: 'You are an expert SEO content writer. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ], { maxTokens: 8000, temperature: 0.8 });

    return JSON.parse(response);
  }
}
