#!/bin/bash
# SVG Studio - Start Server
# Double-click this file to start the backend server

cd "$(dirname "$0")"

echo "🚀 Starting SVG Studio Backend..."
echo ""
echo "Keep this window open while using the plugin!"
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
