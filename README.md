# 🎤 Dreams KSA - Voice Chat & Agency System

A complete React Native mobile application with 100ms voice chat integration and a comprehensive agency management system, built with Expo Dev Client, Supabase, and TypeScript.

## ✨ Features

### 🎯 Voice Chat System
- **100ms Integration**: High-quality voice chat with role-based access
- **Couple Mic Mode**: Maximum 2 active speakers at any time
- **Raise Hand System**: Users can request microphone access
- **Admin Controls**: Room admins can approve/revoke microphone access
- **Real-time Updates**: Live participant status and room management

### 🏢 Agency System
- **Multi-role Support**: Admin, Agency Owner, Host, User
- **Agency Management**: Create agencies, invite hosts, manage payouts
- **Gift Economy**: Virtual gifts with points-to-currency conversion
- **Monthly Earnings**: Automated aggregation and payout processing
- **Revenue Sharing**: Configurable agency-host payout splits

### 🔐 Authentication & Security
- **Supabase Auth**: Secure user authentication and management
- **Row Level Security**: Database-level access control
- **Role-based Permissions**: Granular access control per user role
- **JWT Tokens**: Secure API communication

## 🛠 Tech Stack

- **Frontend**: React Native + Expo Dev Client (TypeScript)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **Voice**: 100ms React Native SDK
- **State Management**: Zustand
- **Navigation**: Expo Router
- **UI Components**: Custom components with consistent theming
- **Database**: PostgreSQL with RLS policies
- **API**: Supabase Edge Functions (Deno)

## 📱 Platform Support

- ✅ **iOS**: Native iOS app with Expo Dev Client
- ✅ **Android**: Native Android app with Expo Dev Client
- ❌ **Web**: Not supported (100ms SDK limitations)
- ❌ **Expo Go**: Not supported (requires native SDKs)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (20+ recommended)
- npm or yarn
- Expo CLI
- Supabase CLI
- 100ms account and credentials
- iOS Simulator (macOS) or Android Emulator

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd dreams-ksa
npm install
```

### 2. Supabase Setup

#### Install Supabase CLI
```bash
npm install -g supabase
```

#### Login to Supabase
```bash
supabase login
```

#### Link your project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

#### Apply Database Schema
1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL files in order:
   ```sql
   -- 1. Create tables and structure
   \i supabase/sql/001_schema_agency_voice.sql
   
   -- 2. Enable RLS and create policies
   \i supabase/sql/002_policies_agency_voice.sql
   
   -- 3. Seed demo data (optional)
   \i supabase/sql/003_seed_demo.sql
   ```

#### Set Environment Secrets
```bash
supabase secrets set SUPABASE_URL="your-supabase-url"
supabase secrets set SUPABASE_ANON_KEY="your-supabase-anon-key"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
supabase secrets set HMS_MANAGEMENT_TOKEN="your-hms-management-token"
supabase secrets set HMS_SUBDOMAIN="your-hms-subdomain"
supabase secrets set POINTS_PER_CURRENCY="100"
supabase secrets set DEFAULT_AGENCY_SPLIT="0.3"
```

### 3. 100ms Setup

1. **Create 100ms Account**: Sign up at [100ms.live](https://100ms.live)
2. **Create App**: Set up your application
3. **Configure Roles**: Create these roles in 100ms dashboard:
   - `room_admin`: Full room control
   - `speaker`: Can publish audio/video
   - `listener`: Can only consume media
4. **Get Credentials**: Note your management token and subdomain

### 4. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy hms-token
supabase functions deploy create-agency
supabase functions deploy invite-host
supabase functions deploy accept-invite
supabase functions deploy send-gift
supabase functions deploy approve-mic
supabase functions deploy revoke-mic
supabase functions deploy close-month
supabase functions deploy finalize-month
supabase functions deploy request-payout
```

### 5. Environment Configuration

Create `.env` file in project root:
```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 6. Build & Run

#### Install Expo Dev Client
```bash
npx expo install expo-dev-client
```

#### Build Development Client
```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

#### Start Development Server
```bash
npx expo start --dev-client
```

## 🧪 Testing

### Postman Collection

1. **Import Collection**: `postman/DreamsKSA.postman_collection.json`
2. **Import Environment**: `postman/DreamsKSA.postman_environment.json`
3. **Update Variables**: Set your project-specific values
4. **Test Functions**: Run requests to verify Edge Functions

### Test Flow

