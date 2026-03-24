# 🤖 Bargavi AI — ChatGPT Powered Chatbot

A full-stack AI chatbot built with Flask + OpenAI GPT-3.5, featuring a Lovable-inspired UI.

## features

- 💬 **Multiple Chat Sessions** — create, switch & delete chats
- 💾 **Chat History** — saved in localStorage, persists on refresh
- ✍️ **Typing Indicator** — animated dots while AI is thinking
- 📋 **Copy Button** — copy any message or code block
- 🎨 **Code Highlighting** — syntax highlighting via highlight.js
- 🌈 **Lovable Theme** — purple/violet gradients, dark bg
- 📱 **Responsive** — works on mobile with sidebar toggle

## project structure

```
ai-chatbot/
├── app.py              ← Flask backend + OpenAI API
├── requirements.txt    ← Python dependencies
├── README.md
├── templates/
│   └── index.html      ← HTML structure
└── static/
    ├── style.css       ← Lovable theme styles
    └── script.js       ← Chat logic, sessions, formatting
```

## setup & run

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set your OpenAI API key
export OPENAI_API_KEY="sk-your-key-here"

# 3. Run the app
python app.py

# 4. Open browser
# http://localhost:5000
```

## get your OpenAI API key

1. Go to platform.openai.com
2. Sign up / log in
3. Go to API Keys → Create new secret key
4. Copy and set as environment variable

## tech stack

- Python 3 + Flask (backend)
- OpenAI GPT-3.5 Turbo API
- Vanilla JavaScript (frontend)
- highlight.js (code syntax highlighting)
- localStorage (chat persistence)

---

built by [Bargavi Sivaraman](https://bargavi-codes.netlify.app) — CS @ CSUN & NASA/JPL ARCS Fellow
