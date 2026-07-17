import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, Modal, KeyboardAvoidingView, Platform, Linking } from 'react-native'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Colors, Spacing, Radius, FontSize } from '../lib/theme'
import { AFFILIATE, AFFILIATE_DISCLOSURE } from '../lib/affiliate'

const VACCINE_PRESETS = ['DHPPI', 'Rabies', 'Kennelhoste', 'Leptospirose', 'Borreliose']

function formatDateNo(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })
}

function parseNorDate(input: string): string | null {
  // DD.MM.ÅÅÅÅ -> ÅÅÅÅ-MM-DD
  const parts = input.split('.')
  if (parts.length !== 3) return null
  const [d, m, y] = parts
  if (d.length !== 2 || m.length !== 2 || y.length !== 4) return null
  return `${y}-${m}-${d}`
}

function isoToNor(iso: string | null): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

export default function DogHealthScreen({ navigation }: any) {
  const { dogs, fetchDogs } = useAuthStore()
  const [selectedDog, setSelectedDog] = useState<any>(null)
  const [vaccinations, setVaccinations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Edit modal state
  const [editField, setEditField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  // Vaccine modal state
  const [showVaccineModal, setShowVaccineModal] = useState(false)
  const [editingVaccine, setEditingVaccine] = useState<any>(null)
  const [vaccineName, setVaccineName] = useState('')
  const [vaccineDate, setVaccineDate] = useState('')
  const [vaccineNextDue, setVaccineNextDue] = useState('')
  const [vaccineNotes, setVaccineNotes] = useState('')

  useEffect(() => {
    if (selectedDog) fetchVaccinations()
  }, [selectedDog])

  const fetchVaccinations = async () => {
    if (!selectedDog) return
    const { data } = await supabase
      .from('dog_vaccinations')
      .select('*')
      .eq('dog_id', selectedDog.id)
      .order('vaccine_date', { ascending: false })
    if (data) setVaccinations(data)
  }

  // Update simple field on dog
  const startEditField = (field: string, currentValue: any) => {
    setEditField(field)
    if (field === 'next_vet_visit' || field === 'neutered_date') {
      setEditValue(isoToNor(currentValue))
    } else {
      setEditValue(currentValue ?? '')
    }
  }

  const saveField = async () => {
    if (!selectedDog || !editField) return

    let valueToSave: any = editValue.trim() || null
    if (editField === 'next_vet_visit' || editField === 'neutered_date') {
      if (valueToSave) {
        const iso = parseNorDate(valueToSave)
        if (!iso) {
          Alert.alert('Ugyldig dato', 'Bruk format DD.MM.ÅÅÅÅ, f.eks. 15.06.2026')
          return
        }
        valueToSave = iso
      }
    }

    setSaving(true)
    const { error } = await supabase
      .from('dogs')
      .update({ [editField]: valueToSave })
      .eq('id', selectedDog.id)
    setSaving(false)

    if (error) { Alert.alert('Feil', error.message); return }
    await fetchDogs()
    setSelectedDog({ ...selectedDog, [editField]: valueToSave })
    setEditField(null)
  }

  const toggleNeutered = async () => {
    if (!selectedDog) return
    const newValue = !selectedDog.neutered
    const { error } = await supabase
      .from('dogs')
      .update({ neutered: newValue })
      .eq('id', selectedDog.id)
    if (error) { Alert.alert('Feil', error.message); return }
    await fetchDogs()
    setSelectedDog({ ...selectedDog, neutered: newValue })
  }

  // Vaccine handlers
  const openAddVaccine = () => {
    setEditingVaccine(null)
    setVaccineName('')
    setVaccineDate('')
    setVaccineNextDue('')
    setVaccineNotes('')
    setShowVaccineModal(true)
  }

  const openEditVaccine = (v: any) => {
    setEditingVaccine(v)
    setVaccineName(v.vaccine_name)
    setVaccineDate(isoToNor(v.vaccine_date))
    setVaccineNextDue(isoToNor(v.next_due_date))
    setVaccineNotes(v.notes ?? '')
    setShowVaccineModal(true)
  }

  const saveVaccine = async () => {
    if (!selectedDog) return
    if (!vaccineName.trim()) { Alert.alert('Skriv inn navn på vaksinen'); return }
    if (!vaccineDate.trim()) { Alert.alert('Skriv inn dato for vaksinen'); return }

    const dateIso = parseNorDate(vaccineDate.trim())
    if (!dateIso) { Alert.alert('Ugyldig dato', 'Bruk format DD.MM.ÅÅÅÅ'); return }

    let nextDueIso = null
    if (vaccineNextDue.trim()) {
      nextDueIso = parseNorDate(vaccineNextDue.trim())
      if (!nextDueIso) { Alert.alert('Ugyldig dato', 'Bruk format DD.MM.ÅÅÅÅ for neste vaksine'); return }
    }

    setSaving(true)
    const payload = {
      dog_id: selectedDog.id,
      vaccine_name: vaccineName.trim(),
      vaccine_date: dateIso,
      next_due_date: nextDueIso,
      notes: vaccineNotes.trim() || null,
    }

    const { error } = editingVaccine
      ? await supabase.from('dog_vaccinations').update(payload).eq('id', editingVaccine.id)
      : await supabase.from('dog_vaccinations').insert(payload)

    setSaving(false)
    if (error) { Alert.alert('Feil', error.message); return }

    setShowVaccineModal(false)
    fetchVaccinations()
  }

  const deleteVaccine = (v: any) => {
    Alert.alert('Slett vaksine', `Slette "${v.vaccine_name}"?`, [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Slett', style: 'destructive', onPress: async () => {
        await supabase.from('dog_vaccinations').delete().eq('id', v.id)
        fetchVaccinations()
      }},
    ])
  }

  // No dogs
  if (dogs.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>◀ Tilbake</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📋 Veterinærkort</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 64 }}>🐶</Text>
          <Text style={styles.emptyTitle}>Ingen hunder enda</Text>
          <Text style={styles.emptyDesc}>Legg til en hund i Profil-fanen for å se Veterinærkort.</Text>
        </View>
      </View>
    )
  }

  // Pick dog
  if (!selectedDog) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>◀ Tilbake</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📋 Veterinærkort</Text>
        </View>
        <ScrollView style={styles.scroll}>
          <Text style={styles.sectionLabel}>Velg hund</Text>
          {dogs.map(dog => (
            <TouchableOpacity key={dog.id} style={styles.dogRow} onPress={() => setSelectedDog(dog)}>
              {dog.photo_url ? (
                <Image source={{ uri: dog.photo_url }} style={styles.dogPhoto} />
              ) : (
                <View style={styles.dogPhotoPlaceholder}><Text style={{ fontSize: 28 }}>🐕</Text></View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.dogRowName}>{dog.name}</Text>
                <Text style={styles.dogRowStatus}>
                  {(dog as any).next_vet_visit ? `Neste vet: ${formatDateNo((dog as any).next_vet_visit)}` : 'Trykk for å åpne'}
                </Text>
              </View>
              <Text style={styles.dogRowArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    )
  }

  // Main view
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setSelectedDog(null)}
        >
          <Text style={styles.backText}>◀ Tilbake</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📋 Veterinærkort</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Dog summary */}
        <View style={styles.dogCard}>
          {selectedDog.photo_url ? (
            <Image source={{ uri: selectedDog.photo_url }} style={styles.dogCardPhoto} />
          ) : (
            <View style={styles.dogCardPhotoPlaceholder}><Text style={{ fontSize: 40 }}>🐕</Text></View>
          )}
          <Text style={styles.dogCardName}>{selectedDog.name}</Text>
          {selectedDog.breed && <Text style={styles.dogCardBreed}>{selectedDog.breed}</Text>}
        </View>

        {/* Neste vet-time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Neste vet-time</Text>
          <TouchableOpacity style={styles.fieldCard} onPress={() => startEditField('next_vet_visit', selectedDog.next_vet_visit)}>
            <Text style={selectedDog.next_vet_visit ? styles.fieldValue : styles.fieldEmpty}>
              {selectedDog.next_vet_visit ? formatDateNo(selectedDog.next_vet_visit) : 'Ingen avtale satt – trykk for å legge til'}
            </Text>
            <Text style={styles.fieldEdit}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Kastrert */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔪 Kastrert?</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.toggleBtn, !selectedDog.neutered && styles.toggleBtnActive]}
              onPress={() => selectedDog.neutered && toggleNeutered()}
            >
              <Text style={[styles.toggleBtnText, !selectedDog.neutered && styles.toggleBtnTextActive]}>Nei</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, selectedDog.neutered && styles.toggleBtnActive]}
              onPress={() => !selectedDog.neutered && toggleNeutered()}
            >
              <Text style={[styles.toggleBtnText, selectedDog.neutered && styles.toggleBtnTextActive]}>Ja</Text>
            </TouchableOpacity>
          </View>
          {selectedDog.neutered && (
            <TouchableOpacity style={[styles.fieldCard, { marginTop: Spacing.sm }]} onPress={() => startEditField('neutered_date', selectedDog.neutered_date)}>
              <Text style={selectedDog.neutered_date ? styles.fieldValue : styles.fieldEmpty}>
                {selectedDog.neutered_date ? `Dato: ${formatDateNo(selectedDog.neutered_date)}` : 'Legg til dato'}
              </Text>
              <Text style={styles.fieldEdit}>✏️</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Vaksiner */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💉 Vaksiner</Text>
            <TouchableOpacity style={styles.addBtnSmall} onPress={openAddVaccine}>
              <Text style={styles.addBtnSmallText}>+ Legg til</Text>
            </TouchableOpacity>
          </View>
          {vaccinations.length === 0 ? (
            <View style={styles.fieldCard}>
              <Text style={styles.fieldEmpty}>Ingen vaksiner registrert</Text>
            </View>
          ) : (
            vaccinations.map(v => (
              <TouchableOpacity key={v.id} style={styles.vaccineCard} onPress={() => openEditVaccine(v)} onLongPress={() => deleteVaccine(v)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vaccineName}>{v.vaccine_name}</Text>
                  <Text style={styles.vaccineDate}>{formatDateNo(v.vaccine_date)}</Text>
                  {v.next_due_date && (
                    <Text style={styles.vaccineNextDue}>Neste: {formatDateNo(v.next_due_date)}</Text>
                  )}
                  {v.notes && <Text style={styles.vaccineNotes}>{v.notes}</Text>}
                </View>
                <Text style={styles.fieldEdit}>›</Text>
              </TouchableOpacity>
            ))
          )}
          <Text style={styles.hint}>Trykk på en vaksine for å endre. Hold inne for å slette.</Text>
        </View>

        {/* Allergier */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤧 Allergier</Text>
          <TouchableOpacity style={styles.fieldCard} onPress={() => startEditField('allergies', selectedDog.allergies)}>
            <Text style={selectedDog.allergies ? styles.fieldValue : styles.fieldEmpty}>
              {selectedDog.allergies || 'Ingen allergier registrert'}
            </Text>
            <Text style={styles.fieldEdit}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Medisiner */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💊 Medisiner</Text>
          <TouchableOpacity style={styles.fieldCard} onPress={() => startEditField('medications', selectedDog.medications)}>
            <Text style={selectedDog.medications ? styles.fieldValue : styles.fieldEmpty}>
              {selectedDog.medications || 'Ingen medisiner registrert'}
            </Text>
            <Text style={styles.fieldEdit}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Helsenotater */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Helsenotater</Text>
          <TouchableOpacity style={styles.fieldCard} onPress={() => startEditField('health_notes', selectedDog.health_notes)}>
            <Text style={selectedDog.health_notes ? styles.fieldValue : styles.fieldEmpty}>
              {selectedDog.health_notes || 'Ingen notater'}
            </Text>
            <Text style={styles.fieldEdit}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Trygghet (forsikring – affiliate) */}
        <View style={styles.insuranceSection}>
          <Text style={styles.insuranceTitle}>🛡️ Trygghet for {selectedDog.name}</Text>
          <Text style={styles.insuranceBody}>
            Akutt-veterinærhjelp kan koste 20 000 kr eller mer. Hundeforsikring dekker uventede helseutgifter.
          </Text>
          <TouchableOpacity style={styles.insuranceBtn} onPress={() => Linking.openURL(AFFILIATE.agria)}>
            <Text style={styles.insuranceBtnText}>Sjekk hundeforsikring →</Text>
          </TouchableOpacity>
          <Text style={styles.disclosureText}>
            {AFFILIATE_DISCLOSURE}
          </Text>
        </View>
      </ScrollView>

      {/* Edit modal for simple fields */}
      <Modal visible={editField !== null} transparent animationType="slide" onRequestClose={() => setEditField(null)}>
        <KeyboardAvoidingView style={styles.modalBg} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editField === 'allergies' && 'Allergier'}
              {editField === 'medications' && 'Medisiner'}
              {editField === 'health_notes' && 'Helsenotater'}
              {editField === 'next_vet_visit' && 'Neste vet-time'}
              {editField === 'neutered_date' && 'Kastreringsdato'}
            </Text>
            <TextInput
              style={(editField === 'next_vet_visit' || editField === 'neutered_date') ? styles.modalInput : styles.modalTextarea}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={(editField === 'next_vet_visit' || editField === 'neutered_date') ? 'DD.MM.ÅÅÅÅ' : 'Skriv...'}
              placeholderTextColor={Colors.gray}
              multiline={editField !== 'next_vet_visit' && editField !== 'neutered_date'}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditField(null)}>
                <Text style={styles.cancelBtnText}>Avbryt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveField} disabled={saving}>
                {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.saveBtnText}>Lagre</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Vaccine modal */}
      <Modal visible={showVaccineModal} transparent animationType="slide" onRequestClose={() => setShowVaccineModal(false)}>
        <KeyboardAvoidingView style={styles.modalBg} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView style={styles.modalScrollCard} contentContainerStyle={{ padding: Spacing.lg }}>
            <Text style={styles.modalTitle}>{editingVaccine ? 'Endre vaksine' : 'Ny vaksine'}</Text>

            <Text style={styles.label}>Vaksinetype</Text>
            <View style={styles.presetRow}>
              {VACCINE_PRESETS.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.presetChip, vaccineName === p && styles.presetChipActive]}
                  onPress={() => setVaccineName(p)}
                >
                  <Text style={[styles.presetChipText, vaccineName === p && styles.presetChipTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Eller skriv inn et annet navn"
              value={vaccineName}
              onChangeText={setVaccineName}
              placeholderTextColor={Colors.gray}
            />

            <Text style={styles.label}>Dato (DD.MM.ÅÅÅÅ)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="F.eks. 15.03.2026"
              value={vaccineDate}
              onChangeText={setVaccineDate}
              keyboardType="numbers-and-punctuation"
              placeholderTextColor={Colors.gray}
            />

            <Text style={styles.label}>Neste vaksine (valgfritt)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="DD.MM.ÅÅÅÅ"
              value={vaccineNextDue}
              onChangeText={setVaccineNextDue}
              keyboardType="numbers-and-punctuation"
              placeholderTextColor={Colors.gray}
            />

            <Text style={styles.label}>Notater (valgfritt)</Text>
            <TextInput
              style={styles.modalTextarea}
              placeholder="F.eks. produktnavn, dyrlege..."
              value={vaccineNotes}
              onChangeText={setVaccineNotes}
              multiline
              placeholderTextColor={Colors.gray}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowVaccineModal(false)}>
                <Text style={styles.cancelBtnText}>Avbryt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveVaccine} disabled={saving}>
                {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.saveBtnText}>Lagre</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
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
  dogCardPhoto: { width: 80, height: 80, borderRadius: 40 },
  dogCardPhotoPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.greenPale, alignItems: 'center', justifyContent: 'center' },
  dogCardName: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.dark, marginTop: Spacing.sm },
  dogCardBreed: { fontSize: FontSize.sm, color: Colors.gray },

  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.dark, marginBottom: Spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  fieldCard: { backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fieldValue: { fontSize: FontSize.sm, color: Colors.dark, flex: 1, lineHeight: 20 },
  fieldEmpty: { fontSize: FontSize.sm, color: Colors.gray, fontStyle: 'italic', flex: 1 },
  fieldEdit: { fontSize: 16, color: Colors.gray, marginLeft: Spacing.sm },
  hint: { fontSize: FontSize.xs, color: Colors.gray, marginTop: Spacing.sm, fontStyle: 'italic' },

  row: { flexDirection: 'row', gap: Spacing.sm },
  toggleBtn: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.grayLight },
  toggleBtnActive: { backgroundColor: Colors.green, borderColor: Colors.green },
  toggleBtnText: { fontWeight: '700', color: Colors.dark },
  toggleBtnTextActive: { color: Colors.white },

  addBtnSmall: { backgroundColor: Colors.green, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  addBtnSmallText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },

  vaccineCard: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, alignItems: 'center' },
  vaccineName: { fontSize: FontSize.md, fontWeight: '800', color: Colors.dark },
  vaccineDate: { fontSize: FontSize.xs, color: Colors.gray, marginTop: 2 },
  vaccineNextDue: { fontSize: FontSize.xs, color: Colors.amber, fontWeight: '600', marginTop: 2 },
  vaccineNotes: { fontSize: FontSize.xs, color: Colors.dark, marginTop: Spacing.sm, lineHeight: 16 },

  // Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.lg, paddingBottom: 40 },
  modalScrollCard: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.dark, marginBottom: Spacing.lg },
  modalInput: { backgroundColor: Colors.grayLight, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.dark, marginBottom: Spacing.md },
  modalTextarea: { backgroundColor: Colors.grayLight, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.dark, marginBottom: Spacing.md, minHeight: 100, textAlignVertical: 'top' },
  label: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  modalActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  cancelBtn: { flex: 1, backgroundColor: Colors.grayLight, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  cancelBtnText: { color: Colors.dark, fontWeight: '600' },
  saveBtn: { flex: 2, backgroundColor: Colors.green, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  saveBtnText: { color: Colors.white, fontWeight: '700' },

  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },
  presetChip: { backgroundColor: Colors.grayLight, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  presetChipActive: { backgroundColor: Colors.green },
  presetChipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.dark },
  presetChipTextActive: { color: Colors.white },

  // Trygghet (forsikring – diskret affiliate)
  insuranceSection: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.sm, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.greenPale },
  insuranceTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.dark, marginBottom: Spacing.sm },
  insuranceBody: { fontSize: FontSize.sm, color: Colors.dark, lineHeight: 20, marginBottom: Spacing.md },
  insuranceBtn: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.green, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  insuranceBtnText: { color: Colors.green, fontWeight: '700', fontSize: FontSize.sm },
  disclosureText: { fontSize: 10, color: Colors.gray, marginTop: Spacing.sm, textAlign: 'center', fontStyle: 'italic' },
})