1. **Create Agency**: Admin creates agency
2. **Invite Host**: Agency owner invites user to become host
3. **Accept Invite**: User accepts and becomes host
4. **Create Room**: Host creates voice chat room
5. **Join Room**: Users join and can raise hands
6. **Approve Mic**: Admin approves microphone access
7. **Send Gifts**: Users send virtual gifts to hosts
8. **Close Month**: Aggregate monthly earnings
9. **Finalize Month**: Create payout records
10. **Request Payout**: Process payments

## 📊 Database Schema

### Core Tables

- **profiles**: User profiles with roles
- **agencies**: Agency information and payout splits
- **agency_invites**: Host invitation system
- **hosts**: Host records linked to agencies
- **rooms**: Voice chat rooms
- **room_participants**: Room membership and permissions
- **gifts_catalog**: Available virtual gifts
- **gifts**: Gift transactions
- **monthly_earnings**: Monthly aggregation
- **payouts**: Payment processing

### Key Relationships

- Users can have multiple roles (admin, agency_owner, host, user)
- Agencies have owners and can have multiple hosts
- Rooms can be linked to agencies
- Gifts are sent from users to hosts in specific rooms
- Monthly earnings are calculated per host per month
- Payouts are generated for both hosts and agencies

## 🔧 Development

### Project Structure

```
dreams-ksa/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   └── room/              # Voice chat room
├── src/
│   ├── components/        # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand state management
│   ├── supabase/         # Supabase client configuration
│   └── voice/            # 100ms voice integration
├── supabase/
│   ├── functions/        # Edge Functions
│   └── sql/              # Database schema
└── postman/              # API testing collection
```

### Key Components

- **RaiseHandButton**: Hand raise functionality
- **HandRaiseQueue**: Admin view of pending requests
- **SpeakersStrip**: Display of active speakers
- **MicBadge**: Microphone status indicator
- **GiftCatalogSheet**: Gift selection interface
- **SendGiftButton**: Gift sending functionality

### State Management

- **useAuth**: Authentication and user profile
- **useRoom**: Room state and participants
- **useVoice**: 100ms voice integration
- **useUIStore**: Global UI state and theming

## 🚀 Deployment

### Supabase Edge Functions

Functions are automatically deployed when you run:
```bash
supabase functions deploy
```

### Mobile App

1. **Build Production**: Configure app.json for production
2. **EAS Build**: Use Expo Application Services for builds
3. **App Store**: Submit to iOS App Store and Google Play Store

## 🔒 Security

### Row Level Security (RLS)

- All tables have RLS enabled
- Policies ensure users can only access their own data
- Admin users have broader access for management
- Agency owners can manage their agencies and hosts

### API Security

- JWT authentication required for all Edge Functions
- Role-based access control
- Input validation with Zod schemas
- CORS headers properly configured

## 🐛 Troubleshooting

### Common Issues

#### Deno Import Errors
- Ensure all imports use `https://esm.sh/` URLs
- Check for typos in import paths
- Verify Deno compatibility

#### RLS Policy Errors
- Check user authentication status
- Verify user role permissions
- Review policy definitions

#### 100ms Token Errors
- Verify HMS credentials in Supabase secrets
- Check 100ms dashboard configuration
- Ensure proper role setup

#### Build Issues
- Clear Metro cache: `npx expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Expo SDK compatibility

### Debug Mode

Enable debug logging in Edge Functions:
```typescript
console.error('Function error:', error);
```

## 📚 API Reference

### Edge Functions

| Function | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `hms-token` | POST | Generate 100ms auth token | Yes |
| `create-agency` | POST | Create new agency | Admin only |
| `invite-host` | POST | Invite user to become host | Agency owner/Admin |
| `accept-invite` | POST | Accept host invitation | Yes |
| `send-gift` | POST | Send virtual gift | Yes |
| `approve-mic` | POST | Approve microphone access | Room admin |
| `revoke-mic` | POST | Revoke microphone access | Room admin/Self |
| `close-month` | POST | Aggregate monthly earnings | Admin/Agency owner |
| `finalize-month` | POST | Finalize monthly earnings | Admin/Agency owner |
| `request-payout` | POST | Request payout processing | Host/Agency owner/Admin |

### Response Format

All functions return JSON with this structure:
```json
{
  "ok": true|false,
  "data": {...},
  "message": "Success message",
  "error": "Error message (if ok: false)"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Community**: Join our community channels

## 🙏 Acknowledgments

- [100ms](https://100ms.live) for voice chat infrastructure
- [Supabase](https://supabase.com) for backend services
- [Expo](https://expo.dev) for React Native development platform
- [React Native](https://reactnative.dev) for cross-platform development

---

**Built with ❤️ for the Dreams KSA community**