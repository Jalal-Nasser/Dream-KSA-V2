# 100ms Setup Guide for Real Voice Chat

## Overview
This app now includes **REAL** voice chat functionality using the 100ms SDK. You can actually talk through your microphone and hear others in real-time!

## What Changed
- ✅ **Real Audio**: Actual microphone capture and audio transmission
- ✅ **HMS Integration**: Using @100mslive/react-native-hms SDK
- ✅ **Live Speaking Detection**: Real-time detection of who's speaking
- ✅ **Admin Controls**: Real mute/unmute and participant management
- ✅ **Authentication**: Token-based room access with permissions

## Setup Instructions

### 1. Create 100ms Account
1. Go to [100ms Dashboard](https://dashboard.100ms.live)
2. Sign up for a free account
3. Create a new app/project

### 2. Get Your Credentials
From your 100ms dashboard, you'll need:
- **Management Token** (for server-side API calls)
- **App ID** (for token generation)
- **App Secret** (for token generation)
- **Room Template ID** (defines room behavior)

### 3. Configure Environment Variables
Create a `.env` file in the `backend/` directory:

```bash
# 100ms Configuration
HMS_MANAGEMENT_TOKEN=your_management_token_here
HMS_APP_ID=your_app_id_here
HMS_APP_SECRET=your_app_secret_here
HMS_ROOM_TEMPLATE_ID=your_room_template_id_here

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# Server Configuration
PORT=3001
```

### 4. Create Room Template
In your 100ms dashboard:
1. Go to "Templates" section
2. Create a new template with these roles:
   - **guest**: Can speak and listen
   - **moderator**: Can speak, listen, and control others
   - **listener**: Can only listen (optional)

### 5. Test the Setup

#### Start the Backend Server:
```bash
cd backend
npm install
npm start
```

#### Run the App:
```bash
# In project root
npx expo start
```

## How It Works

### Real Audio Features:
1. **Microphone Access**: App requests RECORD_AUDIO permission
2. **Live Audio Streaming**: Audio is transmitted in real-time via 100ms
3. **Speaking Detection**: Visual indicators show who's currently speaking
4. **Mute Controls**: Real mute/unmute functionality
5. **Admin Controls**: Moderators can mute/remove participants

### Flow:
1. User taps on a room card
2. App requests auth token from backend
3. Backend generates HMS token with user permissions
4. App joins HMS room with real audio
5. Real-time voice communication begins!

## API Endpoints

### Backend provides:
- `POST /create-room` - Creates new HMS room
- `POST /get-token` - Gets authentication token for joining
- `GET /room/:roomId` - Gets room details and participants
- `POST /leave-room` - Handles user leaving
- `POST /admin/mute` - Admin mute control
- `POST /admin/kick` - Admin removal control

## Testing

### To test real voice chat:
1. Open the app on multiple devices/simulators
2. Join the same room from both devices
3. Grant microphone permissions
4. Speak on one device - you'll hear it on the other!
5. Test mute/unmute controls
6. Try admin controls if you have moderator role

## Permissions Required

### Android (already configured):
- `RECORD_AUDIO` - For microphone access
- `MODIFY_AUDIO_SETTINGS` - For audio control
- `ACCESS_NETWORK_STATE` - For connectivity
- `INTERNET` - For data transmission

### iOS (may need additional config):
- Microphone permission in Info.plist
- Network permissions

## Troubleshooting

### Common Issues:

1. **"HMS SDK not initialized"**
   - Check if 100ms credentials are correct
   - Verify internet connection

2. **"Failed to get auth token"**
   - Check backend server is running on localhost:3001
   - Verify HMS credentials in .env file

3. **"No audio heard"**
   - Check microphone permissions
   - Verify device volume settings
   - Check if muted in the app

4. **"Connection failed"**
   - Verify room template exists
   - Check network connectivity
   - Ensure HMS service is running

### Debug Mode:
Check the console logs in both the app and backend server for detailed error information.

## Production Deployment

### For production use:
1. Replace localhost URLs with your actual server URL
2. Set up proper authentication
3. Configure rate limiting
4. Set up monitoring and analytics
5. Test on real devices with different network conditions

## Benefits of Real Integration

✅ **Actual Voice Communication**: Real microphone and speaker usage
✅ **Low Latency**: 100ms provides ultra-low latency audio
✅ **Scalable**: Supports many participants per room
✅ **Cross-Platform**: Works on iOS and Android
✅ **Professional Grade**: Used by many production apps
✅ **Admin Controls**: Real moderation capabilities

Now you have **REAL** voice chat, not just visual simulation! 🎤🔊
