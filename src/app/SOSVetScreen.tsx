import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors, Spacing, Radius, FontSize } from '../lib/theme'

const STORAGE_KEY = '@hundeparken_emergency_vet'

const COMMON_EMERGENCIES = [
  { emoji: '🍫', title: 'Sjokolade', desc: 'Mørk og bakesjokolade er verst. Selv små mengder kan være farlig.', urgent: true },
  { emoji: '🍇', title: 'Druer / rosiner', desc: 'Kan forårsake nyresvikt. Selv noen få druer er farlig.', urgent: true },
  { emoji: '🍬', title: 'Xylitol (sukkerfritt)', desc: 'Finnes i tyggegummi, godteri. EKSTREMT farlig — ring straks.', urgent: true },
  { emoji: '🌰', title: 'Macadamianøtter', desc: 'Kan gi forgiftning. Andre nøtter også risikable i store mengder.', urgent: false },
  { emoji: '🧅', title: 'Løk / hvitløk', desc: 'Skader røde blodceller. Også farlig i pulverform og rester.', urgent: false },
  { emoji: '☕', title: 'Kaffe / koffein', desc: 'Energidrikker og kaffegrut kan være giftig.', urgent: false },
  { emoji: '🌡️', title: 'Heteslag', desc: 'Symptomer: kraftig peseing, slapphet. Kjøl ned forsiktig, ring dyrlege.', urgent: true },
  { emoji: '🦴', title: 'Fremmedlegeme svelget', desc: 'IKKE fremtving brekninger uten råd fra dyrlege.', urgent: true },
]

