// src/components/chat/MessageBubble.tsx
import React from 'react'
import { View, Text, StyleSheet, I18nManager } from 'react-native'

type Props = {
  text: string
  mine?: boolean
  name?: string
  time?: string
}

export default function MessageBubble({ text, mine, name, time }: Props) {
  const dir = I18nManager.isRTL ? 'row-reverse' : 'row'
  return (
    <View style={[styles.wrap, { flexDirection: dir, alignSelf: mine ? 'flex-end' : 'flex-start' }]}>
      <View style={[styles.bubble, mine ? styles.mine : styles.their]}>
        {!!name && !mine && <Text style={styles.name}>{name}</Text>}
        <Text style={styles.text}>{text}</Text>
        {!!time && <Text style={styles.time}>{time}</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { maxWidth: '85%', marginVertical: 6, direction: 'rtl' as const },
  bubble: {
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mine: {
    backgroundColor: 'rgba(255, 227, 240, 0.95)',
    borderColor: 'rgba(243, 193, 217, 0.8)',
  },
  their: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(230, 225, 232, 0.6)',
  },
  name: { 
    color: '#7a6883', 
    fontSize: 12, 
    marginBottom: 4, 
    fontWeight: '600' 
  },
  text: { 
    color: '#2f2136', 
    fontSize: 15, 
    lineHeight: 22, 
    textAlign: 'right' 
  },
  time: { 
    color: '#8f7d93', 
    fontSize: 11, 
    marginTop: 4, 
    textAlign: 'left',
    fontStyle: 'italic',
  },
})
