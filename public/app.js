const form = document.getElementById('chatForm');
const input = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messagesEl = document.getElementById('messages');
const welcome = document.getElementById('welcome');
let history = [];

function addMessage(role, text, error = false) {
  const row = document.createElement('div');
  row.className = `message ${role}`;
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = role === 'assistant' ? '✦' : 'AS';
  const bubble = document.createElement('div');
  bubble.className = 'bubble' + (error ? ' error' : '');
  bubble.textContent = text;
  if (role === 'user') { row.append(bubble, avatar); }
  else { row.append(avatar, bubble); }
  messagesEl.append(row);
  row.scrollIntoView({ behavior: 'smooth', block: 'end' });
  return bubble;
}
function resizeInput() { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 140) + 'px'; }
input.addEventListener('input', resizeInput);
input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });

async function sendMessage(text) {
  const trimmed = text.trim();
  if (!trimmed || sendButton.disabled) return;
  welcome.hidden = true;
  addMessage('user', trimmed);
  history.push({ role: 'user', content: trimmed });
  input.value = '';
  resizeInput();
  sendButton.disabled = true;
  const typing = addMessage('assistant', 'Thinking…');
  typing.classList.add('typing');
  try {
    const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }) });
    const data = await response.json();
    typing.parentElement.remove();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    history.push({ role: 'assistant', content: data.reply });
    addMessage('assistant', data.reply);
  } catch (err) {
    typing.parentElement.remove();
    addMessage('assistant', err.message || 'Something went wrong. Please try again.', true);
    history.pop();
  } finally { sendButton.disabled = false; input.focus(); }
}
form.addEventListener('submit', (e) => { e.preventDefault(); sendMessage(input.value); });
document.querySelectorAll('[data-prompt]').forEach((button) => button.addEventListener('click', () => sendMessage(button.dataset.prompt)));
function resetChat() { history = []; messagesEl.innerHTML = ''; welcome.hidden = false; input.value = ''; resizeInput(); input.focus(); }
document.getElementById('newChat').addEventListener('click', resetChat);
document.getElementById('clearChat').addEventListener('click', resetChat);
