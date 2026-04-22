<div align="center">

# 🌌 Helious Router v2.0
### *The Ultimate Intelligent Multi-Model LLM Gateway*

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)]()

---

**Helious Router** is a high-performance, aesthetic AI routing layer that bridges the gap between different LLM providers. Seamlessly switch between Gemini, OpenAI, and Groq while maintaining a consistent and beautiful user experience. 

[Explore Features](#-key-features) • [Tech Stack](#-tech-stack) • [Technical Setup Guide](SETUP.md) • [Structure](#-project-structure)

</div>

## 🚀 Key Features

- ⚡ **Intelligent Routing**: Automatically switch between **Gemini**, **GPT-4o**, and **Llama 3** based on availability and logic.
- 🎨 **Premium UI/UX**: A dark-themed, cyber-aesthetic interface built with **Framer Motion** for smooth transitions and **Lucide React** for iconic clarity.
- 🛠️ **Real-time Diagnostics**: Integrated HUD log panel to monitor API status and router decisions in real-time.
- 💾 **Session Persistence**: Robust session management allowing you to create, rename, and manage multiple parallel conversations.
- 📡 **Universal Compatibility**: Unified API wrapper for standardizing responses across diverse LLM providers.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Cyber-HUD Vanilla CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Engine**: Node.js / Express
- **AI SDKs**: Google Generative AI, OpenAI, Groq SDK
- **Environment**: Dotenv for secure key management

## 🏁 Quick Start

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/SonuSuraj1807/Helious-Router.git
cd Helious-Router

# Install Backend deps
cd backend && npm install

# Install Frontend deps
cd ../frontend && npm install
```

### 2. Configuration
Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
PORT=5001
```

### 3. Launch
```bash
# Terminal 1: Start Backend
cd backend && node server.js

# Terminal 2: Start Frontend
cd frontend && npm run dev
```

## 📂 Project Structure

```bash
Helious-Router/
├── 🌐 backend/          # Node.js Express Server
│   ├── 📂 data/         # Persistent store (conversations.json)
│   ├── 📄 server.js     # Router Logic & API Gateway
│   └── 📄 diagnose.js   # API Health Checkers
├── 💻 frontend/         # React Client
│   ├── 📂 src/          # Source Code (App.jsx, index.css)
│   └── 📂 public/       # Aesthetic Assets & Diagrams
└── 📜 README.md         # Documentation
```

---

## 📊 Repository Stats

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=SonuSuraj1807&show_icons=true&theme=tokyonight&hide_border=true&count_private=true" alt="Sonu's GitHub Stats" />
  <br/>
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=SonuSuraj1807&layout=compact&theme=tokyonight&hide_border=true&langs_count=6" alt="Top Languages" />
</p>

---

<div align="center">
Built with ❤️ by <a href="https://github.com/SonuSuraj1807">Sonu Suraj</a>
</div>
