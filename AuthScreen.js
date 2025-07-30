import React, { useState } from 'react'
import { View, TextInput, Button, Alert } from 'react-native'
import { supabase } from './lib/supabase';

export default function AuthScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) Alert.alert('Error', error.message)
    else Alert.alert('Success! Check your email to confirm.')
  }

  async function signIn() {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) Alert.alert('Error', error.message)
    else onLogin(data.user)
  }

  return (
    <View style={{ padding: 20, marginTop: 50 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ borderBottomWidth: 1, marginBottom: 15, height: 40 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderBottomWidth: 1, marginBottom: 15, height: 40 }}
      />
      <Button title="Sign Up" onPress={signUp} />
      <View style={{ marginTop: 10 }} />
      <Button title="Sign In" onPress={signIn} />
    </View>
  )
}