export default function SOSVetScreen({ navigation }: any) {
  const [vetName, setVetName] = useState('')
  const [vetPhone, setVetPhone] = useState('')
  const [editing, setEditing] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      if (data) {
        try {
          const parsed = JSON.parse(data)
          setVetName(parsed.name || '')
          setVetPhone(parsed.phone || '')
        } catch (e) { /* ignore */ }
      }
      setLoaded(true)
    })
  }, [])

  const saveVet = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ name: vetName.trim(), phone: vetPhone.trim() }))
    setEditing(false)
    Alert.alert('✅ Lagret', 'Din faste dyrlege er lagret på telefonen.')
  }

  const clearVet = () => {
    Alert.alert('Fjern faste dyrlege', 'Er du sikker?', [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Fjern', style: 'destructive', onPress: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY)
        setVetName('')
        setVetPhone('')
      }},
    ])
  }

  const callNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, '')
    Linking.openURL(`tel:${cleaned}`).catch(() =>
      Alert.alert('Kunne ikke ringe', 'Sjekk at nummeret er gyldig.')
    )
  }

  const findVet = () => {
    // Apple Maps på iOS, Google Maps på Android
    const url = Platform.OS === 'ios'
      ? 'http://maps.apple.com/?q=dyrlege'
      : 'https://www.google.com/maps/search/?api=1&query=dyrlege'
    Linking.openURL(url)
  }

  const findEmergencyVet = () => {
    const url = Platform.OS === 'ios'
      ? 'http://maps.apple.com/?q=dyrlegevakt'
      : 'https://www.google.com/maps/search/?api=1&query=dyrlegevakt'
    Linking.openURL(url)
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>◀ Tilbake</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🚨 SOS Dyrlege</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
          <Text style={styles.subtitle}>Pust dypt. Hjelp er nær.</Text>

          {/* Store nødknapper */}
          <TouchableOpacity style={[styles.bigBtn, styles.btnEmergency]} onPress={findEmergencyVet}>
            <Text style={styles.bigBtnEmoji}>🚑</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.bigBtnTitle}>Finn dyrlegevakt nå</Text>
              <Text style={styles.bigBtnDesc}>Åpner Kart med nærmeste vakthavende</Text>
            </View>
            <Text style={styles.bigBtnArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.bigBtn, styles.btnPoison]} onPress={() => callNumber('22591300')}>
            <Text style={styles.bigBtnEmoji}>☠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.bigBtnTitle}>Giftinformasjonen</Text>
              <Text style={styles.bigBtnNumber}>22 59 13 00  ·  Åpen 24/7</Text>
            </View>
            <Text style={styles.bigBtnArrow}>📞</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.bigBtn, styles.btnFindVet]} onPress={findVet}>
            <Text style={styles.bigBtnEmoji}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.bigBtnTitle}>Finn dyrlege i nærheten</Text>
              <Text style={styles.bigBtnDesc}>Vanlige dyrleger nær deg</Text>
            </View>
            <Text style={styles.bigBtnArrow}>›</Text>
          </TouchableOpacity>

          {/* Min faste dyrlege */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👨‍⚕️ Min faste dyrlege</Text>

            {editing ? (
              <View style={styles.editForm}>
                <Text style={styles.label}>Navn på dyrlege / klinikk</Text>
                <TextInput
                  style={styles.input}
                  placeholder="F.eks. Dr. Hansen, Bærum Dyreklinikk"
                  placeholderTextColor={Colors.gray}
                  value={vetName}
                  onChangeText={setVetName}
                />

                <Text style={styles.label}>Telefonnummer</Text>
                <TextInput
                  style={styles.input}
                  placeholder="F.eks. 22 22 33 44"
                  placeholderTextColor={Colors.gray}
                  value={vetPhone}
                  onChangeText={setVetPhone}
                  keyboardType="phone-pad"
                />

                <View style={styles.row}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                    <Text style={styles.cancelBtnText}>Avbryt</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={saveVet}>
                    <Text style={styles.saveBtnText}>Lagre</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (vetName || vetPhone) ? (
              <View>
                <TouchableOpacity
                  style={styles.vetCard}
                  onPress={() => vetPhone && callNumber(vetPhone)}
                  disabled={!vetPhone}
                >
                  <View style={{ flex: 1 }}>
                    {vetName && <Text style={styles.vetName}>{vetName}</Text>}
                    {vetPhone && <Text style={styles.vetPhone}>📞 {vetPhone}</Text>}
                  </View>
                  {vetPhone && <Text style={styles.vetCallIcon}>📞</Text>}
                </TouchableOpacity>
                <View style={styles.row}>
                  <TouchableOpacity style={styles.linkBtn} onPress={() => setEditing(true)}>
                    <Text style={styles.linkBtnText}>✏️ Endre</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.linkBtn} onPress={clearVet}>
                    <Text style={[styles.linkBtnText, { color: '#c0392b' }]}>🗑️ Fjern</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : loaded ? (
              <TouchableOpacity style={styles.addPlaceholder} onPress={() => setEditing(true)}>
                <Text style={styles.addText}>+ Legg til din faste dyrlege</Text>
                <Text style={styles.addHint}>Lagret kun på telefonen din</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Vanlige nødstilfeller */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Vanlige nødstilfeller</Text>
            <Text style={styles.sectionDesc}>Når hunden har spist eller utsatt seg for noe farlig:</Text>
            {COMMON_EMERGENCIES.map((e, i) => (
              <View key={i} style={[styles.emergCard, e.urgent && styles.emergCardUrgent]}>
                <Text style={styles.emergEmoji}>{e.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <View style={styles.emergHeader}>
                    <Text style={styles.emergTitle}>{e.title}</Text>
                    {e.urgent && (
                      <View style={styles.urgentBadge}>
                        <Text style={styles.urgentBadgeText}>RING STRAKS</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.emergDesc}>{e.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Tips i en nødssituasjon</Text>
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>• <Text style={styles.bold}>Hold deg rolig</Text> — hunden merker stresset ditt.</Text>
              <Text style={styles.tipText}>• <Text style={styles.bold}>Ta vare på beviset</Text> — emballasje, rester eller bilde av det hunden har spist.</Text>
              <Text style={styles.tipText}>• <Text style={styles.bold}>Noter ned</Text> — symptomer, klokkeslett, og estimert mengde.</Text>
              <Text style={styles.tipText}>• <Text style={styles.bold}>Ikke gi melk eller mat</Text> uten råd fra dyrlege.</Text>
              <Text style={styles.tipText}>• <Text style={styles.bold}>Ring først</Text> — selv om du er usikker, bedre å spørre enn å vente.</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: { backgroundColor: '#c0392b', paddingTop: 60, paddingBottom: 20, paddingHorizontal: Spacing.md, flexDirection: 'row', alignItems: 'center' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  backText: { color: Colors.white, fontWeight: '700' },
  headerTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '800', marginLeft: Spacing.md },
  scroll: { flex: 1, paddingHorizontal: Spacing.md },
  subtitle: { fontSize: FontSize.sm, color: Colors.gray, textAlign: 'center', marginTop: Spacing.md, marginBottom: Spacing.lg, fontStyle: 'italic' },

  bigBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.md },
  btnEmergency: { backgroundColor: '#c0392b' },
  btnPoison: { backgroundColor: '#8e44ad' },
  btnFindVet: { backgroundColor: Colors.green },
  bigBtnEmoji: { fontSize: 36 },
  bigBtnTitle: { color: Colors.white, fontSize: FontSize.md, fontWeight: '800' },
  bigBtnNumber: { color: 'rgba(255,255,255,0.9)', fontSize: FontSize.sm, fontWeight: '700', marginTop: 2, letterSpacing: 0.5 },
  bigBtnDesc: { color: 'rgba(255,255,255,0.9)', fontSize: FontSize.xs, marginTop: 2 },
  bigBtnArrow: { color: Colors.white, fontSize: 22 },

  section: { marginTop: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.dark, marginBottom: Spacing.sm },
  sectionDesc: { fontSize: FontSize.xs, color: Colors.gray, marginBottom: Spacing.md },

  editForm: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.md },
  label: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.gray, marginBottom: 6, marginTop: Spacing.sm, textTransform: 'uppercase' },
  input: { backgroundColor: Colors.grayLight, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.dark },
  row: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  cancelBtn: { flex: 1, backgroundColor: Colors.grayLight, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  cancelBtnText: { color: Colors.dark, fontWeight: '600' },
  saveBtn: { flex: 2, backgroundColor: Colors.green, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  saveBtnText: { color: Colors.white, fontWeight: '700' },

  vetCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 2, borderColor: Colors.green },
  vetName: { fontSize: FontSize.md, fontWeight: '800', color: Colors.dark },
  vetPhone: { fontSize: FontSize.sm, color: Colors.green, fontWeight: '700', marginTop: 2 },
  vetCallIcon: { fontSize: 24 },
  linkBtn: { flex: 1, padding: Spacing.md, alignItems: 'center' },
  linkBtnText: { color: Colors.green, fontWeight: '700', fontSize: FontSize.sm },

  addPlaceholder: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center', borderWidth: 2, borderColor: Colors.grayLight, borderStyle: 'dashed' },
  addText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.green },
  addHint: { fontSize: FontSize.xs, color: Colors.gray, marginTop: 4 },

  emergCard: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md },
  emergCardUrgent: { borderLeftWidth: 4, borderLeftColor: '#c0392b' },
  emergEmoji: { fontSize: 28 },
  emergHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  emergTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.dark },
  emergDesc: { fontSize: FontSize.xs, color: Colors.dark, lineHeight: 18 },
  urgentBadge: { backgroundColor: '#c0392b', borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2 },
  urgentBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  tipCard: { backgroundColor: Colors.greenPale, borderRadius: Radius.xl, padding: Spacing.lg },
  tipText: { fontSize: FontSize.sm, color: Colors.dark, lineHeight: 22, marginBottom: 4 },
  bold: { fontWeight: '800' },
})
