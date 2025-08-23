# Explore Edge Function

A public Supabase Edge Function that provides access to live rooms from the `rooms_public_view` with server-side sorting options.

## 🚀 Quick Deploy

```bash
# Deploy as public function (no JWT verification required)
supabase functions deploy explore --no-verify-jwt

# Or use the deployment script
chmod +x deploy.sh
./deploy.sh
```

## 📋 Function Details

- **URL**: `https://<project-ref>.functions.supabase.co/explore`
- **Access**: Public (no authentication required)
- **Methods**: GET, OPTIONS
- **Response Format**: JSON with `{ data, error }` structure

## 🔧 Environment Variables

Set these in your Supabase Dashboard under Settings > Edge Functions:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 📡 API Endpoints

### GET /explore

Fetch live rooms with optional sorting.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sort` | string | `featured` | Sort order: `featured`, `trending`, or `active` |

#### Sort Options

1. **`featured`** (default)
   - `featured DESC, trending_score DESC, last_active_at DESC`
   - Prioritizes featured rooms, then by trending score and recency

2. **`trending`**
   - `trending_score DESC, last_active_at DESC`
   - Sorts by trending algorithm score, then by recency

3. **`active`**
   - `listener_count DESC, speaker_count DESC, last_active_at DESC`
   - Sorts by current activity (listeners + speakers), then by recency

#### Response Format

**Success (200):**
```json
{
  "data": [
    {
      "id": "room-uuid",
      "hms_room_id": "hms-room-id",
      "title": "Room Title",
      "is_live": true,
      "listener_count": 25,
      "speaker_count": 3,
      "featured": true,
      "trending_score": 85.5,
      "last_active_at": "2024-01-15T10:30:00Z",
      "agency_id": "agency-uuid",
      "agency_name": "Agency Name",
      "theme_color": "#4F46E5",
      "banner_url": "https://..."
    }
  ],
  "error": null
}
```

**Error (400/500):**
```json
{
  "data": null,
  "error": "Error message describing the issue"
}
```

## 🗄️ Database Requirements

The function queries the `rooms_public_view` view, which should include:

- `id`: Room identifier
- `hms_room_id`: 100ms room ID
- `title`: Room title
- `is_live`: Boolean indicating if room is currently live
- `listener_count`: Number of current listeners
- `speaker_count`: Number of current speakers
- `featured`: Boolean for featured status
- `trending_score`: Numeric trending score
- `last_active_at`: Timestamp of last activity
- `agency_id`: Associated agency ID
- `agency_name`: Agency name
- `theme_color`: Agency theme color
- `banner_url`: Agency banner image URL

## 🧪 Testing

### Test with curl

```bash
# Test featured sorting (default)
curl "https://<project-ref>.functions.supabase.co/explore?sort=featured"

# Test trending sorting
curl "https://<project-ref>.functions.supabase.co/explore?sort=trending"

# Test active sorting
curl "https://<project-ref>.functions.supabase.co/explore?sort=active"

# Test default sorting (no sort parameter)
curl "https://<project-ref>.functions.supabase.co/explore"

# Test invalid sort parameter (should default to featured)
curl "https://<project-ref>.functions.supabase.co/explore?sort=invalid"
```

### Test with JavaScript

```javascript
const baseUrl = 'https://<project-ref>.functions.supabase.co'

// Test different sort options
const testSorts = ['featured', 'trending', 'active']

for (const sort of testSorts) {
  const response = await fetch(`${baseUrl}/explore?sort=${sort}`)
  const result = await response.json()
  
  console.log(`${sort}:`, result.data?.length || 0, 'rooms')
}
```

## 🔒 Security Features

- **Public Access**: No authentication required for read access
- **Input Validation**: Sort parameters are validated and normalized
- **CORS Support**: Permissive CORS headers for cross-origin requests
- **Error Handling**: Graceful error handling without exposing internals
- **Rate Limiting**: Inherits Supabase Edge Function rate limits

## 🚨 Error Handling

The function handles various error scenarios:

- **Invalid HTTP Methods**: Returns 405 for non-GET requests
- **Missing Configuration**: Returns 500 if environment variables are missing
- **Database Errors**: Returns 500 with generic error message
- **Invalid Sort Parameters**: Gracefully defaults to 'featured' sorting
- **Unexpected Errors**: Returns 500 with generic error message

## 📱 Frontend Integration

### React Native Example

```typescript
const fetchRooms = async (sort: 'featured' | 'trending' | 'active') => {
  const baseUrl = process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL
  
  try {
    const response = await fetch(`${baseUrl}/explore?sort=${sort}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.error) {
      throw new Error(result.error)
    }
    
    return result.data
  } catch (error) {
    console.error('Failed to fetch rooms:', error)
    throw error
  }
}
```

## 🔄 CORS Configuration

The function includes permissive CORS headers:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}
```

## 📊 Performance Considerations

- **Limit**: Results are limited to 50 rooms for performance
- **Indexing**: Ensure proper database indexes on sorting fields
- **Caching**: Consider implementing Redis caching for frequently accessed data
- **Monitoring**: Monitor function execution times and error rates

## 🐛 Troubleshooting

### Common Issues

1. **Function not accessible**
   - Verify deployment was successful
   - Check environment variables are set
   - Ensure function is deployed as public

2. **CORS errors**
   - Function includes permissive CORS headers
   - Check if your frontend is making preflight requests

3. **Empty results**
   - Verify `rooms_public_view` exists and has data
   - Check if `is_live = true` filter is working
   - Verify database permissions for the anon key

4. **Sorting not working**
   - Check if sort parameters are being passed correctly
   - Verify database columns exist and are indexed
   - Check function logs for errors

### Debug Mode

Enable debug logging by checking the Supabase Edge Function logs in the dashboard.

## 🔮 Future Enhancements

- **Pagination**: Add offset/limit parameters for large datasets
- **Filtering**: Add additional filters (agency, language, etc.)
- **Caching**: Implement Redis caching for improved performance
- **Analytics**: Add request logging and analytics
- **Rate Limiting**: Implement custom rate limiting per client

## 📚 Related Documentation

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Deno Runtime](https://deno.land/manual)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
