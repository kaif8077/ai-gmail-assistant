# 🤖 AI Gmail Assistant

AI-powered Chrome extension that helps users generate smart email replies and summaries directly inside Gmail.

---

## 🚀 Features

- ✉️ Generate AI-based replies (Professional, Friendly, Short)
- 🧠 Summarize long emails
- 🌍 Multi-language support (English, Hindi, Hinglish)
- ⚡ Quick reply suggestions
- ✍️ Editable reply before sending

---

## 🛠️ Tech Stack

- Frontend: React.js, Tailwind CSS  
- Backend: Node.js, Express.js  
- AI: OpenAI API  
- Platform: Chrome Extension APIs  

---

## 📦 Installation

### 1. Clone the repository
```bash
git clone https://github.com/kaif8077/ai-gmail-assistant.git
cd ai-gmail-assistant




### 2. Setup Backend
```
cd backend
npm install

Create .env file:

OPENAI_API_KEY=your_api_key_here
PORT=5000

Start backend:

node src/server.js
3. Setup Extension
cd ../extension
npm install
npm run build
4. Load in Chrome
Open chrome://extensions/
Enable Developer Mode
Click Load unpacked
Select extension/build
🚀 Usage
Open Gmail
Open any email
Click extension icon
Generate reply or summary
📁 Structure
ai-gmail-assistant/
├── extension/
├── backend/
└── README.md
