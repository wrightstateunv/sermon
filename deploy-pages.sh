#!/bin/bash

echo "🌐 Deploying to Cloudflare Pages..."
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler..."
    npm install -g wrangler
fi

# Login to Cloudflare (if not already)
wrangler login

# Deploy to Pages
echo "📤 Deploying sermon app to Cloudflare Pages..."
wrangler pages deploy . --project-name sermon-app

echo ""
echo "✅ Pages deployment complete!"
echo ""
echo "📋 Your sermon app is now live at:"
echo "   https://sermon-app.pages.dev"
echo ""
echo "💡 Usage:"
echo "   Church Laptop (Display): https://sermon-app.pages.dev"
echo "   Your iPad (Remote):      https://sermon-app.pages.dev?remote"
echo ""
echo "🔒 Security: Both devices must use the same session token (already configured)"
echo ""
