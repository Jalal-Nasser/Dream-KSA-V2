# 🧪 Testing Guide for Dreams KSA Voice Chat App

## 🎯 Overview
This guide will help you test all the implemented features including mic permissions, raise hand functionality, and admin controls.

## 📱 Prerequisites
- Expo Go app installed on your mobile device
- Device with microphone
- Internet connection

## 🚀 Starting the App
1. Run `npm start` in the project directory
2. Scan the QR code with Expo Go app
3. Wait for the app to load

## 🧪 Feature Testing Checklist

### 1. 🎤 Mic Permissions Testing

#### Test Case 1: Initial Permission Request
- [ ] Open the app
- [ ] Navigate to any voice chat room
- [ ] **Expected**: App should request microphone permission
- [ ] **Expected**: Permission dialog should appear with Arabic text
- [ ] **Expected**: User should see "إذن الميكروفون مطلوب" warning if permission denied

#### Test Case 2: Permission Grant Flow
- [ ] Grant microphone permission when prompted
- [ ] **Expected**: Permission warning should disappear
- [ ] **Expected**: Mic controls should become active
- [ ] **Expected**: Success alert: "تم منح الإذن"

#### Test Case 3: Permission Denial Flow
- [ ] Deny microphone permission
- [ ] **Expected**: Permission warning should remain visible
- [ ] **Expected**: Mic controls should be disabled
- [ ] **Expected**: Manual permission request button should be visible

### 2. 🤚 Raise Hand Functionality Testing

#### Test Case 4: Raise Hand Request
- [ ] Ensure you have microphone permission
- [ ] Tap the "Raise Hand" button (🤚)
- [ ] **Expected**: Hand should be raised visually
- [ ] **Expected**: Alert: "تم رفع اليد - تم إرسال طلب التحدث للمشرف"
- **Expected**: Request should appear in moderator's permission requests

#### Test Case 5: Lower Hand
- [ ] Tap "Raise Hand" button again
- [ ] **Expected**: Hand should be lowered
- [ ] **Expected**: Request should be removed from moderator's list

#### Test Case 6: Raise Hand Without Permission
- [ ] Revoke microphone permission
- [ ] Try to raise hand
- [ ] **Expected**: Alert: "إذن الميكروفون مطلوب"
- [ ] **Expected**: Option to grant permission

### 3. 👑 Admin Controls Testing

#### Test Case 7: Moderator Permissions
- [ ] Ensure you're logged in as a moderator
- [ ] **Expected**: Shield icon (🛡️) should be visible in header
- [ ] **Expected**: Permission badge should show count of pending requests

#### Test Case 8: Grant Speaking Permission
- [ ] As moderator, see a raised hand request
- [ ] Tap Shield icon to open permissions modal
- [ ] Tap "Approve" on a request
- [ ] **Expected**: Participant should get speaking permission
- **Expected**: Request should be removed from list
- **Expected**: Participant's status should update

#### Test Case 9: Revoke Speaking Permission
- [ ] Long press on a participant with speaking permission
- [ ] Select "سحب إذن التحدث" (Revoke Speaking Permission)
- [ ] **Expected**: Participant should lose speaking ability
- **Expected**: Participant should be muted
- **Expected**: Alert: "تم سحب الإذن"

#### Test Case 10: Promote to Speaker
- [ ] Long press on a listener with raised hand
- [ ] Select "ترقية لمتحدث" (Promote to Speaker)
- [ ] **Expected**: Participant should become speaker
- **Expected**: Hand should be lowered
- **Expected**: Alert: "تمت الترقية"

#### Test Case 11: Mute/Unmute Participants
- [ ] Long press on any participant
- [ ] Select mute/unmute option
- [ ] **Expected**: Participant's mic status should change
- **Expected**: Visual indicator should update

#### Test Case 12: Kick Participant
- [ ] Long press on any participant
- [ ] Select "طرد" (Kick)
- [ ] **Expected**: Confirmation dialog
- [ ] **Expected**: Participant should be removed from room

### 4. 🎭 UI Elements Testing

#### Test Case 13: Permission Status Indicators
- [ ] **Expected**: Red shield-off icon for participants without speaking permission
- [ ] **Expected**: "طلب التحدث" text for participants with raised hands
- [ ] **Expected**: Permission warning banner if no mic permission

#### Test Case 14: Permission Requests Modal
- [ ] Tap Shield icon as moderator
- [ ] **Expected**: Modal should open showing all pending requests
- [ ] **Expected**: Each request should show participant name and timestamp
- [ ] **Expected**: Approve/Deny buttons for each request

#### Test Case 15: Help Modal
- [ ] Tap Help icon (❓) in header
- [ ] **Expected**: Help modal should open
- **Expected**: Should explain permission system
- **Expected**: Should show admin tools explanation

### 5. 🔄 State Management Testing

#### Test Case 16: Permission State Persistence
- [ ] Grant microphone permission
- [ ] Navigate away from room
- [ ] Return to room
- [ ] **Expected**: Permission should still be granted

#### Test Case 17: Request State Updates
- [ ] Raise hand as participant
- [ ] As moderator, approve request
- [ ] **Expected**: Participant's state should update immediately
- **Expected**: Request should disappear from list

### 6. 🌐 Cross-Platform Testing

#### Test Case 18: Android Permissions
- [ ] Test on Android device
- [ ] **Expected**: `PermissionsAndroid.request` should be called
- **Expected**: Permission dialog should appear

#### Test Case 19: iOS Permissions
- [ ] Test on iOS device
- [ ] **Expected**: Should handle permissions through expo-permissions
- **Expected**: Permission flow should work correctly

## 🐛 Common Issues & Solutions

### Issue 1: Permission Not Requested
**Symptoms**: No permission dialog appears
**Solution**: Check if `react-native-permissions` is properly installed

### Issue 2: Raise Hand Not Working
**Symptoms**: Button doesn't respond
**Solution**: Ensure microphone permission is granted first

### Issue 3: Admin Controls Not Visible
**Symptoms**: Shield icon missing
**Solution**: Ensure user role is set to 'moderator'

### Issue 4: Permission Requests Not Showing
**Symptoms**: Modal is empty
**Solution**: Check if participants have raised hands

## 📊 Test Results Template

```
Test Date: _____________
Device: _______________
OS Version: ____________
Expo Version: __________

Feature Tested: ________
Status: ✅ PASS / ❌ FAIL
Notes: ________________

Issues Found: ___________
Severity: LOW/MEDIUM/HIGH
```

## 🎯 Success Criteria

The implementation is successful if:
- [ ] Microphone permissions are properly requested and handled
- [ ] Raise hand functionality works for all participants
- [ ] Admin controls are accessible and functional
- [ ] Permission states are properly managed and displayed
- [ ] UI provides clear feedback for all actions
- [ ] Cross-platform compatibility is maintained

## 🚨 Critical Test Scenarios

1. **Permission Denial Recovery**: User denies permission, then grants it later
2. **Multiple Simultaneous Requests**: Several participants raise hands at once
3. **Admin Role Switching**: User changes from listener to moderator
4. **Network Interruption**: App behavior during connection issues
5. **Memory Management**: App performance with many participants

## 📝 Reporting Issues

When reporting issues, include:
- Device model and OS version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if possible
- Console logs if available

---

**Happy Testing! 🎉**

If you encounter any issues, refer to the troubleshooting section or create a detailed bug report.
