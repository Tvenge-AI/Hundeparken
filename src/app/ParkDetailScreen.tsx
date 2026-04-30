import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Colors, Spacing, Radius, FontSize } from '../lib/theme'

export default function ParkDetailScreen({ route, navigation }: any) {
  const { park } = route.params
  const { user, dogs } = useAuthStore()
  const [checkins, setCheckins] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [activeCheckin, setActiveCheckin] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [checkinsRes, reviewsRes, activeRes] = await Promise.all([
      supabase.from('checkins').select('*, dogs(*), profiles(*)').eq('park_id', park.id).is('checked_out_at', null),
      supabase.from('reviews').select('*, profiles(*)').eq('park_id', park.id).order('created_at', { ascending: false }),
      user ? supabase.from('checkins').select('*').eq('park_id', park.id).eq('user_id', user.id).is('checked_out_at', null).single() : Promise.resolve({ data: null }),
    ])
    if (checkinsRes.data) setCheckins(checkinsRes.data)
    if (reviewsRes.data) setReviews(reviewsRes.data)
    if (activeRes.data) setActiveCheckin(activeRes.data)
  }

  const doCheckin = async () => {
    if (!user || dogs.length === 0) {
      Alert.alert('Ingen hund', 'Legg til en hund først under Profil.')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.from('checkins').insert({
      park_id: park.id,
      user_id: user.id,
      dog_id: dogs[0].id,
    }).select().single()
    setLoading(false)
    if (error) { Alert.alert('Feil', error.message); return }
    setActiveCheckin(data)
    Alert.alert('🐾 Sjekket inn!', `${dogs[0].name} er nå i ${park.name}!`)
    fetchData()
  }

  const doCheckout = async () => {
    if (!activeCheckin) return
    await supabase.from('checkins').update({ checked_out_at: new Date().toISOString() }).eq('id', activeCheckin.id)
    setActiveCheckin(null)
    fetchData()
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>◀ Tilbake</Text>
        </TouchableOpacity>
        <Text style={styles.heroEmoji}>🌳</Text>
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.parkName}>{park.name}</Text>
        <Text style={styles.parkCity}>📍 {park.city ?? 'Norge'}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{avgRating ? `⭐ ${avgRating}` : '–'}</Text>
            <Text style={styles.statLabel}>{reviews.length} anmeldelser</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>🐕 {checkins.length}</Text>
            <Text style={styles.statLabel}>her nå</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{park.fenced ? '✅' : '–'}</Text>
            <Text style={styles.statLabel}>inngjerdet</Text>
          </View>
        </View>

        {/* Fasiliteter */}
        <View style={styles.facilitiesRow}>
          {park.fenced && <View style={styles.chip}><Text style={styles.chipText}>🔒 Inngjerdet</Text></View>}
          {park.parking && <View style={styles.chip}><Text style={styles.chipText}>🅿️ Parkering</Text></View>}
          {park.water && <View style={styles.chip}><Text style={styles.chipText}>💧 Vann</Text></View>}
          {park.lighting && <View style={styles.chip}><Text style={styles.chipText}>💡 Belysning</Text></View>}
          {park.waste_bins && <View style={styles.chip}><Text style={styles.chipText}>🗑️ Søppel</Text></View>}
        </View>
      </View>

      {/* Innsjekk-knapp */}
      <View style={styles.section}>
        {activeCheckin ? (
          <TouchableOpacity style={styles.checkoutBtn} onPress={doCheckout}>
            <Text style={styles.checkoutBtnText}>✅ Du er her – trykk for å sjekke ut</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.checkinBtn} onPress={doCheckin} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.checkinBtnText}>📍 Sjekk inn her</Text>}
          </TouchableOpacity>
        )}
      </View>

      {/* Hvem er her */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hunder her nå 🐾</Text>
        {checkins.length === 0 ? (
          <Text style={styles.emptyText}>Ingen er her akkurat nå – bli den første!</Text>
        ) : (
          <View style={styles.dogsRow}>
            {checkins.map(c => (
              <View key={c.id} style={styles.dogChip}>
                <Text style={{ fontSize: 20 }}>🐕</Text>
                <Text style={styles.dogChipText}>{c.dogs?.name ?? 'Hund'}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Anmeldelser */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Anmeldelser ⭐</Text>
        {reviews.length === 0 ? (
          <Text style={styles.emptyText}>Ingen anmeldelser ennå.</Text>
        ) : (
          reviews.slice(0, 5).map(r => (
            <View key={r.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewName}>{r.profiles?.display_name ?? 'Ukjent'}</Text>
                <Text>{'⭐'.repeat(r.rating)}</Text>
              </View>
              {r.body && <Text style={styles.reviewBody}>{r.body}</Text>}
            </View>
          ))
        )}
      </View>
      <View style={{ height: 60 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  hero: { height: 200, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 52, left: Spacing.md, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 8 },
  backText: { color: Colors.white, fontWeight: '700' },
  heroEmoji: { fontSize: 80 },
  infoCard: { backgroundColor: Colors.white, margin: Spacing.md, marginTop: -Spacing.xl, borderRadius: Radius.xl, padding: Spacing.lg },
  parkName: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.dark },
  parkCity: { fontSize: FontSize.sm, color: Colors.gray, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  stat: { flex: 1, backgroundColor: Colors.grayLight, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  statVal: { fontSize: FontSize.md, fontWeight: '700', color: Colors.green },
  statLabel: { fontSize: FontSize.xs, color: Colors.gray, marginTop: 2 },
  facilitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  chip: { backgroundColor: Colors.greenPale, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  chipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.green },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.dark, marginBottom: Spacing.md },
  checkinBtn: { backgroundColor: Colors.green, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  checkinBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
  checkoutBtn: { backgroundColor: Colors.amber, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  checkoutBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
  emptyText: { color: Colors.gray, fontStyle: 'italic' },
  dogsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  dogChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.greenPale, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 8 },
  dogChipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.dark },
  reviewCard: { backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewName: { fontWeight: '700', color: Colors.dark, fontSize: FontSize.sm },
  reviewBody: { fontSize: FontSize.sm, color: Colors.dark, marginTop: Spacing.sm, lineHeight: 20 },
})
