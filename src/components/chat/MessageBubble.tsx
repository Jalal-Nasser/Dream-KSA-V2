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
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14,
    borderWidth: 1
  },
  mine: {
    backgroundColor: '#FFE3F0',
    borderColor: '#F3C1D9',
  },
  their: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E6E1E8',
  },
  name: { color: '#7a6883', fontSize: 12, marginBottom: 4 },
  text: { color: '#2f2136', fontSize: 15, lineHeight: 22, textAlign: 'right' },
  time: { color: '#8f7d93', fontSize: 11, marginTop: 4, textAlign: 'left' },
})
