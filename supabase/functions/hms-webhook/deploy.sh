#!/bin/bash

# HMS Webhook Edge Function Deployment Script
# This script deploys the HMS webhook function to Supabase

set -e

echo "🚀 Deploying HMS Webhook Edge Function..."

# Check if we're in the right directory
if [ ! -f "index.ts" ]; then
    echo "❌ Error: index.ts not found. Make sure you're in the hms-webhook function directory."
    exit 1
fi

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "../../supabase/config.toml" ]; then
    echo "❌ Error: Not in a Supabase project. Please run this from your project root."
    exit 1
fi

echo "📦 Deploying function..."
supabase functions deploy hms-webhook --no-verify-jwt

echo "✅ Function deployed successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Set environment variables:"
echo "   supabase secrets set SUPABASE_URL=https://your-project.supabase.co"
echo "   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
echo "   supabase secrets set HMS_WEBHOOK_SECRET=your_100ms_webhook_secret"
echo ""
echo "2. Get your function URL:"
echo "   supabase functions list"
echo ""
echo "3. Configure webhook in 100ms dashboard pointing to:"
echo "   https://your-project.supabase.co/functions/v1/hms-webhook"
echo ""
echo "4. Test the webhook with 100ms test event"
echo ""
echo "📚 See README.md for detailed configuration instructions"
