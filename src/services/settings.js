import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Settings Manager - Store API keys in file
 * In production, consider using a database or secure vault
 */
export class SettingsManager {
  constructor() {
    this.settingsFile = process.env.SETTINGS_FILE || '/tmp/settings.json';
  }

  async getSettings() {
    try {
      const data = await fs.readFile(this.settingsFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Return defaults if file doesn't exist
      return {
        dataforseo: { login: '', password: '' },
        serper: { apiKey: '' },
        llmsrelay: { apiKey: '', baseUrl: 'https://api.llmsrelay.com/v1' },
        openai: { apiKey: '' },
        deepseek: { apiKey: '' },
        wordpress: { url: '', token: '' },
        customApi: { url: '', key: '' }
      };
    }
  }

  async saveSettings(settings) {
    await fs.writeFile(this.settingsFile, JSON.stringify(settings, null, 2));
  }

  async updateSetting(key, value) {
    const settings = await this.getSettings();
    const keys = key.split('.');
    let current = settings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    await this.saveSettings(settings);
  }

  // Apply settings to config
  applyToConfig(config, settings) {
    if (settings.dataforseo?.login) {
      config.dataforseo.login = settings.dataforseo.login;
      config.dataforseo.password = settings.dataforseo.password;
    }
    if (settings.serper?.apiKey) {
      config.serper.apiKey = settings.serper.apiKey;
    }
    if (settings.llmsrelay?.apiKey) {
      config.llmsrelay.apiKey = settings.llmsrelay.apiKey;
      config.llmsrelay.baseUrl = settings.llmsrelay.baseUrl || 'https://api.llmsrelay.com/v1';
    }
    if (settings.openai?.apiKey) {
      config.openai.apiKey = settings.openai.apiKey;
    }
    if (settings.deepseek?.apiKey) {
      config.deepseek.apiKey = settings.deepseek.apiKey;
    }
    if (settings.wordpress?.url) {
      config.publishing.wordpress.url = settings.wordpress.url;
      config.publishing.wordpress.token = settings.wordpress.token;
    }
    if (settings.customApi?.url) {
      config.publishing.custom.url = settings.customApi.url;
      config.publishing.custom.key = settings.customApi.key;
    }
  }
}
