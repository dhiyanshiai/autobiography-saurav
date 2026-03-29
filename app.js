// autobiography-saurav / app.js

const CHAPTERS = {
  '01-childhood':           'Childhood',
  '02-college-engineering': 'College Days — Engineering',
  '03-early-career':        'Early Career — Work after Engineering',
  '04-mba-pivot':           'The MBA Pivot — Engineering to Finance',
  '05-post-mba-growth':     'Post-MBA Work — Struggles & Growth',
  '06-corporate-journey':   'Corporate Journey — Companies & Roles',
  '07-family-life':         'Family Life — Parents, Ancestors, Wife',
  '08-flipkart-ai':         'Flipkart & the AI Awakening'
};

// ─── Settings ────────────────────────────────────────────────────────────────

function getSettings() {
  return {
    username: localStorage.getItem('gh_username') || 'dhiyanshiai',
    repo:     localStorage.getItem('gh_repo')     || 'autobiography-saurav',
    token:    localStorage.getItem('gh_token')    || ''
  };
}

function saveSettings() {
  const username = document.getElementById('gh-username').value.trim();
  const repo     = document.getElementById('gh-repo').value.trim();
  const token    = document.getElementById('gh-token').value.trim();

  if (!username || !repo || !token) {
    showStatus('Please fill in all fields.', 'error');
    return;
  }

  localStorage.setItem('gh_username', username);
  localStorage.setItem('gh_repo',     repo);
  localStorage.setItem('gh_token',    token);

  closeSettings();
  showStatus('Settings saved! You\'re ready to capture your story.', 'success');
  renderRecentEntries();
}

function openSettings() {
  const { username, repo, token } = getSettings();
  document.getElementById('gh-username').value = username;
  document.getElementById('gh-repo').value     = repo;
  document.getElementById('gh-token').value    = token;
  document.getElementById('setup-overlay').classList.remove('hidden');
}

function closeSettings() {
  document.getElementById('setup-overlay').classList.add('hidden');
}

// Close modal on backdrop click
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('setup-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('setup-overlay')) {
      const { username, token } = getSettings();
      if (username && token) closeSettings();
    }
  });
});

// ─── Voice Recognition ────────────────────────────────────────────────────────

let recognition  = null;
let isRecording  = false;
let finalText    = '';

function initSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return false;

  recognition = new SR();
  recognition.continuous     = true;
  recognition.interimResults = true;
  recognition.lang           = 'en-US';

  recognition.onresult = (event) => {
    let interim = '';
    finalText = '';
    for (let i = 0; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalText += event.results[i][0].transcript + ' ';
      } else {
        interim += event.results[i][0].transcript;
      }
    }
    document.getElementById('entry-text').value = (finalText + interim).trim();
    updateCharCount();
  };

  recognition.onerror = (event) => {
    stopRecording();
    if (event.error === 'not-allowed') {
      showStatus('Microphone access denied. Please allow microphone in browser settings.', 'error');
    } else if (event.error !== 'aborted') {
      showStatus('Voice error: ' + event.error + '. Try typing instead.', 'error');
    }
  };

  recognition.onend = () => {
    if (isRecording) stopRecording();
  };

  return true;
}

