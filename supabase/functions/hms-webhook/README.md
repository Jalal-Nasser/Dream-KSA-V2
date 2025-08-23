# HMS Webhook Edge Function

This Supabase Edge Function handles 100ms webhook events to maintain real-time room statistics and trending scores.

## Features

- **Real-time Updates**: Processes 100ms webhook events for room activity
- **Participant Tracking**: Maintains accurate listener and speaker counts
- **Trending Score**: Calculates dynamic trending scores with recency decay
- **Security**: Verifies HMAC signatures from 100ms
- **Error Handling**: Robust error handling and logging

## Supported Events

- `room.started` - Sets room as live
- `room.ended` - Sets room as offline, resets participant counts
- `peer.joined` - Increments participant counts based on role
- `peer.left` - Decrements participant counts based on role
- `track.updated` - Updates last activity and recalculates trending

## Trending Score Formula

```
Base Score = (listeners × 1) + (speakers × 3) + (featured ? 5 : 0)
Final Score = Base Score × (0.5 ^ (hours_since_active / 6))
```

- **Listener Weight**: 1 point per listener
- **Speaker Weight**: 3 points per speaker  
- **Featured Bonus**: +5 points for featured rooms
- **Recency Decay**: Half-life of 6 hours

## Configuration

### Environment Variables

Set these in your Supabase project dashboard:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
HMS_WEBHOOK_SECRET=your_100ms_webhook_secret
```

### Database Schema

Ensure your `rooms` table has these columns:

```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hms_room_id TEXT UNIQUE NOT NULL,
  is_live BOOLEAN DEFAULT false,
  listener_count INTEGER DEFAULT 0,
  speaker_count INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  trending_score NUMERIC(10,2) DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  -- ... other columns
);
```

## Deployment

### 1. Deploy the Function

```bash
# Navigate to your Supabase project directory
cd your-project

# Deploy the function (no JWT verification needed for webhooks)
supabase functions deploy hms-webhook --no-verify-jwt
```

### 2. Set Environment Variables

```bash
# Set required environment variables
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
supabase secrets set HMS_WEBHOOK_SECRET=your_100ms_webhook_secret
```

### 3. Get Function URL

```bash
# Get the function URL
supabase functions list
```

The function will be available at:
`https://your-project.supabase.co/functions/v1/hms-webhook`

## 100ms Dashboard Configuration

### 1. Add Webhook URL

In your 100ms dashboard:

1. Go to **Developer Tools** → **Webhooks**
2. Click **Add Webhook**
3. Set URL: `https://your-project.supabase.co/functions/v1/hms-webhook`
4. Select events: `room.started`, `room.ended`, `peer.joined`, `peer.left`, `track.updated`

### 2. Set Webhook Secret

1. Generate a secure random string (32+ characters)
2. Set this as your webhook secret in 100ms
3. Use the same value for `HMS_WEBHOOK_SECRET` environment variable

### 3. Test Webhook

100ms will send a test webhook to verify the endpoint is working.

## Monitoring

### Function Logs

View function logs in Supabase dashboard:

```bash
supabase functions logs hms-webhook
```

### Database Monitoring

Monitor room statistics updates:

```sql
-- Check recent room activity
SELECT 
  hms_room_id,
  is_live,
  listener_count,
  speaker_count,
  trending_score,
  last_active_at
FROM rooms 
ORDER BY last_active_at DESC 
LIMIT 10;
```

## Security Considerations

- **Service Role Key**: Uses service role for database access (bypasses RLS)
- **HMAC Verification**: Verifies webhook signatures from 100ms
- **Input Validation**: Validates all incoming webhook payloads
- **Error Handling**: Graceful error handling without exposing internals

## Troubleshooting

### Common Issues

1. **Room Not Found**: Ensure `hms_room_id` exists in your rooms table
2. **Permission Denied**: Verify service role key has proper permissions
3. **Invalid Signature**: Check webhook secret matches between 100ms and Supabase
4. **Function Timeout**: Webhook processing should complete within 10 seconds

### Debug Mode

Enable detailed logging by setting:

```bash
supabase secrets set SUPABASE_DEBUG=true
```

## Performance

- **Response Time**: Typically < 100ms for webhook processing
- **Database Updates**: Single query per webhook event
- **Scalability**: Handles multiple concurrent webhooks efficiently
- **Memory Usage**: Minimal memory footprint per request
