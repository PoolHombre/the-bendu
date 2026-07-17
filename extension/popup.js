const $ = (s) => document.getElementById(s);

const authView = $('auth-view');
const mainView = $('main-view');
const authForm = $('auth-form');
const authError = $('auth-error');
const authBtn = $('auth-btn');
const claimInput = $('claim-input');
const assessBtn = $('assess-btn');
const resultCard = $('result-card');
const loading = $('loading');

let session = null;
let apiBase = '';

init();

async function init() {
  const data = await chrome.storage.local.get(['session', 'apiBase', 'pendingText', 'selectedText']);

  if (data.session && data.apiBase) {
    session = data.session;
    apiBase = data.apiBase;
    showMain();

    const text = data.pendingText || data.selectedText || '';
    if (text) {
      claimInput.value = text;
      chrome.storage.local.remove(['pendingText', 'selectedText']);
    }
  } else {
    showAuth();
    if (data.apiBase) $('api-base').value = data.apiBase;
  }
}

function showAuth() {
  authView.hidden = false;
  mainView.hidden = true;
}

function showMain() {
  authView.hidden = true;
  mainView.hidden = false;
}

// Auth
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.hidden = true;
  authBtn.disabled = true;
  authBtn.textContent = '...';

  apiBase = $('api-base').value.replace(/\/$/, '');
  const email = $('email').value;
  const password = $('password').value;

  try {
    const res = await fetch(`${apiBase}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': await getAnonKey(apiBase),
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error_description || err.msg || `Auth failed (${res.status})`);
    }

    const data = await res.json();
    session = {
      access_token: data.access_token,
      user: data.user,
    };

    await chrome.storage.local.set({ session, apiBase });
    showMain();
  } catch (err) {
    authError.textContent = err.message;
    authError.hidden = false;
  }

  authBtn.disabled = false;
  authBtn.textContent = 'Sign In';
});

async function getAnonKey(base) {
  const stored = await chrome.storage.local.get('anonKey');
  if (stored.anonKey) return stored.anonKey;

  const key = prompt('Enter your Supabase anon key:');
  if (key) await chrome.storage.local.set({ anonKey: key });
  return key || '';
}

// Sign out
$('sign-out').addEventListener('click', async () => {
  session = null;
  await chrome.storage.local.remove(['session']);
  showAuth();
});

// Assess
assessBtn.addEventListener('click', async () => {
  const text = claimInput.value.trim();
  if (!text || !session) return;

  assessBtn.disabled = true;
  resultCard.hidden = true;
  loading.hidden = false;

  try {
    const result = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'evaluate', apiBase, userId: session.user.id, postText: text },
        (res) => {
          if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
          if (res.error) return reject(new Error(res.error));
          resolve(res);
        }
      );
    });

    renderResult(result);
  } catch (err) {
    authError.textContent = err.message;
    authError.hidden = false;
  }

  loading.hidden = true;
  assessBtn.disabled = false;
});

function renderResult(r) {
  $('result-score').textContent = `${r.score}/100`;
  $('result-dot').style.background = r.color_hex;
  $('result-explanation').textContent = r.explanation;

  const list = $('result-components');
  list.innerHTML = '';

  for (const [key, val] of Object.entries(r.components)) {
    const row = document.createElement('div');
    row.className = 'component-row';
    row.innerHTML = `
      <span class="component-name">${key}</span>
      <span class="component-val">${val}/20</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${(val / 20) * 100}%;background:${r.color_hex}"></div>
      </div>
    `;
    list.appendChild(row);
  }

  resultCard.hidden = false;
}
