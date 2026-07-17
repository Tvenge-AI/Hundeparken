import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, ImageBackground, ScrollView, RefreshControl, Dimensions, TouchableOpacity } from 'react-native'
import * as Location from 'expo-location'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Colors, Spacing, Radius, FontSize } from '../lib/theme'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

// Geografisk avstand i meter
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`
  return `${(m / 1000).toFixed(1)} km`
}

function daysUntil(iso: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(iso); target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function birthdayInfo(birthdate: string): { daysUntil: number; ageWillBe: number } {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const birth = new Date(birthdate)
  const nextBday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
  if (nextBday < today) nextBday.setFullYear(today.getFullYear() + 1)
  const days = Math.round((nextBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const age = nextBday.getFullYear() - birth.getFullYear()
  return { daysUntil: days, ageWillBe: age }
}

function dayWord(days: number): string {
  if (days === 0) return 'i dag'
  if (days === 1) return 'i morgen'
  return `om ${days} dager`
}

export default function HomeScreen({ navigation }: any) {
  const { profile, dogs } = useAuthStore()
  const [nearestPark, setNearestPark] = useState<any>(null)
  const [parkDistance, setParkDistance] = useState<number | null>(null)
  const [parkCheckins, setParkCheckins] = useState(0)
  const [upcomingVaccines, setUpcomingVaccines] = useState<any[]>([])
  const [meetups, setMeetups] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)

  // Lokalt beregnet
  const upcomingBirthdays = dogs
    .filter(d => d.birthdate)
    .map(d => ({ ...d, ...birthdayInfo(d.birthdate!) }))
    .filter(d => d.daysUntil <= 14)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  const upcomingVetVisits = dogs
    .filter((d: any) => d.next_vet_visit)
    .map((d: any) => ({ ...d, daysUntil: daysUntil(d.next_vet_visit) }))
    .filter((d: any) => d.daysUntil >= -7 && d.daysUntil <= 30)
    .sort((a: any, b: any) => a.daysUntil - b.daysUntil)

  const loadData = useCallback(async () => {
    // Nærmeste park
    try {
      const { status } = await Location.getForegroundPermissionsAsync()
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({})
        const { data: parks } = await supabase.from('parks').select('*').eq('status', 'active')
        if (parks && parks.length) {
          const withDist = parks.map(p => ({ ...p, dist: getDistance(loc.coords.latitude, loc.coords.longitude, p.lat, p.lng) }))
          withDist.sort((a, b) => a.dist - b.dist)
          setNearestPark(withDist[0])
          setParkDistance(withDist[0].dist)
          const { data: cks } = await supabase.from('checkins').select('id').eq('park_id', withDist[0].id).is('checked_out_at', null)
          setParkCheckins(cks?.length ?? 0)
        }
      }
    } catch (e) { /* ignore */ }

    // Vaksiner som forfaller snart
    const dogIds = dogs.map(d => d.id)
    if (dogIds.length) {
      const today = new Date().toISOString().split('T')[0]
      const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const { data: vacs } = await supabase
        .from('dog_vaccinations')
        .select('*, dogs(name)')
        .in('dog_id', dogIds)
        .gte('next_due_date', today)
        .lte('next_due_date', future)
        .order('next_due_date')
      if (vacs) setUpcomingVaccines(vacs)
    }

    // Kommende treff
    const { data: meetupsData } = await supabase
      .from('meetups')
      .select('*, parks(name, city)')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at')
      .limit(5)
    if (meetupsData) setMeetups(meetupsData)

    // Nylige anmeldelser
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*, parks(name), profiles(display_name)')
      .order('created_at', { ascending: false })
      .limit(3)
    if (reviewsData) setReviews(reviewsData)
  }, [dogs])

  useEffect(() => { loadData() }, [loadData])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const firstName = profile?.display_name?.split(' ')[0] ?? null
  const hasReminders = upcomingVaccines.length > 0 || upcomingVetVisits.length > 0

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero med fullskjerm-bilde */}
      <ImageBackground
        source={require('../../assets/login-bg.jpg')}
        style={[styles.hero, { height: SCREEN_HEIGHT }]}
        resizeMode="cover"
      >
        <View style={styles.heroOverlay} />
        <View style={styles.heroBottom}>
          <Text style={styles.swipeArrow}>↑</Text>
          <Text style={styles.swipeText}>Sveip opp for siste nytt</Text>
        </View>
      </ImageBackground>

      {/* Dashboard */}
      <View style={styles.dashboard}>
        <Text style={styles.greeting}>
          Hei {firstName ?? 'der'}! 👋
        </Text>

        {/* Hunde-chips */}
        {dogs.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dogsRow}>
            {dogs.map(dog => (
              <View key={dog.id} style={styles.dogChip}>
                <Text style={styles.dogChipEmoji}>🐶</Text>
                <Text style={styles.dogChipName}>{dog.name}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Nærmeste park */}
        {nearestPark && (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ParkDetail', { park: nearestPark })}>
            <Text style={styles.cardLabel}>📍 NÆRMESTE PARK</Text>
            <Text style={styles.cardTitle}>{nearestPark.name}</Text>
            <Text style={styles.cardSub}>
              {formatDistance(parkDistance!)} unna · 🟢 {parkCheckins} hund{parkCheckins === 1 ? '' : 'er'} her nå
            </Text>
            <Text style={styles.cardLink}>Åpne park →</Text>
          </TouchableOpacity>
        )}

        {/* Husk - vet-time og vaksiner */}
        {hasReminders && (
          <View style={[styles.card, styles.cardWarn]}>
            <Text style={styles.cardLabel}>⚠️ HUSK</Text>
            {upcomingVetVisits.map(d => (
              <Text key={`vet-${d.id}`} style={styles.reminderText}>
                📅 Vet-time for <Text style={styles.bold}>{d.name}</Text> {d.daysUntil < 0 ? `(${Math.abs(d.daysUntil)} dager forsinket)` : dayWord(d.daysUntil)}
              </Text>
            ))}
            {upcomingVaccines.map(v => {
              const d = daysUntil(v.next_due_date)
              return (
                <Text key={v.id} style={styles.reminderText}>
                  💉 <Text style={styles.bold}>{v.dogs?.name}</Text>: {v.vaccine_name} {dayWord(d)}
                </Text>
              )
            })}
            <TouchableOpacity onPress={() => navigation.navigate('DogHealth')}>
              <Text style={styles.cardLink}>Åpne Veterinærkort →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bursdager */}
        {upcomingBirthdays.map(dog => (
          <View key={dog.id} style={[styles.card, styles.cardBirthday]}>
            <Text style={styles.birthdayText}>
              🎂 <Text style={styles.bold}>{dog.name}</Text> fyller {dog.ageWillBe} år {dog.daysUntil === 0 ? 'I DAG! 🎉🎉' : dayWord(dog.daysUntil) + '! 🎉'}
            </Text>
          </View>
        ))}

        {/* Kommende treff */}
        {meetups.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>📅 KOMMENDE TREFF</Text>
            {meetups.slice(0, 3).map(m => {
              const date = new Date(m.starts_at)
              const dateStr = date.toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' })
              const timeStr = date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })
              return (
                <View key={m.id} style={styles.meetupRow}>
                  <Text style={styles.meetupTime}>{dateStr} · {timeStr}</Text>
                  <Text style={styles.meetupTitle}>{m.title}</Text>
                  <Text style={styles.meetupPark}>{m.parks?.name}{m.parks?.city ? ` · ${m.parks.city}` : ''}</Text>
                </View>
              )
            })}
          </View>
        )}

        {/* Nylige anmeldelser */}
        {reviews.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>⭐ NYLIGE ANMELDELSER</Text>
            {reviews.map(r => (
              <View key={r.id} style={styles.reviewItem}>
                <Text style={styles.reviewStars}>{'⭐'.repeat(r.rating)}</Text>
                {r.body && <Text style={styles.reviewBody} numberOfLines={2}>"{r.body}"</Text>}
                <Text style={styles.reviewMeta}>— {r.profiles?.display_name ?? 'Ukjent'}, {r.parks?.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Empty state — bare hvis ingenting å vise */}
        {!nearestPark && !hasReminders && !meetups.length && !reviews.length && upcomingBirthdays.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={styles.emptyText}>Velkommen til Hundeparken!</Text>
            <Text style={styles.emptyHint}>
              {dogs.length === 0
                ? 'Legg til en hund i Profil-fanen, så fyller hjemmesiden seg med relevant info.'
                : 'Sjekk inn på en park, lag et treff, eller skriv en anmeldelse — så fyller hjemmesiden seg.'
              }
            </Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },

  hero: { justifyContent: 'flex-end', alignItems: 'center' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.05)' },
  heroBottom: { alignItems: 'center', paddingBottom: 100 },
  swipeArrow: { color: 'rgba(255,255,255,0.95)', fontSize: 28, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  swipeText: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.sm, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4, marginTop: 4 },

  dashboard: { padding: Spacing.md },

  greeting: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.dark, marginTop: Spacing.md, marginBottom: Spacing.md },

  dogsRow: { gap: Spacing.sm, paddingBottom: Spacing.md, paddingRight: Spacing.md },
  dogChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.greenPale, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 8 },
  dogChipEmoji: { fontSize: 18 },
  dogChipName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.green },

  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.md },
  cardWarn: { borderLeftWidth: 4, borderLeftColor: Colors.amber },
  cardBirthday: { backgroundColor: '#FFF5E1', borderLeftWidth: 4, borderLeftColor: Colors.amber },
  cardLabel: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.gray, marginBottom: 6, letterSpacing: 0.5 },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.dark, marginBottom: 4 },
  cardSub: { fontSize: FontSize.sm, color: Colors.gray, marginBottom: Spacing.sm },
  cardLink: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.green, marginTop: Spacing.sm },

  reminderText: { fontSize: FontSize.sm, color: Colors.dark, marginBottom: 6, lineHeight: 22 },
  bold: { fontWeight: '800' },
  birthdayText: { fontSize: FontSize.md, color: Colors.dark, lineHeight: 24, textAlign: 'center' },

  meetupRow: { paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.grayLight },
  meetupTime: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.green },
  meetupTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.dark, marginTop: 2 },
  meetupPark: { fontSize: FontSize.xs, color: Colors.gray, marginTop: 2 },

  reviewItem: { paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.grayLight },
  reviewStars: { fontSize: 12 },
  reviewBody: { fontSize: FontSize.sm, color: Colors.dark, marginTop: 4, fontStyle: 'italic', lineHeight: 20 },
  reviewMeta: { fontSize: FontSize.xs, color: Colors.gray, marginTop: 4 },

  emptyCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md },
  emptyEmoji: { fontSize: 64 },
  emptyText: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.dark },
  emptyHint: { fontSize: FontSize.sm, color: Colors.gray, textAlign: 'center', lineHeight: 20 },
})
