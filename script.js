// =============================================
// AI CHATBOT — script.js
// by Bargavi Sivaraman
// =============================================

// ── STATE ──
let sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
let activeSession = null;
let isLoading = false;

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  renderSessions();
  if (sessions.length > 0) {
    loadSession(sessions[0].id);
  }
});

// ── SESSION MANAGEMENT ──
function newChat() {
  const session = {
    id: Date.now(),
    name: 'New Chat',
    messages: [],
    createdAt: new Date().toISOString()
  };
  sessions.unshift(session);
  saveSessions();
  loadSession(session.id);
}

function loadSession(id) {
  activeSession = sessions.find(s => s.id === id);
  if (!activeSession) return;
  document.getElementById('topbarTitle').textContent = activeSession.name;
  renderMessages();
  renderSessions();
  // show/hide welcome
  const hasMessages = activeSession.messages.length > 0;
  document.getElementById('welcome').style.display = hasMessages ? 'none' : 'flex';
  document.getElementById('messages').style.display = hasMessages ? 'flex' : 'none';
  scrollToBottom();
}

function deleteSession(id, e) {
  e.stopPropagation();
  sessions = sessions.filter(s => s.id !== id);
  saveSessions();
  if (activeSession && activeSession.id === id) {
    activeSession = null;
    document.getElementById('messages').innerHTML = '';
    document.getElementById('welcome').style.display = 'flex';
    document.getElementById('messages').style.display = 'none';
    document.getElementById('topbarTitle').textContent = 'New Chat';
  }
  renderSessions();
}

function renderSessions() {
  const list = document.getElementById('sessionsList');
  if (!sessions.length) {
    list.innerHTML = '<div class="sessions-empty">// no chats yet</div>';
    return;
  }
  list.innerHTML = sessions.map(s => `
    <div class="session-item ${activeSession && activeSession.id === s.id ? 'active' : ''}"
         onclick="loadSession(${s.id})">
      <span class="session-name">${esc(s.name)}</span>
      <button class="session-del" onclick="deleteSession(${s.id}, event)">✕</button>
    </div>
  `).join('');
}

// ── MESSAGING ──
async function sendMessage() {
  if (isLoading) return;
  const input = document.getElementById('msgInput');
  const text = input.value.trim();
  if (!text) return;

  // create session if none
  if (!activeSession) newChat();

  // hide welcome, show messages
  document.getElementById('welcome').style.display = 'none';
  document.getElementById('messages').style.display = 'flex';

  // add user message
  const userMsg = { role: 'user', content: text, time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) };
  activeSession.messages.push(userMsg);
  input.value = '';
  input.style.height = 'auto';

  // update session name from first message
  if (activeSession.messages.length === 1) {
    activeSession.name = text.slice(0, 36) + (text.length > 36 ? '...' : '');
    document.getElementById('topbarTitle').textContent = activeSession.name;
  }

  renderMessages();
  showTyping();
  setLoading(true);

  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: activeSession.messages.map(m => ({ role: m.role, content: m.content })) })
    });
    const data = await res.json();
    hideTyping();

    if (data.error) {
      showToast('⚠ ' + data.error);
      return;
    }

    const aiMsg = { role: 'assistant', content: data.reply, time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) };
    activeSession.messages.push(aiMsg);
    saveSessions();
    renderMessages();
    renderSessions();
    scrollToBottom();

  } catch (err) {
    hideTyping();
    showToast('⚠ Connection error. Is the server running?');
  } finally {
    setLoading(false);
  }
}

function sendSuggestion(btn) {
  document.getElementById('msgInput').value = btn.textContent.replace(/[🤖🐍⚛️🐛]/g,'').trim();
  sendMessage();
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 160) + 'px';
}

// ── RENDER MESSAGES ──
function renderMessages() {
  if (!activeSession) return;
  const box = document.getElementById('messages');
  box.innerHTML = '';
  activeSession.messages.forEach(msg => {
    const wrap = document.createElement('div');
    wrap.className = `msg-wrap ${msg.role === 'user' ? 'user' : 'ai'}`;
    const avatar = msg.role === 'user' ? '👤' : '✦';
    const content = msg.role === 'assistant' ? formatAI(msg.content) : `<p>${esc(msg.content)}</p>`;
    wrap.innerHTML = `
      <div class="msg-avatar">${avatar}</div>
      <div class="msg-content">
        <div class="msg-bubble">${content}</div>
        <div class="msg-actions">
          <button class="msg-action-btn" onclick="copyMsg(this, \`${escAttr(msg.content)}\`)">copy</button>
        </div>
        <div class="msg-time">${msg.time || ''}</div>
      </div>
    `;
    box.appendChild(wrap);
  });

  // syntax highlight all code blocks
  box.querySelectorAll('pre code').forEach(el => { hljs.highlightElement(el); });
  scrollToBottom();
}

// ── FORMAT AI RESPONSE ──
function formatAI(text) {
  // code blocks with language
  text = text.replace(/```(\w*)?\n?([\s\S]*?)```/g, (_, lang, code) => {
    const l = lang || 'plaintext';
    return `<pre><div class="code-header"><span class="code-lang">${l}</span><button class="copy-code-btn" onclick="copyCode(this)">copy</button></div><code class="language-${l}">${escHtml(code.trim())}</code></pre>`;
  });
  // inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  // bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // headers
  text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  // unordered lists
  text = text.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>\n?)+/g, s => `<ul>${s}</ul>`);
  // numbered lists
  text = text.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  // paragraphs
  text = text.split('\n\n').map(p => p.trim() ? (p.startsWith('<') ? p : `<p>${p}</p>`) : '').join('');
  return text;
}

// ── TYPING INDICATOR ──
function showTyping() {
  const area = document.getElementById('chatArea');
  const typing = document.createElement('div');
  typing.className = 'typing-wrap';
  typing.id = 'typingIndicator';
  typing.innerHTML = `
    <div class="msg-avatar" style="background:linear-gradient(135deg,rgba(139,92,246,0.2),rgba(236,72,153,0.15));border:1px solid rgba(139,92,246,0.2)">✦</div>
    <div class="typing-bubble">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  area.appendChild(typing);
  scrollToBottom();
}

function hideTyping() {
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

// ── COPY ──
function copyMsg(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'copied!';
    setTimeout(() => btn.textContent = 'copy', 2000);
    showToast('✓ copied to clipboard');
  });
}

function copyCode(btn) {
  const code = btn.closest('pre').querySelector('code').innerText;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = 'copied!';
    setTimeout(() => btn.textContent = 'copy', 2000);
    showToast('✓ code copied');
  });
}

// ── HELPERS ──
function setLoading(v) {
  isLoading = v;
  document.getElementById('sendBtn').disabled = v;
}

function scrollToBottom() {
  const area = document.getElementById('chatArea');
  setTimeout(() => { area.scrollTop = area.scrollHeight; }, 50);
}

function saveSessions() {
  localStorage.setItem('chat_sessions', JSON.stringify(sessions));
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast'; t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escAttr(s) { return s.replace(/`/g,"'").replace(/\\/g,'\\\\'); }
