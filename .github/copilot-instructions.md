# Dreams KSA - AI Coding Agent Instructions

## Project Overview
Dreams KSA is a React Native voice chat application built with Expo Router, integrating 100ms SDK for real-time voice rooms, Supabase for backend services, and supporting Arabic RTL layouts.

## Architecture & Key Components

### Core Navigation Structure
- **Expo Router**: File-based routing with tab navigation in `app/(tabs)/`
- **Tab Layout**: 5-tab bottom navigation (الرئيسية, ميكس, الهدايا, الإعدادات, حسابي) with dark theme (`#1e293b` background)
- **Layout Hierarchy**: 
  - `app/_layout.tsx`: Root layout (minimal, just `<Slot />`)
  - `app/(tabs)/_layout.tsx`: Tab navigation configuration
  - `app/(tabs)/index.tsx`: Main tab that renders `HomePage.tsx`

### Voice Chat Integration (100ms)
- **HMS Wrapper**: `hmsWrapper.js` provides platform-specific HMS imports (web compatibility)
- **Token Server**: Separate Node.js server at `../dreams-ksa-token-server/` for HMS authentication
  - Endpoint: `POST /get-token` with `{ user_id, role, room_id }`
  - **Critical**: Token server expects `userId`/`roomId` (camelCase) for HMS SDK
- **Voice Room**: `app/voicechat.tsx` - comprehensive voice room implementation with speaker/listener roles
- **Room Creation**: Uses HMS management API via backend server

### Backend Services
- **Supabase**: Primary database with schema defined in `supabase_schema.sql`
  - Tables: users, rooms, room_participants, gifts, transactions, friends, reports
  - Leaderboards view for coin-based rankings
- **Express Backend**: `backend/server.js` handles HMS token generation and user validation
- **Authentication**: Phone-based auth flow with ban/moderation checks

### UI/UX Patterns
- **Dark Theme**: Consistent dark background (`#0f172a` main, `#1e293b` surfaces)
- **Arabic RTL**: All text in Arabic with proper RTL support
- **Component Structure**:
  - `RoomCard.tsx`: Voice room preview cards with live status, user count, profile images
  - `HomePage.tsx`: Category grid + live rooms horizontal scroll
  - Category colors: استكشف (#6366f1), النجوم (#f59e0b), الموسيقى (#ef4444), المحادثات (#3b82f6)

## Critical Development Patterns

### Voice Room State Management
```tsx
// User roles: 'listener' | 'speaker' | 'moderator'
// Always handle mute state and hand-raised status
const [userRole, setUserRole] = useState<'listener' | 'speaker' | 'moderator'>('listener');
const [isMuted, setIsMuted] = useState(true); // Start muted by default
const [isHandRaised, setIsHandRaised] = useState(false);
```

### Navigation with Voice Rooms
```tsx
// Always pass roomId and roomName when navigating to voice chat
router.push(`/voicechat?roomId=${room.id}&roomName=${room?.name || 'نقاش تقني'}`);
```

### HMS Integration Debugging
- **Token Issues**: Check `dreams-ksa-token-server` logs for role validation errors
- **Template Configuration**: Room template ID must match valid roles in HMS dashboard
- **Platform Handling**: Use `hmsWrapper.js` for web compatibility

## Development Commands

### Start Development
```bash
# Main app
cd dreams-ksa
npx expo start

# Token server (required for voice features)
cd ../dreams-ksa-token-server
npm start  # Runs on port 4000
```

### Build & Deploy
```bash
# Android build
npx expo run:android

# Reset project structure
npm run reset-project
```

### Common Debugging
- **Metro Bundle Errors**: Clear cache with `npx expo start --clear`
- **HMS Token Errors**: Check token server logs and HMS template configuration
- **Layout Issues**: Verify tab navigation structure and SafeAreaView usage

## File Structure Conventions
- **Voice Components**: Place in `/app/` root for route access
- **Reusable UI**: Use `/components/` for shared components like `RoomCard`
- **Backend Logic**: Keep server logic in separate `/backend/` directory
- **Platform Abstractions**: Use wrapper files like `hmsWrapper.js` for cross-platform compatibility

## Common Pitfalls
1. **HMS Roles**: Always validate role names match HMS template configuration
2. **Token Server**: Ensure camelCase parameters (`userId`, `roomId`) for HMS SDK calls
3. **Arabic Layout**: Test RTL layout with Arabic text, especially in navigation
4. **Tab Navigation**: Don't wrap `<Tabs>` with additional layout components in `_layout.tsx`
5. **Voice Permissions**: Android requires microphone permissions configured in `app.json`

## Integration Points
- **Supabase Client**: `lib/supabase.js` with hardcoded credentials (development setup)
- **HMS Token Flow**: App → Token Server → HMS API → Voice Room Connection
- **Admin Dashboard**: Separate React app in `/admin-dashboard/` for moderation
- **Patch Files**: HMS SDK requires patches in `/patches/` directory
