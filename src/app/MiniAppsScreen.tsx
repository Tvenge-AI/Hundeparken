import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native'
import { Colors } from '../lib/theme'

type MiniApp = {
  id: number
  emoji: string
  customIcon?: 'cross' | 'vetcard' | 'microchip'
  title: string
  desc: string
  bg: string
  accent: string
  available: boolean
  route?: string
}

const miniApps: MiniApp[] = [
  { id: 1, emoji: '', customIcon: 'cross', title: 'SOS Dyrlege', desc: 'Hurtig hjelp når det trengs', bg: '#C24545', accent: '#8f2b2b', available: true, route: 'SOSVet' },
  { id: 2, emoji: '', customIcon: 'microchip', title: 'Chip ID',      desc: 'Sjekk og del chipinformasjon', bg: '#2F6E7A', accent: '#1e4c56', available: true, route: 'DogChip' },
  { id: 3, emoji: '', customIcon: 'vetcard', title: 'Veterinærkort', desc: 'Vaksiner og helseinformasjon',  bg: '#2D5A27', accent: '#1e3f1a', available: true, route: 'DogHealth' },
  { id: 4, emoji: '🦴',    title: 'Mat-sjekker',   desc: 'Kan hunden spise dette?',       bg: '#B37429', accent: '#82521a', available: true, route: 'FoodChecker' },
  { id: 5, emoji: '☀️',    title: 'Trygg sommer',  desc: 'Varme, flått og giftige planter', bg: '#3F7CAC', accent: '#2c5c82', available: true, route: 'SummerSafety' },
  { id: 6, emoji: '🍂',    title: 'Trygg høst',    desc: 'Regn, sopp, mørke og skjulte farer', bg: '#A34A2A', accent: '#7a3620', available: true, route: 'AutumnSafety' },
]

