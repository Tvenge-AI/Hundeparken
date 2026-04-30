import React, { useState } from 'react'
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, ImageBackground, Dimensions } from 'react-native'
import { Text } from 'react-native'
import { supabase } from '../lib/supabase'
import { Colors, Spacing, Radius, FontSize } from '../lib/theme'

const { width, height } = Dimensions.get('window')

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Fyll inn e-post og passord'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) Alert.alert('Feil', error.message)
  }

  const handleRegister = async () => {
    if (!email || !password) { Alert.alert('Fyll inn e-post og passord'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) Alert.alert('Feil', error.message)
    else Alert.alert('Sjekk e-posten din! 📬')
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ImageBackground
        source={require('../../assets/login-bg.jpg')}
        style={styles.bg}
        resizeMode="stretch"
      >
        <View style={styles.bottom}>
          <TextInput
            style={styles.input}
            placeholder="E-post"
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Passord"
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.btnText}>Logg inn</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn2} onPress={handleRegister}>
              <Text style={styles.btn2Text}>Registrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: 'flex-end', width: width, height: height },
  bottom: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 52,
    paddingTop: Spacing.sm,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.md,
    padding: 10,
    fontSize: FontSize.sm,
    color: Colors.white,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  btnRow: { flexDirection: 'row', gap: Spacing.sm },
  btn: {
    flex: 1,
    backgroundColor: Colors.green,
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'center',
  },
  btnText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '700' },
  btn2: {
    flex: 1,
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  btn2Text: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '700' },
})
