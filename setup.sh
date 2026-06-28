#!/bin/bash
# SVG Studio - One-time Setup Script
# This sets up the database and installs dependencies

echo "🎨 SVG Studio Setup"
echo "==================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    echo "Download the LTS version and run this script again."
    exit 1
fi

echo "✅ Node.js found: $(node -v)"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Setup database
echo "🗄️  Setting up database..."
npm run db:migrate
npm run db:seed

if [ $? -ne 0 ]; then
    echo "❌ Failed to setup database"
    exit 1
fi

echo "✅ Database ready with 80 SVG shapes"
echo ""

echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Double-click 'start-server.command' to start the backend"
echo "2. Open Figma Desktop App"
echo "3. Go to: Plugins → Development → Import plugin from manifest"
echo "4. Select the 'manifest.json' file from this folder"
echo "5. Run SVG Studio from Plugins menu"
echo ""
