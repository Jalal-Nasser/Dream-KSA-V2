# Agency Settings Screen Setup Guide

## Overview

The Agency Settings screen allows agency owners and managers to customize their agency's branding with theme colors and banner images, similar to Binmo-style agency pages.

## Database Schema Requirements

### 1. Agencies Table Updates

Ensure your `public.agencies` table has these columns:

```sql
-- Add these columns if they don't exist
ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#4F46E5',
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_agencies_theme_color ON public.agencies(theme_color);
CREATE INDEX IF NOT EXISTS idx_agencies_banner_url ON public.agencies(banner_url);
```

### 2. Storage Bucket Setup

Create the `agency-banners` storage bucket:

```sql
-- Create agency-banners storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('agency-banners', 'agency-banners', true);

-- Storage policies for agency banners
CREATE POLICY "Agency banners are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'agency-banners');

CREATE POLICY "Agency owners/managers can upload banners" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'agency-banners' 
    AND EXISTS (
      SELECT 1 FROM agency_members am
      JOIN agencies a ON am.agency_id = a.id
      WHERE am.user_id = auth.uid()
      AND am.role IN ('owner', 'manager')
      AND a.id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Agency owners/managers can update banners" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'agency-banners' 
    AND EXISTS (
      SELECT 1 FROM agency_members am
      JOIN agencies a ON am.agency_id = a.id
      WHERE am.user_id = auth.uid()
      AND am.role IN ('owner', 'manager')
      AND a.id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Agency owners/managers can delete banners" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'agency-banners' 
    AND EXISTS (
      SELECT 1 FROM agency_members am
      JOIN agencies a ON am.agency_id = a.id
      WHERE am.user_id = auth.uid()
      AND am.role IN ('owner', 'manager')
      AND a.id::text = (storage.foldername(name))[1]
    )
  );
```

### 3. Existing Tables (Required)

The agency settings screen relies on these existing tables:

- `agencies` - Agency information and branding
- `agency_members` - User roles within agencies
- `auth.users` - User authentication

## Features Implemented

### 1. Theme Color Management

- **Hex Input**: Direct hex color code input with validation
- **Quick Presets**: 6 preset colors for common themes
- **Live Preview**: Real-time color preview
- **Validation**: Hex format validation with error messages

### 2. Banner Image Management

- **Image Picker**: Integration with expo-image-picker
- **Storage Upload**: Direct upload to Supabase Storage
- **File Organization**: `agency-banners/{agencyId}/banner.jpg`
- **Image Optimization**: 16:9 aspect ratio, 1200x675 max dimensions

### 3. Permission System

- **Role-Based Access**: Only owners/managers can edit
- **Read-Only Mode**: Non-admin users see settings but can't edit
- **Clear Messaging**: Permission notices for restricted users

### 4. Live Preview

- **Real-Time Updates**: Shows changes before saving
- **Banner Display**: 160px banner area with gradient overlay
- **Theme Integration**: Uses current theme color for accents

## UI Components

### 1. Main Settings Screen

- **Header Navigation**: Back button and screen title
- **Agency Info**: Agency name and description
- **Permission Notice**: Clear indication of user capabilities

### 2. Theme Color Section

- **Hex Input**: Validated color input field
- **Color Swatches**: Quick preset selection
- **Color Preview**: Visual color representation
- **Error Handling**: Validation error messages

### 3. Banner Section

- **Upload Interface**: Drag-and-drop style picker
- **Current Banner**: Display of existing banner
- **Upload Progress**: Loading states during upload

### 4. Live Preview Card

- **Banner Area**: 160px height with image/color background
- **Gradient Overlay**: Ensures text readability
- **Agency Name**: Displayed over banner
- **Theme Integration**: Color pill using current theme

### 5. Action Buttons

- **Save Changes**: Primary action button (enabled when dirty)
- **Reset**: Revert to original values
- **Loading States**: Visual feedback during operations

## Dependencies Required

### 1. Expo Packages

```bash
npx expo install expo-image-picker
```

### 2. React Native Packages

```bash
npm install lucide-react-native
```

### 3. Existing Dependencies

- `@supabase/supabase-js` - Database operations
- `react-native-safe-area-context` - Safe area handling
- `nativewind` - Tailwind CSS styling
- `expo-router` - Navigation and routing

## File Structure

```
app/agency/settings/[agencyId].tsx    # Main settings screen
src/components/ColorSwatchRow.tsx     # Color preset swatches
src/lib/validateColor.ts              # Color validation utilities
```

## Testing Checklist

### 1. Permission Testing

- [ ] Owner can access and edit all settings
- [ ] Manager can access and edit all settings
- [ ] Host sees read-only view with permission notice
- [ ] Member sees read-only view with permission notice
- [ ] Non-member gets appropriate error

### 2. Theme Color Management

- [ ] Hex input accepts valid colors
- [ ] Invalid hex shows error message
- [ ] Color swatches update input field
- [ ] Live preview updates in real-time
- [ ] Color validation prevents invalid saves

### 3. Banner Management

- [ ] Can select image from photo library
- [ ] Image uploads to correct storage path
- [ ] Banner displays in preview card
- [ ] Upload progress shows correctly
- [ ] Failed uploads show error messages

### 4. Save Operations

- [ ] Save button enabled only when changes exist
- [ ] Save persists to database correctly
- [ ] Success toast shows after save
- [ ] Error handling for failed saves
- [ ] Reset button reverts to original values

### 5. Live Preview

- [ ] Preview card shows current branding
- [ ] Theme color updates preview immediately
- [ ] Banner image displays correctly
- [ ] Gradient overlay ensures text readability
- [ ] Preview matches final result

### 6. Integration Testing

- [ ] Changes reflect in explore screen
- [ ] Room cards show updated branding
- [ ] Voice chat headers display new branding
- [ ] Agency pages reflect changes

## Common Issues & Solutions

### 1. Banner Not Uploading

- **Check**: Storage bucket exists and policies are correct
- **Verify**: User has owner/manager role
- **Debug**: Check browser console for storage errors

### 2. Theme Color Not Saving

- **Check**: Hex color validation is passing
- **Verify**: User has edit permissions
- **Debug**: Check database update queries

### 3. Permission Denied

- **Check**: User role in agency_members table
- **Verify**: RLS policies are enabled
- **Debug**: Check authentication state

### 4. Preview Not Updating

- **Check**: State management is working
- **Verify**: Color validation is passing
- **Debug**: Check component re-renders

## Performance Considerations

- **Image Optimization**: Banners resized to reasonable dimensions
- **Lazy Loading**: Settings loaded only when needed
- **State Management**: Efficient updates without unnecessary re-renders
- **Storage Caching**: Banner URLs cached locally

## Security Features

- **RLS Policies**: Storage access restricted by agency membership
- **Role Verification**: Edit permissions checked on both client and server
- **Input Validation**: Hex colors validated before processing
- **File Path Security**: Uploads restricted to agency-specific folders

## Future Enhancements

- **Bulk Operations**: Apply branding to multiple agencies
- **Branding Templates**: Pre-designed theme combinations
- **Advanced Image Editing**: Crop, filter, and adjust banner images
- **Branding Analytics**: Track branding effectiveness
- **A/B Testing**: Test different branding options
