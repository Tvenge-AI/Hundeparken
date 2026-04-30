import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, ImageBackground } from 'react-native'
import * as Location from 'expo-location'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Colors, Spacing, Radius, FontSize } from '../lib/theme'

export default function SuggestParkScreen({ navigation }: any) {
  const { user } = useAuthStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [fenced, setFenced] = useState(false)
  const [parking, setParking] = useState(false)
  const [water, setWater] = useState(false)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)

  const getLocation = async () => {
    setLocating(true)
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') { Alert.alert('Gi tilgang til stedstjenester'); setLocating(false); return }
    const loc = await Location.getCurrentPositionAsync({})
    setLat(loc.coords.latitude)
    setLng(loc.coords.longitude)

    // Prøv å finne adresse fra koordinater
    try {
      const geo = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
      if (geo[0]) {
        setAddress(geo[0].street ?? '')
        setCity(geo[0].city ?? geo[0].region ?? '')
      }
    } catch {}
    setLocating(false)
    Alert.alert('📍 Posisjon hentet!', 'Din nåværende posisjon er registrert.')
  }

  const submit = async () => {
    if (!name.trim()) { Alert.alert('Fyll inn navn på parken'); return }
    if (!lat || !lng) { Alert.alert('Hent posisjon først', 'Trykk på "Hent min posisjon" for å registrere parkens plassering.'); return }
    if (!user) return

    setLoading(true)
    const { error } = await supabase.from('park_suggestions').insert({
      submitter_id: user.id,
      name: name.trim(),
      description: description || null,
      address: address || null,
      city: city || null,
      lat,
      lng,
      fenced,
      status: 'pending',
    })
    setLoading(false)

    if (error) { Alert.alert('Feil', error.message); return }

    // Legg direkte inn som pending park på kartet
    await supabase.from('parks').insert({
      name: name.trim(),
      description: description || null,
      address: address || null,
      city: city || null,
      lat,
      lng,
      fenced,
      parking,
      water,
      status: 'pending',
    })

    Alert.alert(
      '🎉 Takk!',
      `${name} er sendt inn og vises på kartet med gult merke. Den blir automatisk godkjent når nok hundeeiere har sjekket inn der!`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    )
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Foreslå hundepark 🌳</Text>
        <Text style={styles.subtitle}>Kjenner du en hundepark som ikke er i appen? Legg den til!</Text>

        {/* Hent posisjon */}
        <TouchableOpacity style={styles.gpsBtn} onPress={getLocation} disabled={locating}>
          {locating
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={styles.gpsBtnText}>📍 {lat ? '✅ Posisjon hentet!' : 'Hent parkens posisjon (stå i parken)'}</Text>
          }
        </TouchableOpacity>

        {lat && (
          <View style={styles.coordBox}>
            <Text style={styles.coordText}>📌 {lat.toFixed(5)}, {lng?.toFixed(5)}</Text>
          </View>
        )}

        <Text style={styles.label}>Navn på parken *</Text>
        <TextInput style={styles.input} placeholder="F.eks. Nordre Åsen Hundepark" value={name} onChangeText={setName} />

        <Text style={styles.label}>By/sted</Text>
        <TextInput style={styles.input} placeholder="F.eks. Oslo" value={city} onChangeText={setCity} />

        <Text style={styles.label}>Adresse</Text>
        <TextInput style={styles.input} placeholder="F.eks. Nordre Åsen vei 12" value={address} onChangeText={setAddress} />

        <Text style={styles.label}>Beskrivelse (valgfritt)</Text>
        <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Fortell litt om parken..." value={description} onChangeText={setDescription} multiline />

        <Text style={styles.label}>Fasiliteter</Text>
        <View style={styles.facilityRow}>
          <TouchableOpacity style={[styles.facilityChip, fenced && styles.facilityChipActive]} onPress={() => setFenced(!fenced)}>
            <Text style={[styles.facilityText, fenced && styles.facilityTextActive]}>🔒 Inngjerdet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.facilityChip, parking && styles.facilityChipActive]} onPress={() => setParking(!parking)}>
            <Text style={[styles.facilityText, parking && styles.facilityTextActive]}>🅿️ Parkering</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.facilityChip, water && styles.facilityChipActive]} onPress={() => setWater(!water)}>
            <Text style={[styles.facilityText, water && styles.facilityTextActive]}>💧 Vann</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>🤖 Parken legges automatisk til på kartet med gult merke. Den blir godkjent etter 3 innsjekk fra forskjellige brukere!</Text>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitBtnText}>🌳 Send inn park</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Avbryt</Text>
        </TouchableOpacity>
        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream, padding: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.dark, marginTop: 60, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.sm, color: Colors.gray, marginBottom: Spacing.lg, lineHeight: 20 },
  gpsBtn: { backgroundColor: Colors.green, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.sm },
  gpsBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
  coordBox: { backgroundColor: Colors.greenPale, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', marginBottom: Spacing.md },
  coordText: { fontSize: FontSize.xs, color: Colors.green, fontWeight: '600' },
  label: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.dark, marginBottom: Spacing.sm, marginTop: Spacing.md },
  input: { backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.dark, borderWidth: 1.5, borderColor: Colors.grayLight },
  facilityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  facilityChip: { borderWidth: 2, borderColor: Colors.grayLight, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 8, backgroundColor: Colors.white },
  facilityChipActive: { borderColor: Colors.green, backgroundColor: Colors.greenPale },
  facilityText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.dark },
  facilityTextActive: { color: Colors.green },
  infoBox: { backgroundColor: '#FFF9E6', borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.lg, borderWidth: 1.5, borderColor: Colors.amber },
  infoText: { fontSize: FontSize.sm, color: Colors.brown, lineHeight: 20 },
  submitBtn: { backgroundColor: Colors.green, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.lg },
  submitBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
  cancelBtn: { padding: Spacing.md, alignItems: 'center', marginTop: Spacing.sm },
  cancelText: { color: Colors.gray, fontSize: FontSize.sm },
})
