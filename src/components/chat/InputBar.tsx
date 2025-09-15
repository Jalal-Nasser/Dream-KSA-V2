import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, I18nManager } from 'react-native';
import EmojiSelector from 'react-native-emoji-selector';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export default function InputBar({ value, onChangeText, onSend, disabled = false }: Props) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const isRTL = I18nManager.isRTL;

  const handleEmojiSelect = (emoji: string) => {
    onChangeText(value + emoji);
    setShowEmojiPicker(false);
  };

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend();
    }
  };

  return (
    <View style={styles.container}>
      {/* Emoji Picker Overlay */}
      {showEmojiPicker && (
        <View style={styles.emojiPickerContainer}>
          <View style={styles.emojiPicker}>
            <EmojiSelector
              onEmojiSelected={handleEmojiSelect}
              showTabs={false}
              showSearchBar={false}
              showSectionTitles={false}
              columns={8}
            />
          </View>
        </View>
      )}

      {/* Input Bar */}
      <View style={[styles.inputBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {/* Emoji Button */}
        <Pressable
          onPress={() => setShowEmojiPicker(!showEmojiPicker)}
          style={styles.emojiButton}
        >
          <Text style={styles.emojiIcon}>😀</Text>
        </Pressable>

        {/* Text Input */}
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder="اكتب رسالة…"
          placeholderTextColor="#999"
          multiline
          textAlign="right"
          writingDirection="rtl"
          maxLength={500}
        />

        {/* Send Button */}
        <Pressable
          onPress={handleSend}
          style={[styles.sendButton, disabled && styles.sendButtonDisabled]}
          disabled={disabled || !value.trim()}
        >
          <Text style={styles.sendText}>إرسال</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  emojiPickerContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
  },
  emojiPicker: {
    height: 200,
  },
  inputBar: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0E3EB',
  },
  emojiButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  emojiIcon: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
    paddingHorizontal: 12,
    minHeight: 44,
    maxHeight: 120,
    color: '#2f2136',
  },
  sendButton: {
    backgroundColor: '#F24B8A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 64,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
