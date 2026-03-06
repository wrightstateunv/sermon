#!/bin/bash

echo "🚀 Deploying Cloudflare Worker Relay..."
echo ""

cd relay

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler..."
    npm install -g wrangler
fi

# Login to Cloudflare (opens browser)
echo "🔑 Logging into Cloudflare..."
wrangler login

# Deploy the worker
echo "📡 Deploying relay worker..."
wrangler deploy

echo ""
echo "✅ Relay deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Copy the worker URL from above (should be: https://sermon-relay.YOURNAME.workers.dev)"
echo "   2. Edit ../index.html and replace 'YOURNAME' in RELAY_URL with your actual subdomain"
echo "   3. Test the relay: curl https://sermon-relay.YOURNAME.workers.dev/status"
echo ""
