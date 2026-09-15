import dotenv from 'dotenv';
dotenv.config();

export const config = {
  dataforseo: {
    login: process.env.DATAFORSEO_LOGIN,
    password: process.env.DATAFORSEO_PASSWORD,
    baseUrl: 'https://api.dataforseo.com/v3'
  },
  serper: {
    apiKey: process.env.SERPER_API_KEY,
    baseUrl: 'https://google.serper.dev'
  },
  llmsrelay: {
    apiKey: process.env.LLMSRELAY_API_KEY,
    baseUrl: process.env.LLMSRELAY_BASE_URL || 'https://api.llmsrelay.com/v1'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseUrl: 'https://api.deepseek.com/v1'
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY
  },
  publishing: {
    wordpress: {
      url: process.env.WORDPRESS_API_URL,
      token: process.env.WORDPRESS_API_TOKEN
    },
    custom: {
      url: process.env.CUSTOM_API_URL,
      key: process.env.CUSTOM_API_KEY
    }
  },
  firecrawl: {
    apiKey: process.env.FIRECRAWL_API_KEY
  },
  app: {
    port: process.env.PORT || 3000,
    jobsDir: process.env.JOBS_DIR || '/tmp/jobs'
  }
};
