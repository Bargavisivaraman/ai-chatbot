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
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "YOUR_OPENAI_API_KEY_HERE"))

SYSTEM_PROMPT = """You are a helpful, friendly, and intelligent AI assistant.
You give clear, concise answers. When writing code, always use proper formatting with code blocks.
You are built by Bargavi Sivaraman as a portfolio project."""

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
    app.run(debug=True, port=5000)
