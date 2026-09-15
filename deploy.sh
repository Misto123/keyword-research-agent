#!/bin/bash

echo "🚀 Deploying Keyword Research Agent to Vercel"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if logged in
echo "📝 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "🔑 Please log in to Vercel:"
    vercel login
fi

echo ""
echo "📋 Required Environment Variables:"
echo ""
echo "Choose your setup:"
echo ""
echo "Option 1: llmsrelay + DataForSEO (Recommended)"
echo "  - LLMSRELAY_API_KEY"
echo "  - LLMSRELAY_BASE_URL"
echo "  - DATAFORSEO_LOGIN"
echo "  - DATAFORSEO_PASSWORD"
echo ""
echo "Option 2: llmsrelay + Serper (Budget)"
echo "  - LLMSRELAY_API_KEY"
echo "  - LLMSRELAY_BASE_URL"
echo "  - SERPER_API_KEY"
echo ""
read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel..."
echo ""

vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Go to your Vercel dashboard"
echo "2. Navigate to Settings → Environment Variables"
echo "3. Add the required API keys (see API_CHECKLIST.md)"
echo "4. Redeploy to activate environment variables"
echo ""
echo "Or use the CLI:"
echo "  vercel env add LLMSRELAY_API_KEY"
echo "  vercel env add LLMSRELAY_BASE_URL"
echo "  vercel env add DATAFORSEO_LOGIN"
echo "  vercel env add DATAFORSEO_PASSWORD"
echo ""