export default function MiniAppsScreen({ navigation }: any) {
  const [selected, setSelected] = useState<number | null>(null)

  const handleAppPress = (app: MiniApp) => {
    if (app.available && app.route) {
      navigation.navigate(app.route)
    } else {
      setSelected(selected === app.id ? null : app.id)
    }
  }

  const selectedApp = selected !== null ? miniApps.find(a => a.id === selected) : null

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hundeparken</Text>
        <Text style={styles.headerSub}>Mini-apper</Text>
        <Text style={styles.paws}>🐾</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          {/* Anbefalt tjenester-banner */}
          <TouchableOpacity
            style={styles.recommendedBanner}
            onPress={() => navigation.navigate('RecommendedServices')}
            activeOpacity={0.85}
          >
            <View style={styles.recommendedIconBox}>
              <Text style={styles.recommendedIcon}>💎</Text>
            </View>
            <View style={styles.recommendedInfo}>
              <Text style={styles.recommendedTitle}>Anbefalt for deg</Text>
              <Text style={styles.recommendedSubtitle}>Forsikring, chip-registrering, mat og utstyr</Text>
            </View>
            <Text style={styles.recommendedArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.grid}>
            {miniApps.map((app) => (
              <TouchableOpacity
                key={app.id}
                style={[styles.appItem, { backgroundColor: app.bg }]}
                onPress={() => handleAppPress(app)}
                activeOpacity={0.88}
              >
                {app.customIcon === 'cross' ? (
                  <View style={styles.medicBadge}>
                    <View style={styles.medicBadgeCrossV} />
                    <View style={styles.medicBadgeCrossH} />
                  </View>
                ) : app.customIcon === 'microchip' ? (
                  <View style={styles.chipIcon}>
                    <View style={styles.chipPlate}>
                      <View style={styles.chipLineH} />
                      <View style={styles.chipLineV} />
                      <View style={styles.chipCenter} />
                    </View>
                  </View>
                ) : app.customIcon === 'vetcard' ? (
                  <View style={styles.vetCardIcon}>
                    <View style={styles.vetCard}>
                      <View style={styles.vetCardMiniCross}>
                        <View style={styles.vetCardMiniCrossV} />
                        <View style={styles.vetCardMiniCrossH} />
                      </View>
                      <View style={styles.vetCardLine} />
                      <View style={[styles.vetCardLine, styles.vetCardLineShort]} />
                    </View>
                  </View>
                ) : (
                  <Text style={styles.tileEmoji}>{app.emoji}</Text>
                )}
                <View style={styles.tileTextBlock}>
                  <Text style={styles.tileTitle}>{app.title}</Text>
                  <Text style={styles.tileDesc}>{app.desc}</Text>
                </View>
                <View style={[styles.tilePawWatermark]}>
                  <Text style={[styles.pawWatermarkText, { color: app.accent }]}>🐾</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      {selectedApp && !selectedApp.available && (
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>{selectedApp.title}</Text>
          <Text style={styles.previewDesc}>{selectedApp.desc}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Kommer snart</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2d5a27' },
  header: { padding: 24, paddingBottom: 16, position: 'relative' },
  headerTitle: { fontSize: 32, fontWeight: '700', color: 'white' },
  headerSub: { fontSize: 16, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  paws: { position: 'absolute', right: 20, top: 20, fontSize: 40, opacity: 0.3 },
  scroll: { flexGrow: 1 },
  card: { backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 16, minHeight: 500 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

  appItem: {
    width: '48%',
    aspectRatio: 0.95,
    marginBottom: 14,
    borderRadius: 22,
    padding: 16,
    overflow: 'hidden',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  tileEmoji: { fontSize: 44, marginTop: 4 },
  chipIcon: { width: 52, height: 52, marginTop: 4, alignItems: 'center', justifyContent: 'center' },
  chipPlate: {
    width: 46,
    height: 38,
    borderRadius: 9,
    backgroundColor: '#f0cf8f',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  chipLineH: { position: 'absolute', top: 17.5, left: 0, right: 0, height: 3, backgroundColor: '#b8935a' },
  chipLineV: { position: 'absolute', left: 21.5, top: 0, bottom: 0, width: 3, backgroundColor: '#b8935a' },
  chipCenter: {
    position: 'absolute',
    left: 13,
    top: 10,
    width: 20,
    height: 18,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: '#b8935a',
    backgroundColor: '#f0cf8f',
  },

  medicBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'white',
    marginTop: 4,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  medicBadgeCrossV: { position: 'absolute', left: 23, top: 12, width: 8, height: 30, backgroundColor: '#C24545', borderRadius: 1.5 },
  medicBadgeCrossH: { position: 'absolute', top: 23, left: 12, width: 30, height: 8, backgroundColor: '#C24545', borderRadius: 1.5 },

  vetCardIcon: { width: 56, height: 48, marginTop: 4, justifyContent: 'center' },
  vetCard: {
    width: 54,
    height: 44,
    backgroundColor: 'white',
    borderRadius: 7,
    paddingVertical: 8,
    paddingHorizontal: 9,
    alignItems: 'flex-start',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  vetCardMiniCross: { width: 14, height: 14, marginBottom: 6 },
  vetCardMiniCrossV: { position: 'absolute', left: 5, top: 0, width: 4, height: 14, backgroundColor: '#C24545', borderRadius: 1 },
  vetCardMiniCrossH: { position: 'absolute', top: 5, left: 0, width: 14, height: 4, backgroundColor: '#C24545', borderRadius: 1 },
  vetCardLine: { height: 3.5, backgroundColor: '#c9d2c6', borderRadius: 2, marginTop: 4, width: 30 },
  vetCardLineShort: { width: 20 },
  tileTextBlock: { marginTop: 8 },
  tileTitle: { fontSize: 17, fontWeight: '800', color: 'white', letterSpacing: 0.2 },
  tileDesc: { fontSize: 12, color: 'rgba(255,255,255,0.82)', marginTop: 4, lineHeight: 16 },

  tilePawWatermark: {
    position: 'absolute',
    right: -12,
    bottom: -18,
    opacity: 0.22,
  },
  pawWatermarkText: { fontSize: 90 },

  previewCard: { backgroundColor: '#1a2e1a', margin: 16, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewTitle: { fontSize: 18, fontWeight: '700', color: 'white', marginBottom: 4 },
  previewDesc: { fontSize: 13, color: 'rgba(255,255,255,0.7)', maxWidth: 180 },
  badge: { borderWidth: 1, borderColor: 'white', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { color: 'white', fontSize: 12 },

  // Anbefalt-banner (kommersielle partnere)
  recommendedBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5E1', borderRadius: 18, padding: 14, marginBottom: 16, borderWidth: 1.5, borderColor: '#f59e0b' },
  recommendedIconBox: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#FFE8B5', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  recommendedIcon: { fontSize: 28 },
  recommendedInfo: { flex: 1 },
  recommendedTitle: { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },
  recommendedSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
  recommendedArrow: { fontSize: 28, color: '#f59e0b', fontWeight: '700' },

  divider: { height: 1, backgroundColor: '#eee', marginBottom: 16 },
})
