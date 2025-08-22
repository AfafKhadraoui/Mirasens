@echo off
REM MIRASENS Chatbot Server Startup Script for Windows

echo 🚀 Starting MIRASENS Chatbot Server...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Navigate to chatbot server directory
cd /d "%~dp0"

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found. Creating from template...
    copy .env.example .env
    echo 📝 Please edit .env file with your Gemini API key:
    echo    GEMINI_API_KEY=your_actual_api_key_here
    echo.
    pause
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Check if Gemini API key is set
findstr /C:"your_gemini_api_key_here" .env >nul
if %errorlevel% equ 0 (
    echo ❌ Please update GEMINI_API_KEY in .env file with your actual API key
    pause
    exit /b 1
)

REM Start the server
echo ✅ Starting server...
echo 🌐 Server will be available at: http://localhost:3001
echo 💬 Test endpoint: http://localhost:3001/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
