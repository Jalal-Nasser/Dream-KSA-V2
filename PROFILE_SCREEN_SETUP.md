# Profile Screen Setup Guide

## Overview

The Profile screen allows users to view and edit their profile information, including avatar, display name, bio, VIP status, and agency memberships.

## Database Schema Requirements

### 1. Profiles Table

```sql
-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Storage Bucket Setup

```sql
-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 3. Existing Tables (Required)

The profile screen relies on these existing tables:

- `user_vip` - For VIP badge display
- `agency_members` - For agency memberships
- `agencies` - For agency information

## Features Implemented

### 1. Profile Management

- **Avatar Upload**: Users can take photos or select from gallery
- **Display Name**: Editable text input with validation
- **Bio**: Multi-line textarea for user description
- **Auto-Creation**: Profile automatically created if it doesn't exist

### 2. Avatar Handling

- **Image Picker**: Integration with expo-image-picker
- **Storage Upload**: Direct upload to Supabase Storage
- **File Naming**: Uses `{user_id}.jpg` format
- **Image Optimization**: Resized to 400x400 with 0.8 quality
- **Loading States**: Visual feedback during upload

### 3. VIP Status Display

- **Badge Display**: Shows VIP level with custom colors
- **Priority Level**: Displays VIP priority number
- **Conditional Rendering**: Only shows if user has VIP status

### 4. Agency Memberships

- **Role Display**: Shows user's role in each agency
- **Agency Names**: Displays agency names with roles
- **Pill Design**: Clean tag-based layout for memberships

## UI Components

### 1. Main Profile Screen

- **Dark Theme**: Consistent with app's design
- **Responsive Layout**: Works on all screen sizes
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages

### 2. AvatarPicker Component

- **Circular Avatar**: 96x96px rounded display
- **Camera Button**: Blue camera icon overlay
- **Image Options**: Choose from library or take photo
- **Permission Handling**: Requests camera/photo library access

### 3. Edit Mode

- **Toggle Editing**: Switch between view and edit modes
- **Form Validation**: Prevents empty submissions
- **Save/Cancel**: Clear action buttons
- **Real-time Updates**: Immediate UI feedback

## Dependencies Required

### 1. Expo Packages

```bash
npx expo install expo-image-picker
```

### 2. React Native Packages

```bash
npm install @gorhom/bottom-sheet
npm install lucide-react-native
```

### 3. Existing Dependencies

- `@supabase/supabase-js` - Database operations
- `react-native-safe-area-context` - Safe area handling
- `nativewind` - Tailwind CSS styling

## Testing Checklist

### 1. Profile Creation

- [ ] New user gets profile created automatically
- [ ] Default display name from email username
- [ ] Profile data persists after app restart

### 2. Avatar Management

- [ ] Can select image from photo library
- [ ] Can take photo with camera
- [ ] Avatar uploads to Supabase Storage
- [ ] Avatar displays correctly after upload
- [ ] Permission requests work properly

### 3. Profile Editing

- [ ] Can toggle edit mode
- [ ] Can change display name
- [ ] Can update bio
- [ ] Changes save to database
- [ ] Cancel resets to original values

### 4. VIP Display

- [ ] VIP badge shows with correct color
- [ ] VIP level name displays correctly
- [ ] Priority level shows
- [ ] No VIP users don't see badge

### 5. Agency Memberships

- [ ] Agency names display correctly
- [ ] User roles show properly
- [ ] Multiple agencies handled
- [ ] No memberships shows gracefully

### 6. Error Handling

- [ ] Network errors handled gracefully
- [ ] Permission denials show proper messages
- [ ] Upload failures display errors
- [ ] Database errors show user-friendly messages

## Common Issues & Solutions

### 1. Avatar Not Uploading

- **Check**: Storage bucket exists and policies are correct
- **Verify**: User has proper permissions
- **Debug**: Check browser console for errors

### 2. Profile Not Loading

- **Check**: RLS policies are enabled
- **Verify**: User is authenticated
- **Debug**: Check Supabase logs

### 3. VIP Badge Not Showing

- **Check**: `user_vip` table has data
- **Verify**: Join query is correct
- **Debug**: Log VIP data in component

### 4. Agency Memberships Empty

- **Check**: `agency_members` table has data
- **Verify**: User is member of agencies
- **Debug**: Check agency member queries

## Performance Considerations

- **Image Optimization**: Avatars resized to reasonable dimensions
- **Lazy Loading**: Profile data fetched only when needed
- **Caching**: Avatar URLs cached locally
- **Debouncing**: Save operations optimized

## Security Features

- **RLS Policies**: Users can only access their own profile
- **Storage Policies**: Users can only upload to their own folder
- **Input Validation**: Text inputs have length limits
- **Permission Checks**: Camera/photo library permissions required