function toggleRecording() {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

function startRecording() {
  if (!recognition && !initSpeechRecognition()) {
    showStatus('Voice recognition not supported here. Use your keyboard mic button instead.', 'error');
    return;
  }

  try {
    finalText = document.getElementById('entry-text').value;
    recognition.start();
    isRecording = true;
    document.getElementById('mic-btn').classList.add('recording');
    document.getElementById('voice-status').textContent = 'Listening… tap to stop';
  } catch (e) {
    showStatus('Could not start microphone. Try again.', 'error');
  }
}

function stopRecording() {
  if (recognition) {
    try { recognition.stop(); } catch (_) {}
  }
  isRecording = false;
  document.getElementById('mic-btn').classList.remove('recording');
  document.getElementById('voice-status').textContent = 'Tap to record voice';
}

// ─── GitHub API ───────────────────────────────────────────────────────────────

function buildFilePath(chapter) {
  const now      = new Date();
  const date     = now.toISOString().slice(0, 10);
  const time     = now.toTimeString().slice(0, 5).replace(':', '-');
  return {
    path:     `entries/${chapter}/${date}_${time}_raw.md`,
    date,
    time:     now.toTimeString().slice(0, 5)
  };
}

function buildMarkdown(text, chapter, date, time, tags) {
  const tagLine = tags ? `tags: [${tags.split(',').map(t => t.trim()).filter(Boolean).join(', ')}]\n` : '';
  return `---\ndate: ${date}\ntime: ${time}\nchapter: ${chapter}\n${tagLine}---\n\n${text.trim()}\n`;
}

// btoa with Unicode support (iOS Safari compatible)
function toBase64(str) {
  var bytes = new TextEncoder().encode(str);
  var binary = '';
  for (var i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function submitEntry() {
  const { username, repo, token } = getSettings();

  if (!username || !token) {
    openSettings();
    return;
  }

  const text    = document.getElementById('entry-text').value.trim();
  const chapter = document.getElementById('chapter-select').value;
  const tags    = document.getElementById('entry-tags').value.trim();

  if (!text) {
    showStatus('Please add some content before saving.', 'error');
    return;
  }

  const { path, date, time } = buildFilePath(chapter);
  const content  = buildMarkdown(text, chapter, date, time, tags);
  const encoded  = toBase64(content);
  const btn      = document.getElementById('submit-btn');

  btn.disabled   = true;
  btn.innerHTML  = '<span class="spinner"></span> Saving…';

  var apiUrl = 'https://api.github.com/repos/' + username + '/' + repo + '/contents/' + path;
  console.log('URL:', apiUrl);
  console.log('Token prefix:', token.substring(0, 8));
  console.log('Encoded length:', encoded.length);

  try {
    const res = await fetch(
      `https://api.github.com/repos/${username}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type':  'application/json'
        },
        body: JSON.stringify({
          message: 'Add entry: ' + CHAPTERS[chapter] + ' - ' + date,
          content: encoded
        })
      }
    );

    if (res.ok) {
      const chapterName = CHAPTERS[chapter];
      showStatus(`Saved to ${chapter}/${date}_${time.replace(':', '-')}_raw.md`, 'success');
      addToLocalHistory({ chapter, chapterName, date, time, preview: text.slice(0, 100) });
      clearEntry();
    } else {
      const err = await res.json();
      showStatus(`GitHub error: ${err.message}`, 'error');
    }
  } catch (e) {
    showStatus('Error: ' + e.name + ' - ' + e.message, 'error');
  } finally {
    btn.disabled  = false;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg> Save to GitHub';
  }
}

// ─── Entry Management ─────────────────────────────────────────────────────────

function clearEntry() {
  document.getElementById('entry-text').value = '';
  document.getElementById('entry-tags').value  = '';
  updateCharCount();
  if (isRecording) stopRecording();
}

function updateCharCount() {
  const len = document.getElementById('entry-text').value.length;
  document.getElementById('char-count').textContent = len;
}

// ─── Local History (display only — source of truth is GitHub) ─────────────────

function addToLocalHistory(entry) {
  let history = getHistory();
  history.unshift(entry);
  history = history.slice(0, 15);
  localStorage.setItem('entry_history', JSON.stringify(history));
  renderRecentEntries();
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('entry_history') || '[]');
  } catch(e) {
    return [];
  }
}

function renderRecentEntries() {
  const history   = getHistory();
  const container = document.getElementById('recent-list');
  const countEl   = document.getElementById('entry-count');

  countEl.textContent = history.length ? `${history.length} saved` : '';

  if (history.length === 0) {
    container.innerHTML = '<p class="empty-msg">No entries yet. Start capturing your story!</p>';
    return;
  }

  container.innerHTML = history.map(e => `
    <div class="entry-item">
      <div class="entry-meta">
        <span class="entry-chapter">${e.chapterName || CHAPTERS[e.chapter] || e.chapter}</span>
        <span class="entry-date">${e.date} ${e.time || ''}</span>
      </div>
      <p class="entry-preview">${escapeHtml(e.preview)}${e.preview.length >= 100 ? '…' : ''}</p>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── Status Messages ──────────────────────────────────────────────────────────

let statusTimer = null;

function showStatus(msg, type) {
  const el    = document.getElementById('status-msg');
  el.textContent = msg;
  el.className   = `status ${type}`;

  if (statusTimer) clearTimeout(statusTimer);
  if (type === 'success') {
    statusTimer = setTimeout(() => el.className = 'status hidden', 5000);
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  var settings = getSettings();

  // Wire up buttons via JS (safer than onclick on iOS)
  document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
  document.getElementById('settings-btn').addEventListener('click', openSettings);
  document.getElementById('submit-btn').addEventListener('click', submitEntry);
  document.getElementById('mic-btn').addEventListener('click', toggleRecording);
  document.querySelector('.btn-secondary').addEventListener('click', clearEntry);
  document.getElementById('setup-overlay').addEventListener('click', function(e) {
    if (e.target === document.getElementById('setup-overlay')) {
      var s = getSettings();
      if (s.username && s.token) closeSettings();
    }
  });
  document.getElementById('entry-text').addEventListener('input', updateCharCount);

  // Show setup if not configured
  if (!settings.username || !settings.token) {
    document.getElementById('gh-username').value = settings.username || 'dhiyanshiai';
    document.getElementById('gh-repo').value     = settings.repo || 'autobiography-saurav';
    document.getElementById('gh-token').value    = settings.token || '';
    document.getElementById('setup-overlay').classList.remove('hidden');
  }

  // Pre-fill from URL params (for Siri Shortcut integration)
  var params  = new URLSearchParams(window.location.search);
  var urlText = params.get('text');
  var urlChap = params.get('chapter');

  if (urlText) {
    document.getElementById('entry-text').value = urlText;
    updateCharCount();
  }
  if (urlChap && CHAPTERS[urlChap]) {
    document.getElementById('chapter-select').value = urlChap;
  }

  renderRecentEntries();
}

// Script is at bottom of body so DOM is already ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
