#!/bin/bash

# Fashion Design Studio - Startup Script
# Double-click this file to start the application

echo "🎨 Starting Fashion Design Studio..."
echo ""

# Run setup if .env doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Running one-time setup..."
    ./setup.sh
fi

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 First time setup - installing dependencies..."
    echo "This will take a few minutes..."
    npm install
    echo ""
fi

echo "🚀 Starting the application..."
echo ""
echo "✨ Once started, open your web browser and go to:"
echo "   http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

npm run dev
