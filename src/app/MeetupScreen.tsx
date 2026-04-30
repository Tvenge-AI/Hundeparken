import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, ImageBackground } from 'react-native'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Colors, Spacing, Radius, FontSize } from '../lib/theme'

const MEETUP_TYPES = [
  '🐕 Alle er velkomne', '🐩 Små hunder (under 10 kg)', '🦮 Store hunder (over 20 kg)',
  '🐾 Kun valper', '👴 Eldre hunder', '⚡ Aktive og energiske hunder',
  '😌 Rolige hunder', '🏃 Løpetur med hund', '🌊 Bading med hund', '🎓 Sosialisering og trening',
]

export default function MeetupScreen({ navigation }: any) {
  const { user, dogs } = useAuthStore()
  const [meetups, setMeetups] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [parks, setParks] = useState<any[]>([])
  const [parkSearch, setParkSearch] = useState('')
  const [filteredParks, setFilteredParks] = useState<any[]>([])
  const [selectedPark, setSelectedPark] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchMeetups(); fetchParks() }, [])
  useEffect(() => {
    if (parkSearch.trim() === '') setFilteredParks([])
    else setFilteredParks(parks.filter(p => p.name.toLowerCase().includes(parkSearch.toLowerCase()) || p.city?.toLowerCase().includes(parkSearch.toLowerCase())).slice(0, 5))
  }, [parkSearch, parks])

  const fetchMeetups = async () => {
    const { data } = await supabase.from('meetups').select('*, parks(name, city), profiles(display_name)').gte('starts_at', new Date().toISOString()).order('starts_at').limit(20)
    if (data) setMeetups(data)
  }
  const fetchParks = async () => {
    const { data } = await supabase.from('parks').select('id, name, city').eq('status', 'active').order('name')
    if (data) setParks(data)
  }
  const createMeetup = async () => {
    if (!selectedPark) { Alert.alert('Velg en park'); return }
    if (!title.trim()) { Alert.alert('Skriv en tittel'); return }
    if (!date || !time) { Alert.alert('Fyll inn dato og tid'); return }
    if (!user) return
    const parts = date.split('.')
    if (parts.length !== 3) { Alert.alert('Ugyldig dato', 'Bruk format DD.MM.ÅÅÅÅ'); return }
    const [d, m, y] = parts
    const startsAt = new Date(`${y}-${m}-${d}T${time}:00`)
    if (isNaN(startsAt.getTime())) { Alert.alert('Ugyldig dato eller tid'); return }
    setLoading(true)
    const { error } = await supabase.from('meetups').insert({ park_id: selectedPark.id, organizer_id: user.id, title: title.trim(), description: [selectedType, description].filter(Boolean).join(' – ') || null, starts_at: startsAt.toISOString(), is_public: true })
    setLoading(false)
    if (error) { Alert.alert('Feil', error.message); return }
    Alert.alert('🎉 Treff opprettet!')
    setShowCreate(false); setSelectedPark(null); setParkSearch(''); setTitle('')
    setSelectedType(''); setDate(''); setTime(''); setDescription('')
    fetchMeetups()
  }
  const joinMeetup = async (meetup: any) => {
    if (!user || !dogs.length) { Alert.alert('Ingen hund', 'Legg til en hund først under Profil.'); return }
    const { error } = await supabase.from('meetup_rsvps').upsert({ meetup_id: meetup.id, user_id: user.id, dog_id: dogs[0].id, status: 'going' })
    if (!error) Alert.alert('🎉 Påmeldt!', `Du er påmeldt "${meetup.title}"`)
  }

  return (
    <ImageBackground source={require('../../assets/bg.jpg')} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Treff 📅</Text>
          <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(!showCreate)}>
            <Text style={styles.createBtnText}>{showCreate ? '✕ Avbryt' : '+ Nytt treff'}</Text>
          </TouchableOpacity>
        </View>
        {showCreate && (
          <View style={styles.createCard}>
            <Text style={styles.cardTitle}>📅 Planlegg et treff</Text>
            {selectedPark ? (
              <View style={styles.selectedPark}>
                <Text style={styles.selectedParkText}>🌳 {selectedPark.name}</Text>
                <TouchableOpacity onPress={() => { setSelectedPark(null); setParkSearch('') }}><Text style={{ color: Colors.gray }}>Endre</Text></TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.label}>Velg park</Text>
                <TextInput style={styles.input} placeholder="🔍 Søk etter park..." value={parkSearch} onChangeText={setParkSearch} placeholderTextColor={Colors.gray} />
                {filteredParks.map(p => (
                  <TouchableOpacity key={p.id} style={styles.parkResult} onPress={() => { setSelectedPark(p); setParkSearch('') }}>
                    <Text style={styles.parkResultName}>🌳 {p.name}</Text>
                    <Text style={styles.parkResultCity}>{p.city}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
            <Text style={styles.label}>Tittel</Text>
            <TextInput style={styles.input} placeholder="F.eks. Lørdagstur i parken" value={title} onChangeText={setTitle} placeholderTextColor={Colors.gray} />
            <Text style={styles.label}>Type treff</Text>
            <View style={styles.typeRow}>
              {MEETUP_TYPES.map(t => (
                <TouchableOpacity key={t} style={[styles.typeChip, selectedType === t && styles.typeChipActive]} onPress={() => setSelectedType(selectedType === t ? '' : t)}>
                  <Text style={[styles.typeChipText, selectedType === t && styles.typeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Dato (DD.MM.ÅÅÅÅ)</Text>
            <TextInput style={styles.input} placeholder="F.eks. 15.05.2026" value={date} onChangeText={setDate} keyboardType="numbers-and-punctuation" placeholderTextColor={Colors.gray} />
            <Text style={styles.label}>Klokkeslett (HH:MM)</Text>
            <TextInput style={styles.input} placeholder="F.eks. 14:00" value={time} onChangeText={setTime} keyboardType="numbers-and-punctuation" placeholderTextColor={Colors.gray} />
            <Text style={styles.label}>Beskrivelse (valgfritt)</Text>
            <TextInput style={[styles.input, { height: 70, textAlignVertical: 'top' }]} placeholder="Fortell litt om treffet..." value={description} onChangeText={setDescription} multiline placeholderTextColor={Colors.gray} />
            <TouchableOpacity style={styles.submitBtn} onPress={createMeetup} disabled={loading}>
              {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitBtnText}>🎉 Opprett treff</Text>}
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.sectionTitle}>Kommende treff 🐾</Text>
        {meetups.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48 }}>📅</Text>
            <Text style={styles.emptyTitle}>Ingen planlagte treff</Text>
            <Text style={styles.emptySubtitle}>Bli den første til å planlegge et hundetreff!</Text>
          </View>
        ) : (
          meetups.map(m => (
            <View key={m.id} style={styles.meetupCard}>
              <View style={styles.dateBox}>
                <Text style={styles.dateDay}>{new Date(m.starts_at).getDate()}</Text>
                <Text style={styles.dateMon}>{new Date(m.starts_at).toLocaleString('nb-NO', { month: 'short' }).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.meetupTitle}>{m.title}</Text>
                <Text style={styles.meetupPark}>📍 {m.parks?.name}, {m.parks?.city}</Text>
                <Text style={styles.meetupTime}>🕐 {new Date(m.starts_at).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}</Text>
                {m.description && <Text style={styles.meetupDesc}>{m.description}</Text>}
              </View>
              <TouchableOpacity style={styles.joinBtn} onPress={() => joinMeetup(m)}>
                <Text style={styles.joinBtnText}>Meld på</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,1.0)' },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, paddingTop: 60 },
  title: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.dark },
  createBtn: { backgroundColor: Colors.green, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 8 },
  createBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
  createCard: { backgroundColor: 'rgba(255,255,255,0.95)', margin: Spacing.md, borderRadius: Radius.xl, padding: Spacing.lg },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.dark, marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray, marginBottom: Spacing.sm, marginTop: Spacing.md },
  input: { backgroundColor: Colors.grayLight, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.dark },
  selectedPark: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.greenPale, borderRadius: Radius.md, padding: Spacing.md },
  selectedParkText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.dark },
  parkResult: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.grayLight, borderRadius: Radius.md, padding: Spacing.md, marginTop: 4 },
  parkResultName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.dark },
  parkResultCity: { fontSize: FontSize.xs, color: Colors.gray },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  typeChip: { borderWidth: 2, borderColor: Colors.grayLight, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 7, backgroundColor: Colors.white },
  typeChipActive: { borderColor: Colors.green, backgroundColor: Colors.greenPale },
  typeChipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.dark },
  typeChipTextActive: { color: Colors.green },
  submitBtn: { backgroundColor: Colors.green, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.lg },
  submitBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.dark, paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  emptyState: { alignItems: 'center', padding: Spacing.xxl, gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.dark },
  emptySubtitle: { fontSize: FontSize.sm, color: Colors.gray, textAlign: 'center' },
  meetupCard: { flexDirection: 'row', gap: Spacing.md, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: Radius.xl, margin: Spacing.md, marginBottom: 0, padding: Spacing.md, alignItems: 'center' },
  dateBox: { backgroundColor: Colors.green, borderRadius: Radius.md, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },
  dateDay: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '900', lineHeight: 22 },
  dateMon: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  meetupTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.dark },
  meetupPark: { fontSize: FontSize.sm, color: Colors.gray },
  meetupTime: { fontSize: FontSize.sm, color: Colors.gray },
  meetupDesc: { fontSize: FontSize.xs, color: Colors.green, marginTop: 4, fontWeight: '600' },
  joinBtn: { backgroundColor: Colors.greenPale, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 6 },
  joinBtnText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.green },
})
