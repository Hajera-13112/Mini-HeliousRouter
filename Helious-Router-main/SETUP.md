# 🛠️ Technical Setup Guide

This guide provides step-by-step instructions to get the **Helious Router** project up and running on both macOS and Windows.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

---

## 🍏 Setup for macOS

### 1. Clone the Repository
Open your terminal and run:
```bash
git clone https://github.com/SonuSuraj1807/Helious-Router.git
cd Helious-Router
```

### 2. Install Dependencies
Install dependencies for both backend and frontend:
```bash
# Install Backend dependencies
cd backend && npm install

# Install Frontend dependencies
cd ../frontend && npm install
cd ..
```

### 3. Environment Configuration
Create a `.env` file in the `backend/` directory:
```bash
touch backend/.env
```
Open `backend/.env` in your editor and add your API keys:
```env
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key
PORT=5001
```

### 4. Run the Project
Open two terminal windows/tabs:

**Terminal 1 (Backend):**
```bash
cd backend
node server.js
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

---

## 🪟 Setup for Windows

### 1. Clone the Repository
Open Command Prompt or PowerShell and run:
```powershell
git clone https://github.com/SonuSuraj1807/Helious-Router.git
cd Helious-Router
```

### 2. Install Dependencies
```powershell
# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install
cd ..
```

### 3. Environment Configuration
Run the following commands to create and configure the `.env` file:

```powershell
# Create the .env file
New-Item -Path "backend\.env" -ItemType File

# Add the required variables (Replace with your actual keys)
Add-Content -Path "backend\.env" -Value "GEMINI_API_KEY=your_gemini_key"
Add-Content -Path "backend\.env" -Value "OPENAI_API_KEY=your_openai_key"
Add-Content -Path "backend\.env" -Value "GROQ_API_KEY=your_groq_key"
Add-Content -Path "backend\.env" -Value "PORT=5001"
```

*Alternatively, you can open `backend\.env` in Notepad and paste the keys manually.*

### 4. Run the Project
Open two separate command prompt or PowerShell windows:

**Window 1 (Backend):**
```powershell
cd backend
node server.js
```

**Window 2 (Frontend):**
```powershell
cd frontend
npm run dev
```

---

## 🔍 Troubleshooting

- **Port 5001 Busy**: If you see an error that port 5001 is already in use, you can change the `PORT` in your `.env` file.
- **Node Modules Errors**: If installation fails, try deleting the `node_modules` folder and `package-lock.json`, then run `npm install` again.
- **API Key Failures**: Ensure your API keys are valid and have sufficient quota/credits.
