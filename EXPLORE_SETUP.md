# Explore Screen Setup Guide

## Environment Variables

Create a `.env` file in your project root with:

```bash
# Supabase Functions Base URL
# Format: https://your-project-ref.functions.supabase.co
EXPO_PUBLIC_FUNCTIONS_BASE_URL=https://your-project-ref.functions.supabase.co
```

## Required Setup

1. **Deploy the Explore Edge Function**:
   ```bash
   cd supabase/functions/explore
   supabase functions deploy explore --no-verify-jwt
   ```

2. **Set Environment Variables in Supabase**:
   ```bash
   supabase secrets set SUPABASE_URL=https://your-project.supabase.co
   supabase secrets set SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Ensure Database Schema**:
   - The `rooms_public_view` should exist with required columns
   - Run the migration from the HMS webhook function if needed

## Features

- **Tabbed Interface**: Featured, Trending, and Active sorting
- **Real-time Data**: Fetches from the explore edge function
- **Pull-to-Refresh**: Swipe down to refresh room data
- **Room Navigation**: Tap rooms to navigate to voice chat
- **Error Handling**: Graceful error states and retry functionality

## Navigation

The explore screen is already integrated into the main tabs layout at `app/(tabs)/_layout.tsx` and will appear as the second tab with a compass icon.

## Testing

1. Ensure your environment variables are set
2. Deploy the explore edge function
3. Navigate to the Explore tab in your app
4. Test different sort options and pull-to-refresh
