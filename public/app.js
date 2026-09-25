const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : '/api';

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    tab.classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    if (tabName === 'jobs') {
      loadJobs();
    }
  });
});

// New research form
document.getElementById('research-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = 'Starting...';
  btn.disabled = true;
  
  try {
    const res = await fetch(`${API_URL}/research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        niche: document.getElementById('niche').value,
        country: document.getElementById('country').value,
        language: document.getElementById('language').value,
        depth: document.getElementById('depth').value,
        autoPublish: document.getElementById('autoPublish')?.checked || false
      })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      alert(`✅ Research job started!\nJob ID: ${data.jobId}`);
      
      // Switch to jobs tab
      document.querySelector('.tab[data-tab="jobs"]').click();
      
      // Clear form
      e.target.reset();
    } else {
      alert(`❌ Error: ${data.error}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
});

// Load jobs list
async function loadJobs() {
  const container = document.getElementById('jobs-list');
  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading jobs...</p></div>';
  
  try {
    const res = await fetch(`${API_URL}/jobs`);
    const jobs = await res.json();
    
    if (jobs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📊</div>
          <p>No research jobs yet</p>
          <p style="margin-top: 10px;">Start your first research from the "New Research" tab</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = jobs.map(job => `
      <div class="job-item" onclick="viewJob('${job.id}')">
        <div class="job-header">
          <div class="job-title">${job.config.niche}</div>
          <div class="job-status status-${job.status}">${job.status}</div>
        </div>
        <div class="job-meta">
          <span>🌍 ${job.config.country}</span>
          <span>📊 ${job.config.depth}</span>
          <span>⏰ ${new Date(job.createdAt).toLocaleString()}</span>
        </div>
        ${job.status === 'running' ? `
          <div style="color: #71767b; font-size: 14px; margin-top: 10px;">
            ${job.stage}
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${job.progress}%"></div>
          </div>
        ` : ''}
        ${job.status === 'completed' ? `
          <div style="display: flex; gap: 20px; margin-top: 10px; color: #71767b; font-size: 14px;">
            <span>Keywords: ${job.result?.keywordCount || 0}</span>
            <span>Topics: ${job.result?.topicCount || 0}</span>
            <span>Articles: ${job.result?.articleCount || 0}</span>
          </div>
        ` : ''}
      </div>
    `).join('');
    
    // Auto-refresh running jobs
    if (jobs.some(j => j.status === 'running')) {
      setTimeout(loadJobs, 3000);
    }
  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❌</div>
        <p>Failed to load jobs</p>
        <p style="margin-top: 10px; color: #f4212e;">${error.message}</p>
      </div>
    `;
  }
}

// View job details
async function viewJob(jobId) {
  try {
    const res = await fetch(`${API_URL}/jobs/${jobId}`);
    const job = await res.json();
    
    if (job.status !== 'completed') {
      alert('Job not completed yet. Please wait...');
      return;
    }
    
    // Load articles
    const articlesRes = await fetch(`${API_URL}/jobs/${jobId}/articles`);
    const articles = await articlesRes.json();
    
    showJobDetails(job, articles);
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// Show job details modal
function showJobDetails(job, articles) {
  const modal = document.getElementById('article-modal');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  
  title.textContent = `Research: ${job.config.niche}`;
  
  body.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${job.result.keywordCount}</div>
        <div class="stat-label">Keywords</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${job.result.topicCount}</div>
        <div class="stat-label">Topics</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${job.result.articleCount}</div>
        <div class="stat-label">Articles</div>
      </div>
    </div>
    
    <h3 style="margin-top: 30px; margin-bottom: 15px;">Articles</h3>
    <div class="article-list">
      ${articles.map(article => `
        <div class="article-card" onclick="viewArticle('${job.id}', '${article.slug}')">
          <div class="article-title">${article.title}</div>
          <div class="article-keyword">${article.primaryKeyword}</div>
        </div>
      `).join('')}
    </div>
    
    <div style="margin-top: 30px; display: flex; gap: 10px;">
      <button class="btn btn-primary" onclick="downloadResults('${job.id}')">
        📥 Download Results
      </button>
      <button class="btn btn-danger" onclick="deleteJob('${job.id}')">
        🗑️ Delete Job
      </button>
    </div>
  `;
  
  modal.classList.add('active');
}

// View article
async function viewArticle(jobId, slug) {
  try {
    const res = await fetch(`${API_URL}/jobs/${jobId}/articles/${slug}`);
    const article = await res.json();
    
    const modal = document.getElementById('article-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = article.title;
    
    body.innerHTML = `
      <div style="margin-bottom: 20px;">
        <div style="color: #71767b; font-size: 14px; margin-bottom: 5px;">Primary Keyword</div>
        <div style="color: #1d9bf0; font-weight: 500;">${article.primaryKeyword}</div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="color: #71767b; font-size: 14px; margin-bottom: 5px;">Meta Description</div>
        <div>${article.metaDescription}</div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="color: #71767b; font-size: 14px; margin-bottom: 5px;">Secondary Keywords</div>
        <div>${article.secondaryKeywords.join(', ')}</div>
      </div>
      
      <div class="article-content">
        ${article.content}
      </div>
      
      <div style="margin-top: 30px; display: flex; gap: 10px;">
        <button class="btn btn-primary" onclick="copyArticle('${jobId}', '${slug}')">
          📋 Copy HTML
        </button>
        <button class="btn btn-secondary" onclick="viewJob('${jobId}')">
          ← Back to Job
        </button>
      </div>
    `;
    
    modal.classList.add('active');
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// Copy article HTML
async function copyArticle(jobId, slug) {
  try {
    const res = await fetch(`${API_URL}/jobs/${jobId}/articles/${slug}`);
    const article = await res.json();
    
    await navigator.clipboard.writeText(article.content);
    alert('✅ Article HTML copied to clipboard!');
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// Download results
async function downloadResults(jobId) {
  try {
    const res = await fetch(`${API_URL}/jobs/${jobId}/result`);
    const data = await res.json();
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-${jobId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// Delete job
async function deleteJob(jobId) {
  if (!confirm('Are you sure you want to delete this job? This cannot be undone.')) {
    return;
  }
  
  try {
    const res = await fetch(`${API_URL}/jobs/${jobId}`, { method: 'DELETE' });
    
    if (res.ok) {
      alert('✅ Job deleted');
      closeModal();
      loadJobs();
    } else {
      const data = await res.json();
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// Close modal
function closeModal() {
  document.getElementById('article-modal').classList.remove('active');
}

// Close modal on background click
document.getElementById('article-modal').addEventListener('click', (e) => {
  if (e.target.id === 'article-modal') {
    closeModal();
  }
});

// Load jobs on page load
loadJobs();
loadSettings();

// Password Toggle Function
function togglePassword(fieldId) {
  const field = document.getElementById(fieldId);
  const button = event.target;
  
  if (field.type === 'password') {
    field.type = 'text';
    button.textContent = '🙈';
  } else {
    field.type = 'password';
    button.textContent = '👁️';
  }
}

// Settings Management Functions
async function loadSettings() {
  try {
    const res = await fetch(`${API_URL}/settings`);
    const settings = await res.json();
    
    // Populate form fields
    if (settings.llmsrelay) {
      document.getElementById('llmsrelay-key').value = settings.llmsrelay.apiKey || '';
      document.getElementById('llmsrelay-url').value = settings.llmsrelay.baseUrl || 'https://api.llmsrelay.com/v1';
    }
    if (settings.dataforseo) {
      document.getElementById('dataforseo-login').value = settings.dataforseo.login || '';
      document.getElementById('dataforseo-password').value = settings.dataforseo.password || '';
    }
    if (settings.serper) {
      document.getElementById('serper-key').value = settings.serper.apiKey || '';
    }
    if (settings.wordpress) {
      document.getElementById('wordpress-url').value = settings.wordpress.url || '';
      document.getElementById('wordpress-token').value = settings.wordpress.token || '';
    }
    if (settings.customApi) {
      document.getElementById('custom-url').value = settings.customApi.url || '';
      document.getElementById('custom-key').value = settings.customApi.key || '';
    }
    
    updateStatusIndicators(settings);
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

function updateStatusIndicators(settings) {
  const dfStatus = document.getElementById('dataforseo-status');
  if (dfStatus) {
    if (settings.dataforseo?.login && settings.dataforseo?.password) {
      dfStatus.textContent = '✅';
      dfStatus.style.color = '#10b981';
    } else {
      dfStatus.textContent = '⚠️';
      dfStatus.style.color = '#f59e0b';
    }
  }
  
  const serperStatus = document.getElementById('serper-status');
  if (serperStatus) {
    if (settings.serper?.apiKey) {
      serperStatus.textContent = '✅';
      serperStatus.style.color = '#10b981';
    } else {
      serperStatus.textContent = '⚠️';
      serperStatus.style.color = '#f59e0b';
    }
  }
  
  const llmsrelayStatus = document.getElementById('llmsrelay-status');
  if (llmsrelayStatus) {
    if (settings.llmsrelay?.apiKey) {
      llmsrelayStatus.textContent = '✅';
      llmsrelayStatus.style.color = '#10b981';
    } else {
      llmsrelayStatus.textContent = '⚠️';
      llmsrelayStatus.style.color = '#f59e0b';
    }
  }
}

async function saveSettings() {
  const settings = {
    llmsrelay: {
      apiKey: document.getElementById('llmsrelay-key').value,
      baseUrl: document.getElementById('llmsrelay-url').value
    },
    dataforseo: {
      login: document.getElementById('dataforseo-login').value,
      password: document.getElementById('dataforseo-password').value
    },
    serper: {
      apiKey: document.getElementById('serper-key').value
    },
    wordpress: {
      url: document.getElementById('wordpress-url').value,
      token: document.getElementById('wordpress-token').value
    },
    customApi: {
      url: document.getElementById('custom-url').value,
      key: document.getElementById('custom-key').value
    }
  };
  
  try {
    const res = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    
    const result = await res.json();
    
    if (res.ok) {
      showMessage('✅ Settings saved successfully!', 'success');
      updateStatusIndicators(settings);
    } else {
      showMessage(`❌ Error: ${result.error}`, 'error');
    }
  } catch (error) {
    showMessage(`❌ Error: ${error.message}`, 'error');
  }
}

async function testConnection(provider) {
  let credentials = {};
  
  switch (provider) {
    case 'llmsrelay':
      credentials = {
        apiKey: document.getElementById('llmsrelay-key').value,
        baseUrl: document.getElementById('llmsrelay-url').value
      };
      break;
    case 'dataforseo':
      credentials = {
        login: document.getElementById('dataforseo-login').value,
        password: document.getElementById('dataforseo-password').value
      };
      break;
    case 'serper':
      credentials = {
        apiKey: document.getElementById('serper-key').value
      };
      break;
  }
  
  if (!credentials || Object.values(credentials).some(v => !v)) {
    showMessage('⚠️ Please fill in all required fields', 'error');
    return;
  }
  
  showMessage('🔌 Testing connection...', 'info');
  
  try {
    const res = await fetch(`${API_URL}/settings/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, credentials })
    });
    
    const result = await res.json();
    
    if (result.success) {
      showMessage(`✅ ${provider}: ${result.message}`, 'success');
    } else {
      showMessage(`❌ ${provider}: ${result.message}`, 'error');
    }
  } catch (error) {
    showMessage(`❌ Error testing ${provider}: ${error.message}`, 'error');
  }
}

function showMessage(message, type = 'info') {
  const footer = document.getElementById('message-footer');
  const text = document.getElementById('message-text');
  
  text.textContent = message;
  footer.className = `message-footer show ${type}`;
  
  setTimeout(() => {
    hideMessage();
  }, 5000);
}

function hideMessage() {
  const footer = document.getElementById('message-footer');
  footer.className = 'message-footer';
}

// Theme toggle
function toggleTheme() {
  document.body.classList.toggle('light-theme');
  localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}

// Load theme preference
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light-theme');
}
