import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator, ImageBackground } from 'react-native'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Colors, Spacing, Radius, FontSize } from '../lib/theme'

export default function ReviewScreen({ navigation }: any) {
  const { user } = useAuthStore()
  const [parks, setParks] = useState<any[]>([])
  const [selectedPark, setSelectedPark] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [filteredParks, setFilteredParks] = useState<any[]>([])
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [lastVisited, setLastVisited] = useState<any[]>([])

  useEffect(() => { fetchParks(); fetchReviews(); fetchLastVisited() }, [])
  useEffect(() => {
    if (search.trim() === '') setFilteredParks(parks)
    else setFilteredParks(parks.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.city?.toLowerCase().includes(search.toLowerCase())))
  }, [search, parks])

  const fetchParks = async () => {
    const { data } = await supabase.from('parks').select('*').eq('status', 'active').order('name')
    if (data) { setParks(data); setFilteredParks(data) }
  }
  const fetchLastVisited = async () => {
    if (!user) return
    const { data } = await supabase.from('checkins').select('*, parks(*)').eq('user_id', user.id).order('checked_in_at', { ascending: false }).limit(3)
    if (data) {
      const seen = new Set()
      setLastVisited(data.filter(c => { if (seen.has(c.park_id)) return false; seen.add(c.park_id); return true }))
    }
  }
  const fetchReviews = async () => {
    const { data } = await supabase.from('reviews').select('*, parks(name), profiles(display_name)').order('created_at', { ascending: false }).limit(20)
    if (data) setReviews(data)
  }
  const submitReview = async () => {
    if (!selectedPark) { Alert.alert('Velg en park'); return }
    if (rating === 0) { Alert.alert('Velg antall stjerner'); return }
    if (!user) return
    setLoading(true)
    const { error } = await supabase.from('reviews').upsert({ park_id: selectedPark.id, user_id: user.id, rating, body: body || null })
    setLoading(false)
    if (error) { Alert.alert('Feil', error.message); return }
    Alert.alert('⭐ Takk for anmeldelsen!')
    setSelectedPark(null); setRating(0); setBody(''); setSearch('')
    fetchReviews()
  }

  return (
    <ImageBackground source={require('../../assets/bg.jpg')} style={{ flex: 1 }} resizeMode="cover">
      <View style={styles.overlay} />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Anmeldelser ⭐</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Skriv en anmeldelse</Text>
          {selectedPark ? (
            <View style={styles.selectedPark}>
              <Text style={styles.selectedParkText}>🌳 {selectedPark.name}</Text>
              <TouchableOpacity onPress={() => { setSelectedPark(null); setSearch('') }}><Text style={{ color: Colors.gray }}>Endre</Text></TouchableOpacity>
            </View>
          ) : (
            <>
              {lastVisited.length > 0 && (
                <>
                  <Text style={styles.label}>📍 Dine siste parker</Text>
                  {lastVisited.map(c => (
                    <TouchableOpacity key={c.id} style={styles.suggestedPark} onPress={() => setSelectedPark(c.parks)}>
                      <View>
                        <Text style={styles.suggestedName}>🌳 {c.parks?.name}</Text>
                        <Text style={styles.suggestedTime}>Besøkt {new Date(c.checked_in_at).toLocaleDateString('nb-NO')}</Text>
                      </View>
                      <Text style={{ color: Colors.green, fontWeight: '700' }}>Velg →</Text>
                    </TouchableOpacity>
                  ))}
                  <View style={styles.divider} />
                </>
              )}
              <Text style={styles.label}>🔍 Eller søk etter park</Text>
              <TextInput style={styles.searchInput} placeholder="Skriv parknavn eller by..." value={search} onChangeText={setSearch} placeholderTextColor={Colors.gray} />
              {search.length > 0 && filteredParks.slice(0, 4).map(park => (
                <TouchableOpacity key={park.id} style={styles.parkResult} onPress={() => { setSelectedPark(park); setSearch('') }}>
                  <Text style={styles.parkResultName}>🌳 {park.name}</Text>
                  <Text style={styles.parkResultCity}>{park.city ?? ''}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
          <Text style={styles.label}>Vurdering</Text>
          <View style={styles.starsRow}>
            {[1,2,3,4,5].map(s => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Text style={{ fontSize: 36, opacity: s <= rating ? 1 : 0.25 }}>⭐</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Kommentar (valgfritt)</Text>
          <TextInput style={styles.textArea} placeholder="Hvordan var parken?" value={body} onChangeText={setBody} multiline placeholderTextColor={Colors.gray} />
          <TouchableOpacity style={styles.submitBtn} onPress={submitReview} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitBtnText}>⭐ Send anmeldelse</Text>}
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>Siste anmeldelser</Text>
        {reviews.map(r => (
          <View key={r.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewPark}>🌳 {r.parks?.name}</Text>
              <Text>{'⭐'.repeat(r.rating)}</Text>
            </View>
            {r.body && <Text style={styles.reviewBody}>{r.body}</Text>}
            <Text style={styles.reviewMeta}>{r.profiles?.display_name ?? 'Ukjent'} · {new Date(r.created_at).toLocaleDateString('nb-NO')}</Text>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,1.0)' },
  container: { flex: 1, padding: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.dark, marginTop: 60, marginBottom: Spacing.lg },
  card: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.lg },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.dark, marginBottom: Spacing.md },
  selectedPark: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.greenPale, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  selectedParkText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.dark },
  suggestedPark: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.greenPale, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 8 },
  suggestedName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.dark },
  suggestedTime: { fontSize: FontSize.xs, color: Colors.gray, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.grayLight, marginVertical: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray, marginBottom: Spacing.sm, marginTop: Spacing.md },
  searchInput: { backgroundColor: Colors.grayLight, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.dark, marginBottom: Spacing.sm },
  parkResult: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.grayLight, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 6 },
  parkResultName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.dark },
  parkResultCity: { fontSize: FontSize.xs, color: Colors.gray },
  starsRow: { flexDirection: 'row', gap: Spacing.sm },
  textArea: { backgroundColor: Colors.grayLight, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.dark, minHeight: 80, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: Colors.green, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.lg },
  submitBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.dark, marginBottom: Spacing.md },
  reviewCard: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.md },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewPark: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.dark, flex: 1 },
  reviewBody: { fontSize: FontSize.sm, color: Colors.dark, marginTop: Spacing.sm, lineHeight: 20 },
  reviewMeta: { fontSize: FontSize.xs, color: Colors.gray, marginTop: Spacing.sm },
})
