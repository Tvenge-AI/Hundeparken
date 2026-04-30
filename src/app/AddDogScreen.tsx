import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Image } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Colors, Spacing, Radius, FontSize } from '../lib/theme'

const SIZES = ['liten', 'middels', 'stor']
const TEMPERAMENTS = ['sosial', 'leken', 'rolig', 'sky', 'aktiv']

export default function AddDogScreen({ navigation }: any) {
  const { user, fetchDogs } = useAuthStore()
  const [name, setName] = useState('')
  const [breed, setBreed] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [size, setSize] = useState('')
  const [temperament, setTemperament] = useState<string[]>([])
  const [photo, setPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const toggleTemp = (t: string) => {
    setTemperament(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') { Alert.alert('Vi trenger tilgang til bildene dine'); return }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
    })
    if (!result.canceled) setPhoto(result.assets[0].uri)
  }

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') { Alert.alert('Vi trenger tilgang til kameraet'); return }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
    })
    if (!result.canceled) setPhoto(result.assets[0].uri)
  }

  const save = async () => {
    if (!name.trim()) { Alert.alert('Fyll inn navn på hunden'); return }
    if (!user) return

    // Valider dato format DD.MM.ÅÅÅÅ
    if (birthdate) {
      const parts = birthdate.split('.')
      if (parts.length !== 3 || parts[0].length !== 2 || parts[1].length !== 2 || parts[2].length !== 4) {
        Alert.alert('Ugyldig dato', 'Bruk format DD.MM.ÅÅÅÅ, f.eks. 15.03.2022')
        return
      }
    }

    setLoading(true)

    let photo_url = null
    if (photo) {
      try {
        const base64 = await FileSystem.readAsStringAsync(photo, {
          encoding: FileSystem.EncodingType.Base64,
        })
        photo_url = `data:image/jpeg;base64,${base64}`
      } catch (e) {
        console.log('Bilde feil:', e)
      }
    }

    // Konverter DD.MM.ÅÅÅÅ til ÅÅÅÅ-MM-DD
    let birthdate_iso = null
    if (birthdate) {
      const [d, m, y] = birthdate.split('.')
      birthdate_iso = `${y}-${m}-${d}`
    }

    const { error } = await supabase.from('dogs').insert({
      owner_id: user.id,
      name: name.trim(),
      breed: breed || null,
      birthdate: birthdate_iso,
      size: size || null,
      temperament,
      photo_url,
    })
    setLoading(false)
    if (error) { Alert.alert('Feil', error.message); return }
    await fetchDogs()
    Alert.alert('🐕 Hunden er lagt til!')
    navigation.goBack()
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Legg til hund 🐶</Text>

        <TouchableOpacity style={styles.photoArea} onPress={pickImage}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={{ fontSize: 48 }}>📷</Text>
              <Text style={styles.photoText}>Trykk for å velge bilde</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.photoButtons}>
          <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
            <Text style={styles.photoBtnText}>🖼️ Galleri</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
            <Text style={styles.photoBtnText}>📸 Kamera</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Navn *</Text>
        <TextInput style={styles.input} placeholder="Hva heter hunden?" value={name} onChangeText={setName} />

        <Text style={styles.label}>Rase</Text>
        <TextInput style={styles.input} placeholder="F.eks. Labrador" value={breed} onChangeText={setBreed} />

        <Text style={styles.label}>🎂 Fødselsdato</Text>
        <TextInput
          style={styles.input}
          placeholder="DD.MM.ÅÅÅÅ – f.eks. 15.03.2022"
          value={birthdate}
          onChangeText={setBirthdate}
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.label}>Størrelse</Text>
        <View style={styles.row}>
          {SIZES.map(s => (
            <TouchableOpacity key={s} style={[styles.chip, size === s && styles.chipActive]} onPress={() => setSize(s)}>
              <Text style={[styles.chipText, size === s && styles.chipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Temperament</Text>
        <View style={styles.row}>
          {TEMPERAMENTS.map(t => (
            <TouchableOpacity key={t} style={[styles.chip, temperament.includes(t) && styles.chipActive]} onPress={() => toggleTemp(t)}>
              <Text style={[styles.chipText, temperament.includes(t) && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={save} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnText}>✅ Lagre hund</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Avbryt</Text>
        </TouchableOpacity>
        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream, padding: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.dark, marginBottom: Spacing.lg, marginTop: 60 },
  photoArea: { alignSelf: 'center', marginBottom: Spacing.md },
  photoPreview: { width: 150, height: 150, borderRadius: 75 },
  photoPlaceholder: { width: 150, height: 150, borderRadius: 75, backgroundColor: Colors.greenPale, alignItems: 'center', justifyContent: 'center' },
  photoText: { fontSize: FontSize.xs, color: Colors.gray, marginTop: 4, textAlign: 'center' },
  photoButtons: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  photoBtn: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.grayLight },
  photoBtnText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.dark },
  label: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.dark, marginBottom: Spacing.sm, marginTop: Spacing.md },
  input: { backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.dark, borderWidth: 1.5, borderColor: Colors.grayLight },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: { borderWidth: 2, borderColor: Colors.grayLight, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 8, backgroundColor: Colors.white },
  chipActive: { borderColor: Colors.green, backgroundColor: Colors.greenPale },
  chipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.dark },
  chipTextActive: { color: Colors.green },
  btn: { backgroundColor: Colors.green, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.xl },
  btnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
  cancelBtn: { padding: Spacing.md, alignItems: 'center', marginTop: Spacing.sm },
  cancelText: { color: Colors.gray, fontSize: FontSize.sm },
})
