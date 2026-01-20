#!/bin/bash

# HorarioCentros - Localhost Setup Script
# This script sets up everything needed to run the app locally

set -e

echo "🚀 Setting up HorarioCentros for localhost..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install
echo ""

# Setup server
echo "🔧 Setting up server..."
cd server

if [ ! -f .env ]; then
    echo "📝 Creating server .env file from template..."
    cp .env.example .env
    echo "✅ Server .env created"
else
    echo "✅ Server .env already exists"
fi

echo "📦 Installing server dependencies..."
npm install
cd ..
echo ""

# Setup client
echo "🎨 Setting up client..."
cd client

if [ ! -f .env ]; then
    echo "📝 Creating client .env file from template..."
    cp .env.example .env
    echo "✅ Client .env created"
else
    echo "✅ Client .env already exists"
fi

echo "📦 Installing client dependencies..."
npm install
cd ..
echo ""

echo "✨ Setup complete!"
echo ""
echo "📚 Next steps:"
echo ""
echo "   1. Start the development server:"
echo "      npm run dev"
echo ""
echo "   2. Open your browser:"
echo "      - Frontend: http://localhost:5173"
echo "      - Backend API: http://localhost:3000"
echo ""
echo "   3. Default credentials (after registration):"
echo "      - Admin role will be assigned to first user"
echo ""
echo "💡 Useful commands:"
echo "   - npm run dev           # Run both client and server"
echo "   - npm run client:dev    # Run only client"
echo "   - npm run server:dev    # Run only server"
echo "   - npm run build         # Build for production"
echo "   - npm test              # Run tests"
echo ""
echo "📖 For more details, see QUICKSTART.md"
echo ""
