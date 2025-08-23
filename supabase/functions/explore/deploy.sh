#!/bin/bash

# Deploy the explore edge function
# This script deploys the explore function as a public endpoint

echo "🚀 Deploying explore edge function..."

# Deploy the function (public, no JWT verification required)
supabase functions deploy explore --no-verify-jwt

echo "✅ Explore function deployed successfully!"
echo ""
echo "📋 Function details:"
echo "   - URL: https://<project-ref>.functions.supabase.co/explore"
echo "   - Public access: Yes (no authentication required)"
echo "   - Methods: GET, OPTIONS"
echo ""
echo "🧪 Test the function:"
echo "   curl 'https://<project-ref>.functions.supabase.co/explore?sort=featured'"
echo ""
echo "⚠️  Remember to set these environment variables in Supabase Dashboard:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_ANON_KEY"
