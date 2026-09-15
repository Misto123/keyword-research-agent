/**
 * @typedef {Object} ResearchConfig
 * @property {string} niche - Target niche/website
 * @property {string} country - Target country code (e.g., 'US')
 * @property {string} language - Target language code (e.g., 'en')
 * @property {'quick'|'standard'|'exhaustive'} depth - Research depth
 */

/**
 * @typedef {Object} Keyword
 * @property {string} keyword
 * @property {number} volume
 * @property {number} [cpc]
 * @property {number} [competition]
 * @property {number} [difficulty]
 * @property {string} [trend]
 */

/**
 * @typedef {Object} SerpResult
 * @property {string} url
 * @property {string} title
 * @property {string} [description]
 * @property {number} position
 */

/**
 * @typedef {Object} Article
 * @property {string} title
 * @property {string} slug
 * @property {string} primaryKeyword
 * @property {string[]} secondaryKeywords
 * @property {string} intent
 * @property {string[]} h2Suggestions
 * @property {number} priority
 * @property {string} [content]
 */

/**
 * @typedef {Object} TopicalMap
 * @property {string} niche
 * @property {Object.<string, Article[]>} topics
 * @property {Article[]} articles
 */

export {};
