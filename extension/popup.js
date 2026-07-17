const $ = (s) => document.getElementById(s);

const SUPABASE_URL = 'https://bgvfuuylrahzkylzztwf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJndmZ1dXlscmFoemt5bHp6dHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNTczODgsImV4cCI6MjA5OTgzMzM4OH0.fAZEoBgY8UN7Kj_1bmBQioSSi2MGo99lXNhAFgEeRmk';
const API_BASE = 'https://the-bendu.vercel.app';

const authView = $('auth-view');
const mainView = $('main-view');
const authForm = $('auth-form');
const authError = $('auth-error');
const authBtn = $('auth-btn');
const authToggle = $('auth-toggle');
const claimInput = $('claim-input');
const assessBtn = $('assess-btn');
const resultCard = $('result-card');
const loading = $('loading');

let session = null;
let isSignUp = false;

init();

async function init() {
  const data = await chrome.storage.local.get(['session', 'pendingText', 'selectedText']);

  if (data.session) {
    session = data.session;
    showMain();

    const text = data.pendingText || data.selectedText || '';
    if (text) {
      claimInput.value = text;
      chrome.storage.local.remove(['pendingText', 'selectedText']);
    }
  } else {
    showAuth();
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

// Auth toggle
authToggle.addEventListener('click', () => {
  isSignUp = !isSignUp;
  authBtn.textContent = isSignUp ? 'Sign Up' : 'Sign In';
  authToggle.textContent = isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up';
});

// Auth
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.hidden = true;
  authBtn.disabled = true;
  authBtn.textContent = '...';

  const email = $('email').value;
  const password = $('password').value;

  try {
    const endpoint = isSignUp
      ? `${SUPABASE_URL}/auth/v1/signup`
      : `${SUPABASE_URL}/auth/v1/token?grant_type=password`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error_description || err.msg || `Auth failed (${res.status})`);
    }

    const data = await res.json();
    if (!data.access_token) {
      throw new Error('Check your email to confirm your account, then sign in.');
    }

    session = {
      access_token: data.access_token,
      user: data.user,
    };

    await chrome.storage.local.set({ session });
    showMain();
  } catch (err) {
    authError.textContent = err.message;
    authError.hidden = false;
  }

  authBtn.disabled = false;
  authBtn.textContent = isSignUp ? 'Sign Up' : 'Sign In';
});

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
  authError.hidden = true;

  try {
    const res = await fetch(`${API_BASE}/api/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: session.user.id, post_text: text }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `API error (${res.status})`);
    }

    const result = await res.json();
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
