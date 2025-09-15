import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, I18nManager } from 'react-native';

export type ChatMessage = {
  id: string;
  userId: string;
  name?: string;
  text: string;
  timestamp: number;
};

export type InlineChatProps = {
  messages?: ChatMessage[];
  onSendMessage?: (text: string) => void;
  onSendGift?: (giftId: string) => void;
  rtl?: boolean;
  visible?: boolean;
  onClose?: () => void;
};

const gifts = [
  { id: 'rose', icon: '🌹', price: 50 },
  { id: 'heart', icon: '❤️', price: 100 },
  { id: 'car', icon: '🏎️', price: 500 },
  { id: 'yacht', icon: '🛥️', price: 2000 },
];

export default function InlineChat({
  messages = [],
  onSendMessage,
  onSendGift,
  rtl = I18nManager.isRTL,
  visible = true,
  onClose
}: InlineChatProps) {
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    const text = inputText.trim();
    if (text && onSendMessage) {
      onSendMessage(text);
      setInputText('');
    }
  };

  const handleGiftPress = (giftId: string) => {
    if (onSendGift) {
      onSendGift(giftId);
    } else {
      console.log('[InlineChat] gift pressed:', giftId);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.messageContainer, { alignSelf: rtl ? 'flex-end' : 'flex-start' }]}>
      <Text style={[styles.messageText, { textAlign: rtl ? 'right' : 'left' }]}>
        {item.text}
      </Text>
      {item.name && (
        <Text style={[styles.senderName, { textAlign: rtl ? 'right' : 'left' }]}>
          {item.name}
        </Text>
      )}
    </View>
  );

  if (!visible) return null;

  return (
    <View style={[styles.container, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
      {/* Messages Area */}
      <View style={styles.messagesArea}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />
        
        {/* Gift Buttons */}
        <View style={[styles.giftsRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          {gifts.map((gift) => (
            <Pressable
              key={gift.id}
              style={styles.giftButton}
              onPress={() => handleGiftPress(gift.id)}
            >
              <Text style={styles.giftIcon}>{gift.icon}</Text>
              <Text style={styles.giftPrice}>{gift.price}</Text>
            </Pressable>
          ))}
        </View>

        {/* Input Area */}
        <View style={[styles.inputArea, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          <TextInput
            style={[styles.textInput, { textAlign: rtl ? 'right' : 'left' }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="اكتب رسالة..."
            placeholderTextColor="#999"
            multiline
            maxLength={200}
          />
          <Pressable style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>إرسال</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messagesArea: {
    flex: 1,
    padding: 8,
  },
  messagesList: {
    flex: 1,
    marginBottom: 8,
  },
  messageContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginVertical: 2,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  giftsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  giftButton: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 50,
  },
  giftIcon: {
    fontSize: 20,
  },
  giftPrice: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    maxHeight: 80,
    paddingVertical: 4,
  },
  sendButton: {
    backgroundColor: '#EA4C89',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
});
