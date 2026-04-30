import React, { useState, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, useWindowDimensions } from 'react-native'
import { Colors, Spacing, Radius, FontSize } from '../lib/theme'

const SLIDES = [
  { id: '1', emoji: '🗺️', title: 'Finn hundeparker i nærheten', subtitle: 'Se alle hundeparker og friområder i Norge på ett kart.', bg: Colors.greenPale },
  { id: '2', emoji: '📍', title: 'Sjekk inn og si hei!', subtitle: 'Sjekk inn når du ankommer en park og se hvilke andre hunder som er der.', bg: '#FFF9E6' },
  { id: '3', emoji: '📅', title: 'Planlegg treff', subtitle: 'Organiser hundetreff og bli med på andres arrangementer.', bg: '#EEF4FF' },
  { id: '4', emoji: '🐶', title: 'Din hunds profil', subtitle: 'Legg til hundens navn, rase og temperament.', bg: '#FFF0F0' },
]

export default function OnboardingScreen({ navigation }: any) {
  const { width } = useWindowDimensions()
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 })
      setCurrentIndex(currentIndex + 1)
    } else {
      navigation.replace('Main')
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.replace('Main')}>
        <Text style={styles.skipText}>Hopp over</Text>
      </TouchableOpacity>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width, backgroundColor: item.bg }]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />)}
      </View>
      <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
        <Text style={styles.nextBtnText}>{currentIndex === SLIDES.length - 1 ? '🚀 Kom i gang!' : 'Neste →'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream, paddingBottom: Spacing.xxl },
  skipBtn: { position: 'absolute', top: 56, right: Spacing.lg, zIndex: 10, padding: Spacing.sm },
  skipText: { color: Colors.gray, fontSize: FontSize.sm, fontWeight: '600' },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl, paddingTop: 80 },
  emoji: { fontSize: 90, marginBottom: Spacing.xl },
  title: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.dark, textAlign: 'center', marginBottom: Spacing.md },
  subtitle: { fontSize: FontSize.md, color: Colors.gray, textAlign: 'center', lineHeight: 24 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: Spacing.xl },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.grayLight },
  dotActive: { width: 24, backgroundColor: Colors.green },
  nextBtn: { backgroundColor: Colors.green, marginHorizontal: Spacing.lg, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  nextBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
})
