#!/bin/bash

# MIRASENS Chatbot Server Startup Script

echo "🚀 Starting MIRASENS Chatbot Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to chatbot server directory
cd "$(dirname "$0")"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your Gemini API key:"
    echo "   GEMINI_API_KEY=your_actual_api_key_here"
    echo ""
    read -p "Press Enter after updating .env file..."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if Gemini API key is set
if grep -q "your_gemini_api_key_here" .env; then
    echo "❌ Please update GEMINI_API_KEY in .env file with your actual API key"
    exit 1
fi

# Start the server
echo "✅ Starting server..."
echo "🌐 Server will be available at: http://localhost:3001"
echo "💬 Test endpoint: http://localhost:3001/api/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
