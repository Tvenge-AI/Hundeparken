import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Linking, Image } from 'react-native'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Colors, Spacing, Radius, FontSize } from '../lib/theme'
import { AFFILIATE } from '../lib/affiliate'

// Hjelpefunksjon: valider chip-format (15 siffer er ISO 11784-standarden)
function validateChipId(id: string): boolean {
  const cleaned = id.replace(/\s/g, '')
  return /^\d{15}$/.test(cleaned)
}

function formatChipId(id: string | null): string {
  if (!id) return ''
  // Vis som: 578 098 100012345 (land + produsent + ID for lesbarhet)
  const cleaned = id.replace(/\s/g, '')
  if (cleaned.length !== 15) return cleaned
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
}

export default function DogChipScreen({ navigation }: any) {
  const { dogs, fetchDogs } = useAuthStore()
  const [selectedDog, setSelectedDog] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [chipInput, setChipInput] = useState('')
  const [saving, setSaving] = useState(false)

  const startEdit = (dog: any) => {
    setChipInput(dog.chip_id ?? '')
    setEditing(true)
  }

  const saveChip = async () => {
    if (!selectedDog) return
    const cleaned = chipInput.replace(/\s/g, '').trim()

    if (cleaned && !validateChipId(cleaned)) {
      Alert.alert('Ugyldig format', 'Chip-ID må være 15 sifre (uten bokstaver eller bindestrek).')
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('dogs')
      .update({ chip_id: cleaned || null })
      .eq('id', selectedDog.id)
    setSaving(false)

    if (error) { Alert.alert('Feil', error.message); return }

    await fetchDogs()
    // Oppdater lokal state
    setSelectedDog({ ...selectedDog, chip_id: cleaned || null })
    setEditing(false)
    Alert.alert('✅ Lagret', cleaned ? 'Chip-ID er oppdatert.' : 'Chip-ID er fjernet.')
  }

  const openDyreID = () => {
    Linking.openURL(AFFILIATE.dyreid)
  }

  // Ingen hunder
  if (dogs.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>◀ Tilbake</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📡 Chip-ID</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 64 }}>🐶</Text>
          <Text style={styles.emptyTitle}>Ingen hunder enda</Text>
          <Text style={styles.emptyDesc}>Legg til en hund i Profil-fanen for å registrere Chip-ID.</Text>
        </View>
      </View>
    )
  }

  // Velg hund (om flere)
  if (!selectedDog) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>◀ Tilbake</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📡 Chip-ID</Text>
        </View>
        <ScrollView style={styles.scroll}>
          <Text style={styles.sectionLabel}>Velg hund</Text>
          {dogs.map(dog => (
            <TouchableOpacity key={dog.id} style={styles.dogRow} onPress={() => setSelectedDog(dog)}>
              {dog.photo_url ? (
                <Image source={{ uri: dog.photo_url }} style={styles.dogPhoto} />
              ) : (
                <View style={styles.dogPhotoPlaceholder}>
                  <Text style={{ fontSize: 28 }}>🐕</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.dogRowName}>{dog.name}</Text>
                <Text style={styles.dogRowStatus}>
                  {dog.chip_id ? '✅ Chip registrert' : '⚪ Ingen chip registrert'}
                </Text>
              </View>
              <Text style={styles.dogRowArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    )
  }

  // Hovedvisning per hund
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setSelectedDog(null)}
        >
          <Text style={styles.backText}>◀ Tilbake</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📡 Chip-ID</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Hund-info øverst */}
        <View style={styles.dogCard}>
          {selectedDog.photo_url ? (
            <Image source={{ uri: selectedDog.photo_url }} style={styles.dogCardPhoto} />
          ) : (
            <View style={styles.dogCardPhotoPlaceholder}>
              <Text style={{ fontSize: 40 }}>🐕</Text>
            </View>
          )}
          <Text style={styles.dogCardName}>{selectedDog.name}</Text>
          {selectedDog.breed && <Text style={styles.dogCardBreed}>{selectedDog.breed}</Text>}
        </View>

        {/* Chip-status */}
        <View style={styles.chipCard}>
          {editing ? (
            <>
              <Text style={styles.label}>Skriv inn Chip-ID (15 sifre)</Text>
              <TextInput
                style={styles.input}
                placeholder="F.eks. 578098100012345"
                value={chipInput}
                onChangeText={setChipInput}
                keyboardType="number-pad"
                maxLength={19} // 15 siffer + 4 mellomrom
              />
              <Text style={styles.hint}>
                Du finner Chip-ID på vaksinasjonskort, hos veterinæren, eller i ditt DyreID-passord.
              </Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                  <Text style={styles.cancelBtnText}>Avbryt</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={saveChip} disabled={saving}>
                  {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.saveBtnText}>Lagre</Text>}
                </TouchableOpacity>
              </View>
            </>
          ) : selectedDog.chip_id ? (
            <>
              <Text style={styles.statusOk}>✅ Chip-ID registrert</Text>
              <Text style={styles.chipDisplay}>{formatChipId(selectedDog.chip_id)}</Text>
              <TouchableOpacity style={styles.editBtn} onPress={() => startEdit(selectedDog)}>
                <Text style={styles.editBtnText}>✏️ Endre</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.statusNone}>⚪ Ingen Chip-ID registrert</Text>
              <Text style={styles.hint}>
                Registrer hundens Chip-ID for å ha den lett tilgjengelig hvis hunden skulle bli borte.
              </Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => startEdit(selectedDog)}>
                <Text style={styles.addBtnText}>+ Legg til Chip-ID</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Om Chip-ID</Text>
          <Text style={styles.infoText}>
            Alle norske hunder skal være ID-merket. Chip-ID er et 15-sifret nummer som er unikt for hver hund.
            Det er registrert i DyreID-registeret og hjelper deg å finne hunden om den blir borte.
          </Text>
          <TouchableOpacity style={styles.dyreIdBtn} onPress={openDyreID}>
            <Text style={styles.dyreIdBtnText}>🔍 Søk i DyreID-registeret</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: { backgroundColor: Colors.green, paddingTop: 60, paddingBottom: 20, paddingHorizontal: Spacing.md, flexDirection: 'row', alignItems: 'center' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  backText: { color: Colors.white, fontWeight: '700' },
  headerTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '800', marginLeft: Spacing.md },
  scroll: { flex: 1, paddingHorizontal: Spacing.md },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray, marginTop: Spacing.lg, marginBottom: Spacing.md, textTransform: 'uppercase' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.dark },
  emptyDesc: { fontSize: FontSize.sm, color: Colors.gray, textAlign: 'center' },

  dogRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.md },
  dogPhoto: { width: 56, height: 56, borderRadius: 28 },
  dogPhotoPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.greenPale, alignItems: 'center', justifyContent: 'center' },
  dogRowName: { fontSize: FontSize.md, fontWeight: '800', color: Colors.dark },
  dogRowStatus: { fontSize: FontSize.xs, color: Colors.gray, marginTop: 2 },
  dogRowArrow: { fontSize: 28, color: Colors.gray },

  dogCard: { alignItems: 'center', marginTop: Spacing.lg, marginBottom: Spacing.md, gap: Spacing.sm },
  dogCardPhoto: { width: 100, height: 100, borderRadius: 50 },
  dogCardPhotoPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.greenPale, alignItems: 'center', justifyContent: 'center' },
  dogCardName: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.dark, marginTop: Spacing.sm },
  dogCardBreed: { fontSize: FontSize.sm, color: Colors.gray },

  chipCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.md },
  statusOk: { fontSize: FontSize.md, fontWeight: '700', color: Colors.green, marginBottom: Spacing.md },
  statusNone: { fontSize: FontSize.md, fontWeight: '700', color: Colors.gray, marginBottom: Spacing.sm },
  chipDisplay: { fontSize: 24, fontWeight: '900', color: Colors.dark, fontFamily: 'Menlo', letterSpacing: 2, marginBottom: Spacing.md, textAlign: 'center' },
  hint: { fontSize: FontSize.xs, color: Colors.gray, lineHeight: 18, marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.dark, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.grayLight, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.dark, marginBottom: Spacing.sm, fontFamily: 'Menlo', letterSpacing: 1 },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  cancelBtn: { flex: 1, backgroundColor: Colors.grayLight, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  cancelBtnText: { color: Colors.dark, fontWeight: '600' },
  saveBtn: { flex: 2, backgroundColor: Colors.green, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  saveBtnText: { color: Colors.white, fontWeight: '700' },
  addBtn: { backgroundColor: Colors.green, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  addBtnText: { color: Colors.white, fontWeight: '700' },
  editBtn: { alignSelf: 'center', padding: Spacing.sm },
  editBtnText: { color: Colors.green, fontWeight: '700' },

  infoCard: { backgroundColor: Colors.greenPale, borderRadius: Radius.xl, padding: Spacing.lg },
  infoTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.dark, marginBottom: Spacing.sm },
  infoText: { fontSize: FontSize.sm, color: Colors.dark, lineHeight: 20, marginBottom: Spacing.md },
  dyreIdBtn: { backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.green },
  dyreIdBtnText: { color: Colors.green, fontWeight: '700' },
})
