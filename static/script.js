const messagesEl = document.getElementById('messages');
const inputEl    = document.getElementById('msg-input');
const errorEl    = document.getElementById('error-msg');

inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
});

function appendBubble(text, type) {
    const div = document.createElement('div');
    div.className = `bubble ${type}`;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendMessage() {
    const msg = inputEl.value.trim();
    if (!msg) return;

    errorEl.textContent = '';
    appendBubble(msg, 'user');
    inputEl.value = '';
    inputEl.focus();

    try {
        const res = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        appendBubble(data.answer, 'bot');
    } catch {
        errorEl.textContent = 'Something went wrong. Please try again.';
    }
}
