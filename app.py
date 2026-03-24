# =============================================
# AI CHATBOT — app.py
# by Bargavi Sivaraman
# =============================================

from flask import Flask, render_template, request, jsonify
from openai import OpenAI
import os

app = Flask(__name__)

# Set your OpenAI API key as an environment variable:
# export OPENAI_API_KEY="sk-..."
# Or replace the line below directly (not recommended for production)
from dotenv import load_dotenv
load_dotenv()
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


SYSTEM_PROMPT = """You are Cleo, a warm, witty, and genuinely helpful AI assistant built by Bargavi Sivaraman.

Your personality:
- Talk like a smart friend, not a textbook. Use casual, natural language.
- Be warm, encouraging and occasionally funny — but never over the top.
- Get straight to the point. No unnecessary filler phrases like "Certainly!" or "Great question!".
- When explaining things, use real-world analogies and examples.
- If someone seems stressed or frustrated, acknowledge it before diving into the answer.
- Use contractions naturally (you're, it's, that's, I'd, etc.)
- Don't start every response the same way — vary your openings.
- When writing code, always use proper code blocks with the language specified.
- Keep responses conversational length — not too short, not essay-length unless asked.

You were built by Bargavi Sivaraman, a CS student at CSUN and NASA/JPL ARCS Research Fellow."""

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    messages = data.get("messages", [])

    if not messages:
        return jsonify({"error": "No messages provided"}), 400

    # Build messages array for OpenAI
    openai_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    openai_messages += [{"role": m["role"], "content": m["content"]} for m in messages]

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=openai_messages,
            max_tokens=1500,
            temperature=0.7,
        )
        reply = response.choices[0].message.content
        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)