# Session Management & Edge Function Integration

This directory contains the client-side implementation for managing user authentication tokens and calling Supabase Edge Functions with automatic JWT authentication.

## Files Overview

### `supabaseClient.ts`
- **Purpose**: Creates and exports the Supabase client using environment variables
- **Environment Variables**: 
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- **Features**: Automatic token refresh, session persistence

### `session.ts`
- **Purpose**: In-memory session store for managing user authentication tokens
- **Exports**:
  - `getAccessToken()`: Get current access token
  - `subscribeToToken(callback)`: Subscribe to token changes
  - `initAuthListeners()`: Initialize Supabase auth listeners
  - `clearSession()`: Clear current session

### `edge.ts`
- **Purpose**: Wrapper for calling Supabase Edge Functions with automatic JWT authentication
- **Exports**:
  - `invokeEdge(functionName, body?)`: Call Edge Function with auto-attached JWT
  - `invokeEdgeNoBody(functionName)`: Call Edge Function without body

### `edge-examples.ts`
- **Purpose**: Examples showing how to use `invokeEdge` for common operations
- **Examples**: HMS token, microphone control, gifts, month operations, agency management

## Usage

### Basic Edge Function Call
```typescript
import { invokeEdge } from '@/lib/edge';

// Simple call
const result = await invokeEdge('hms-token', {
  user_id: '123',
  user_name: 'John',
  role: 'host',
  room_id: 'room-456'
});

// No body needed
const data = await invokeEdge('request-payout');
```

### Session Management
```typescript
import { getAccessToken, subscribeToToken } from '@/lib/session';

// Get current token
const token = getAccessToken();

// Subscribe to token changes
const unsubscribe = subscribeToToken((token) => {
  if (token) {
    console.log('User is authenticated');
  } else {
    console.log('User is not authenticated');
  }
});

// Clean up subscription
unsubscribe();
```

### Authentication Flow
1. **App Startup**: `initAuthListeners()` is called automatically in `_layout.tsx` and `App.js`
2. **Login**: After successful authentication, the session store automatically captures the JWT
3. **Edge Function Calls**: `invokeEdge()` automatically attaches the current JWT
4. **Token Refresh**: Handled automatically by Supabase client and session store
5. **Logout**: Session store automatically clears the token

## Migration from Direct Calls

### Before (Old Way)
```typescript
// Manual JWT handling
const { data: { session } } = await supabase.auth.getSession();
const jwt = session?.access_token;

const { data, error } = await supabase.functions.invoke('hms-token', {
  body: { user_id, user_name, role, room_id },
  headers: { Authorization: `Bearer ${jwt}` }
});
```

### After (New Way)
```typescript
// Automatic JWT handling
const result = await invokeEdge('hms-token', {
  user_id, user_name, role, room_id
});
```

## Error Handling

The `invokeEdge` function provides clear error messages:

- **"User not authenticated"**: When called without a valid JWT
- **"Edge Function error: ..."**: When the Edge Function returns an error
- **"Failed to invoke Edge Function: ..."**: For network or other errors

## Security Features

- ✅ No service role keys in client code
- ✅ Automatic JWT attachment
- ✅ Token validation before Edge Function calls
- ✅ Clear error messages for unauthenticated users
- ✅ Automatic token refresh handling

## Environment Variables

Make sure these are set in your `.env` file:
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note**: Never include `SUPABASE_SERVICE_ROLE_KEY` in client-side code.
