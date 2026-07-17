import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native'
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

  // Review state
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const userReview = user ? reviews.find(r => r.user_id === user.id) : null
  const otherReviews = user ? reviews.filter(r => r.user_id !== user.id) : reviews

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

  const openReviewForm = () => {
    setRating(userReview?.rating ?? 0)
    setBody(userReview?.body ?? '')
    setShowReviewForm(true)
  }

  const submitReview = async () => {
    if (!user) return
    if (rating === 0) { Alert.alert('Velg antall stjerner'); return }
    setSubmittingReview(true)
    const { error } = await supabase
      .from('reviews')
      .upsert({ park_id: park.id, user_id: user.id, rating, body: body || null }, { onConflict: 'park_id,user_id' })
    setSubmittingReview(false)
    if (error) { Alert.alert('Feil', error.message); return }
    setShowReviewForm(false)
    Alert.alert('⭐ Takk for anmeldelsen!')
    fetchData()
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

        {/* Skriv anmeldelse / Vis din egen */}
        {user && !showReviewForm && (
          userReview ? (
            <View style={styles.yourReviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.yourReviewLabel}>Din anmeldelse</Text>
                <Text>{'⭐'.repeat(userReview.rating)}</Text>
              </View>
              {userReview.body && <Text style={styles.reviewBody}>{userReview.body}</Text>}
              <TouchableOpacity style={styles.editReviewBtn} onPress={openReviewForm}>
                <Text style={styles.editReviewBtnText}>✏️ Endre anmeldelse</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.writeReviewBtn} onPress={openReviewForm}>
              <Text style={styles.writeReviewBtnText}>⭐ Skriv en anmeldelse</Text>
            </TouchableOpacity>
          )
        )}

        {/* Anmeldelses-skjema */}
        {showReviewForm && (
          <View style={styles.reviewForm}>
            <Text style={styles.formLabel}>Vurdering</Text>
            <View style={styles.starsRow}>
              {[1,2,3,4,5].map(s => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Text style={{ fontSize: 36, opacity: s <= rating ? 1 : 0.25 }}>⭐</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.formLabel}>Kommentar (valgfritt)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Hvordan var parken?"
              value={body}
              onChangeText={setBody}
              multiline
              placeholderTextColor={Colors.gray}
            />
            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowReviewForm(false)}>
                <Text style={styles.cancelBtnText}>Avbryt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitReview} disabled={submittingReview}>
                {submittingReview
                  ? <ActivityIndicator color={Colors.white} />
                  : <Text style={styles.submitBtnText}>{userReview ? 'Oppdater' : 'Send'}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Andres anmeldelser */}
        {otherReviews.length === 0 && !userReview ? (
          <Text style={styles.emptyText}>Ingen anmeldelser ennå – bli den første!</Text>
        ) : (
          otherReviews.slice(0, 5).map(r => (
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
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewName: { fontWeight: '700', color: Colors.dark, fontSize: FontSize.sm },
  reviewBody: { fontSize: FontSize.sm, color: Colors.dark, marginTop: Spacing.sm, lineHeight: 20 },
  writeReviewBtn: { backgroundColor: Colors.greenPale, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.md, borderWidth: 1.5, borderColor: Colors.green },
  writeReviewBtnText: { color: Colors.green, fontWeight: '700', fontSize: FontSize.md },
  yourReviewCard: { backgroundColor: Colors.greenPale, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1.5, borderColor: Colors.green },
  yourReviewLabel: { fontWeight: '700', color: Colors.green, fontSize: FontSize.sm },
  editReviewBtn: { marginTop: Spacing.sm, alignSelf: 'flex-start' },
  editReviewBtnText: { color: Colors.green, fontWeight: '600', fontSize: FontSize.sm },
  reviewForm: { backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.grayLight },
  formLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  starsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  textArea: { backgroundColor: Colors.grayLight, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.dark, minHeight: 80, textAlignVertical: 'top' },
  formActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  cancelBtn: { flex: 1, backgroundColor: Colors.grayLight, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  cancelBtnText: { color: Colors.dark, fontWeight: '600', fontSize: FontSize.md },
  submitBtn: { flex: 2, backgroundColor: Colors.green, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  submitBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
})
