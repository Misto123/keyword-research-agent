import OpenAI from 'openai';
import { config } from '../config.js';
import { DeepSeekClient } from './deepseek.js';
import { LLMSRelayClient } from './llmsrelay.js';

export class LLMService {
  constructor(provider = 'auto') {
    this.provider = provider;
    
    // Auto-detect available provider (priority: llmsrelay > deepseek > openai)
    if (provider === 'auto') {
      if (config.llmsrelay.apiKey) {
        this.provider = 'llmsrelay';
        this.client = new LLMSRelayClient();
      } else if (config.deepseek.apiKey) {
        this.provider = 'deepseek';
        this.client = new DeepSeekClient();
      } else if (config.openai.apiKey) {
        this.provider = 'openai';
        this.client = new OpenAI({ apiKey: config.openai.apiKey });
      } else {
        throw new Error('No AI provider configured. Add LLMSRELAY_API_KEY, OPENAI_API_KEY, or DEEPSEEK_API_KEY to .env');
      }
    } else if (provider === 'llmsrelay') {
      this.client = new LLMSRelayClient();
    } else if (provider === 'deepseek') {
      this.client = new DeepSeekClient();
    } else if (provider === 'openai') {
      this.client = new OpenAI({ apiKey: config.openai.apiKey });
    }
    
    console.log(`🤖 Using AI provider: ${this.provider}`);
  }

  async chat(messages, options = {}) {
    if (this.provider === 'llmsrelay' || this.provider === 'deepseek') {
      return this.client.chat(messages, options);
    }
    
    // OpenAI
    const response = await this.client.chat.completions.create({
      model: options.model || 'gpt-4o',
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4000,
      ...options
    });

    return response.choices[0].message.content;
  }

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

  async generateTopicalMap(clusters, topics) {
    const prompt = `Create a hierarchical topical map from these article clusters.

Topics:
${JSON.stringify(topics, null, 2)}

Article clusters (sample):
${JSON.stringify(clusters.slice(0, 30), null, 2)}

Create a tree structure showing:
- Main pillar topics
- Supporting cluster topics
- Individual articles under each cluster

Return as JSON with structure:
{
  "pillars": [{
    "name": "pillar name",
    "clusters": [{
      "name": "cluster name",
      "articles": ["article title 1", "article title 2"]
    }]
  }]
}`;

    const response = await this.chat([
      { role: 'system', content: 'You are a topical map architect. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ], { maxTokens: 8000 });

    return JSON.parse(response);
  }

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
