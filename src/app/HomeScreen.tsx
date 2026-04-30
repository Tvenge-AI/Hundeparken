import React from 'react'
import { View, Text, StyleSheet, ImageBackground } from 'react-native'
import { Colors, Spacing, FontSize } from '../lib/theme'

export default function HomeScreen() {
  return (
    <ImageBackground
      source={require('../../assets/login-bg.jpg')}
      style={styles.bg}
      resizeMode="stretch"
    >
      <View style={styles.container}>
        <Text style={styles.swipeHint}>Sveip for å utforske appen 👉</Text>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 48 },
  swipeHint: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.lg, fontWeight: "700", textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
})
