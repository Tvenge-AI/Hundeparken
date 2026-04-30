import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, ImageBackground } from 'react-native'
import * as Location from 'expo-location'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Colors, Spacing, Radius, FontSize } from '../lib/theme'

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export default function CheckinScreen({ navigation }: any) {
  const { user, dogs } = useAuthStore()
  const [parks, setParks] = useState<any[]>([])
  const [filteredParks, setFilteredParks] = useState<any[]>([])
  const [checkins, setCheckins] = useState<any[]>([])
  const [selectedPark, setSelectedPark] = useState<any>(null)
  const [selectedDog, setSelectedDog] = useState<any>(null)
  const [activeCheckin, setActiveCheckin] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchParks(); fetchCheckins(); checkActiveCheckin() }, [])
  useEffect(() => {
    if (search.trim() === '') setFilteredParks(parks)
    else setFilteredParks(parks.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.city?.toLowerCase().includes(search.toLowerCase())))
  }, [search, parks])

  const fetchParks = async () => {
    const { data } = await supabase.from('parks').select('*').eq('status', 'active').order('name')
    if (data) { setParks(data); setFilteredParks(data) }
  }
  const fetchCheckins = async () => {
    const { data } = await supabase.from('checkins').select('*, dogs(*), profiles(*), parks(*)').is('checked_out_at', null).order('checked_in_at', { ascending: false })
    if (data) setCheckins(data)
  }
  const checkActiveCheckin = async () => {
    if (!user) return
    const { data } = await supabase.from('checkins').select('*, parks(*)').eq('user_id', user.id).is('checked_out_at', null).single()
    if (data) setActiveCheckin(data)
  }
  const findNearestPark = async () => {
    setLocating(true)
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') { Alert.alert('Gi tilgang til stedstjenester'); setLocating(false); return }
    const loc = await Location.getCurrentPositionAsync({})
    const sorted = [...parks].map(p => ({ ...p, distance: getDistance(loc.coords.latitude, loc.coords.longitude, p.lat, p.lng) })).sort((a, b) => a.distance - b.distance)
    const nearest = sorted[0]
    setSelectedPark(nearest)
    const dist = nearest.distance < 1000 ? `${Math.round(nearest.distance)} m` : `${(nearest.distance/1000).toFixed(1)} km`
    Alert.alert('📍 Nærmeste park!', `${nearest.name} er ${dist} unna.`)
    setLocating(false)
  }
  const doCheckin = async () => {
    if (!selectedPark) { Alert.alert('Velg en park'); return }
    if (!selectedDog) { Alert.alert('Velg hvilken hund'); return }
    setLoading(true)
    const { error } = await supabase.from('checkins').insert({ park_id: selectedPark.id, user_id: user!.id, dog_id: selectedDog.id })
    setLoading(false)
    if (error) { Alert.alert('Feil', error.message); return }
    Alert.alert('🐾 Sjekket inn!', `${selectedDog.name} er nå i ${selectedPark.name}!`)
    setSelectedPark(null); setSelectedDog(null); setSearch('')
    checkActiveCheckin(); fetchCheckins()
  }
  const doCheckout = async () => {
    if (!activeCheckin) return
    await supabase.from('checkins').update({ checked_out_at: new Date().toISOString() }).eq('id', activeCheckin.id)
    setActiveCheckin(null); fetchCheckins()
    Alert.alert('👋 Sjekket ut!')
  }

  return (
    <ImageBackground source={require('../../assets/bg.jpg')} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Innsjekking 📍</Text>
        {activeCheckin ? (
          <View style={styles.activeCard}>
            <Text style={styles.activeTitle}>🐾 Du er i parken!</Text>
            <Text style={styles.activePark}>{activeCheckin.parks?.name}</Text>
            <TouchableOpacity style={styles.checkoutBtn} onPress={doCheckout}>
              <Text style={styles.checkoutBtnText}>👋 Sjekk ut</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.checkinCard}>
            <TouchableOpacity style={styles.gpsBtn} onPress={findNearestPark} disabled={locating}>
              {locating ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.gpsBtnText}>🎯 Finn nærmeste park automatisk</Text>}
            </TouchableOpacity>
            {selectedPark ? (
              <View style={styles.selectedPark}>
                <Text style={styles.selectedParkText}>🌳 {selectedPark.name}</Text>
                <TouchableOpacity onPress={() => { setSelectedPark(null); setSearch('') }}>
                  <Text style={{ color: Colors.gray }}>Endre</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.sectionLabel}>Eller søk etter park</Text>
                <TextInput style={styles.searchInput} placeholder="🔍 Skriv parknavn eller by..." value={search} onChangeText={setSearch} placeholderTextColor={Colors.gray} />
                {filteredParks.slice(0, 5).map(park => (
                  <TouchableOpacity key={park.id} style={styles.parkResult} onPress={() => { setSelectedPark(park); setSearch('') }}>
                    <Text style={styles.parkResultName}>🌳 {park.name}</Text>
                    <Text style={styles.parkResultCity}>{park.city}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
            <Text style={[styles.sectionLabel, { marginTop: Spacing.md }]}>Velg hund</Text>
            {dogs.length === 0 ? (
              <TouchableOpacity style={styles.noDogBtn} onPress={() => navigation.navigate('AddDog')}>
                <Text style={styles.noDogText}>+ Legg til hund først</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
                {dogs.map(dog => (
                  <TouchableOpacity key={dog.id} style={[styles.dogChip, selectedDog?.id === dog.id && styles.dogChipActive]} onPress={() => setSelectedDog(dog)}>
                    <Text style={[styles.dogChipText, selectedDog?.id === dog.id && styles.dogChipTextActive]}>🐕 {dog.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity style={styles.checkinBtn} onPress={doCheckin} disabled={loading}>
              {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.checkinBtnText}>📍 Sjekk inn nå!</Text>}
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.sectionTitle}>Hvem er ute nå? 🐾</Text>
        {checkins.length === 0 ? (
          <Text style={styles.emptyText}>Ingen er ute akkurat nå – bli den første!</Text>
        ) : (
          checkins.map(c => (
            <View key={c.id} style={styles.checkinItem}>
              <Text style={{ fontSize: 32 }}>🐕</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.checkinDog}>{c.dogs?.name ?? 'Ukjent hund'}</Text>
                <Text style={styles.checkinPark}>📍 {c.parks?.name}</Text>
                <Text style={styles.checkinTime}>{new Date(c.checked_in_at).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
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
  container: { flex: 1, padding: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.dark, marginTop: 60, marginBottom: Spacing.lg },
  activeCard: { backgroundColor: Colors.green, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg },
  activeTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.white },
  activePark: { fontSize: FontSize.md, color: Colors.white, opacity: 0.9, marginTop: 4 },
  checkoutBtn: { backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.lg, paddingHorizontal: Spacing.xl },
  checkoutBtnText: { color: Colors.green, fontWeight: '700', fontSize: FontSize.md },
  checkinCard: { backgroundColor: 'rgba(255,255,255,1.0)', borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.lg },
  gpsBtn: { backgroundColor: Colors.green, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.md },
  gpsBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
  selectedPark: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.greenPale, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  selectedParkText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.dark },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray, marginBottom: Spacing.sm },
  searchInput: { backgroundColor: Colors.grayLight, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.dark, marginBottom: Spacing.sm },
  parkResult: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.grayLight, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 6 },
  parkResultName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.dark },
  parkResultCity: { fontSize: FontSize.xs, color: Colors.gray },
  dogChip: { borderWidth: 2, borderColor: Colors.grayLight, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 8, backgroundColor: Colors.white },
  dogChipActive: { borderColor: Colors.green, backgroundColor: Colors.greenPale },
  dogChipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.dark },
  dogChipTextActive: { color: Colors.green },
  checkinBtn: { backgroundColor: Colors.green, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.lg },
  checkinBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
  noDogBtn: { borderWidth: 2, borderColor: Colors.green, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  noDogText: { color: Colors.green, fontWeight: '700' },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.dark, marginBottom: Spacing.md },
  emptyText: { color: Colors.gray, fontStyle: 'italic', textAlign: 'center', padding: Spacing.lg },
  checkinItem: { flexDirection: 'row', gap: Spacing.md, backgroundColor: 'rgba(255,255,255,1.0)', borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.md, alignItems: 'center' },
  checkinDog: { fontSize: FontSize.md, fontWeight: '800', color: Colors.dark },
  checkinPark: { fontSize: FontSize.sm, color: Colors.gray },
  checkinTime: { fontSize: FontSize.xs, color: Colors.gray },
})
