# In-Room Admin Controls & Agency Branding Implementation

## Overview

This implementation adds comprehensive admin controls for voice chat rooms and agency branding features throughout the app.

## Features Implemented

### 1. Admin Controls Hook (`src/hooks/useAdminControls.ts`)

- **makeListener(peerId)**: Changes a peer's role to "listener"
- **kick(peerId)**: Removes a peer from the room with confirmation
- **mute(peerId)**: Mutes/unmutes a peer's audio track
- **Error Handling**: Try-catch blocks with user-friendly toast messages
- **Confirmation**: Alert dialog for destructive actions like kicking

### 2. Roster Sheet Component (`src/components/RosterSheet.tsx`)

- **Peer Display**: Shows all participants with roles, VIP status, and mute state
- **Role Icons**: Visual indicators for host (crown), speaker (mic), listener (user)
- **VIP Badges**: Displays VIP level with custom colors
- **Admin Actions**: Action buttons only visible to owners/managers
- **Responsive Design**: Bottom sheet with proper safe area handling

### 3. Voice Chat Integration (`app/voicechat.tsx`)

- **Roster Button**: Added to header for easy access
- **Admin Controls**: Integrated with existing agency member logic
- **HMS Integration**: Uses existing 100ms SDK instance
- **Conditional Rendering**: Components only show when HMS is ready

### 4. Agency Branding

#### Explore Screen (`app/(tabs)/explore.tsx`)
- **Theme Color Pills**: Small colored indicators using agency theme colors
- **Banner Images**: Background images for room cards when available
- **Fallback Design**: Solid color backgrounds when no banner image
- **Accessibility**: Gradient overlays for text readability

#### Voice Chat Header
- **Banner Display**: 120-160px banner area when `banner_url` exists
- **Gradient Overlays**: Ensures text contrast over banner images
- **Room Information**: Displays room name and agency name over banner

## Technical Implementation

### HMS SDK Integration

- **Instance Access**: Modified `useHMSGate` to return HMS instance
- **Null Safety**: All admin functions check for HMS availability
- **Event Handling**: Uses existing 100ms event listeners

### Admin Permission System

- **Role-Based Access**: Uses existing `agency_members` table logic
- **Owner/Manager Only**: Admin controls restricted to appropriate roles
- **Real-time Updates**: Integrates with existing participant management

### Data Flow

1. **Room Data**: Fetched from `rooms_public_view` for branding
2. **Participant Data**: From existing `useMicQueue` hook
3. **VIP Information**: From existing `useVipMap` hook
4. **Admin Status**: Derived from room ownership check

## Usage

### For Room Owners/Managers

1. **Access Roster**: Tap "Roster" button in voice chat header
2. **Manage Participants**: Use action buttons for each peer
3. **Role Management**: Change speakers to listeners
4. **Moderation**: Mute or remove problematic participants

### For Regular Users

1. **View Roster**: See all participants and their roles
2. **VIP Recognition**: View VIP badges and status
3. **Read-Only**: No admin actions available

## Environment Requirements

### Database Schema

- `rooms_public_view` must include:
  - `theme_color` (string)
  - `agency_icon_url` (string)
  - `agency_name` (string)

### Dependencies

- `@gorhom/bottom-sheet` for roster sheet
- `lucide-react-native` for icons
- Existing 100ms SDK setup

## Security Considerations

- **Permission Checks**: Admin actions require proper role verification
- **Input Validation**: All peer IDs validated before processing
- **Error Handling**: Graceful failure without information leakage
- **Confirmation Dialogs**: Destructive actions require user confirmation

## Future Enhancements

- **Real-time Mute State**: Sync mute status with HMS audio tracks
- **Advanced Moderation**: Time-based bans, warning system
- **Audit Logging**: Track admin actions for moderation history
- **Bulk Actions**: Select multiple participants for batch operations

## Testing Checklist

- [ ] Admin controls only visible to owners/managers
- [ ] Roster sheet opens and displays participants correctly
- [ ] Admin actions execute without errors
- [ ] Agency branding displays correctly in explore and voice chat
- [ ] Error states handled gracefully
- [ ] HMS integration works with existing setup
