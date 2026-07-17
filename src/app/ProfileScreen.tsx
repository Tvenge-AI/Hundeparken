import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ImageBackground, Share, Linking } from 'react-native'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { Colors, Spacing, Radius, FontSize } from '../lib/theme'

const TEMPERAMENT_LABELS: Record<string, string> = {
  sosial: '😊 Sosial', leken: '⚡ Leken', rolig: '😌 Rolig',
  sky: '🙈 Sky', beskyttende: '🛡️ Beskyttende', aktiv: '🏃 Aktiv',
}

const APP_STORE_URL = 'https://apps.apple.com/no/app/hundeparken/id6764643698'
const SUPPORT_EMAIL = 'thomas.tvenge@gmail.com'

function getAge(birthdate: string): string {
  const today = new Date()
  const birth = new Date(birthdate)
  const years = today.getFullYear() - birth.getFullYear()
  const months = today.getMonth() - birth.getMonth()
  const totalMonths = years * 12 + months
  if (totalMonths < 12) return `${totalMonths} måneder`
  if (months < 0) return `${years - 1} år`
  return `${years} år`
}

function isBirthdayToday(birthdate: string): boolean {
  const today = new Date()
  const birth = new Date(birthdate)
  return today.getDate() === birth.getDate() && today.getMonth() === birth.getMonth()
}

export default function ProfileScreen({ navigation }: any) {
  const { profile, dogs, fetchDogs, signOut } = useAuthStore()

  const shareApp = async () => {
    try {
      await Share.share({
        message: `Sjekk ut Hundeparken 🐾 – en gratis app for hundeeiere med kart over hundeparker, treff med andre hunder og digitalt veterinærkort.\n\n${APP_STORE_URL}`,
      })
    } catch (e) {
      // brukeren avbrøt delingen – ingen handling
    }
  }

  const sendFeedback = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Tilbakemelding – Hundeparken')}&body=${encodeURIComponent('Hei!\n\nHer er min tilbakemelding:\n\n')}`
    try {
      const canOpen = await Linking.canOpenURL(url)
      if (canOpen) {
        await Linking.openURL(url)
      } else {
        Alert.alert('Send oss en e-post', `Du kan nå oss på ${SUPPORT_EMAIL}`)
      }
    } catch (e) {
      Alert.alert('Send oss en e-post', `Du kan nå oss på ${SUPPORT_EMAIL}`)
    }
  }

  const deleteDog = (dog: any) => {
    Alert.alert(`Slett ${dog.name}`, `Er du sikker?`, [
      { text: 'Avbryt', style: 'cancel' },
      { text: '🗑️ Slett', style: 'destructive', onPress: async () => {
        await supabase.from('dogs').delete().eq('id', dog.id)
        await fetchDogs()
      }}
    ])
  }

  const deleteAccount = () => {
    Alert.alert(
      'Slett konto',
      'Er du sikker? Dette kan ikke angres. All data om deg og hundene dine vil bli permanent slettet.',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Slett konto',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.functions.invoke('delete-account')
              if (error) {
                Alert.alert('Feil', 'Kunne ikke slette kontoen. Prøv igjen senere eller kontakt support.')
                return
              }
              await signOut()
            } catch (e) {
              Alert.alert('Feil', 'Kunne ikke slette kontoen. Prøv igjen senere eller kontakt support.')
            }
          },
        },
      ]
    )
  }

  return (
    <ImageBackground source={require('../../assets/bg.jpg')} style={{ flex: 1 }} resizeMode="cover">
      <View style={styles.overlay} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Min profil 🐶</Text>
            <Text style={styles.subtitle}>{profile?.display_name ?? 'Hundeeier'}</Text>
          </View>
          <TouchableOpacity onPress={() => Alert.alert('Logg ut', 'Er du sikker?', [
            { text: 'Avbryt' },
            { text: 'Logg ut', onPress: signOut, style: 'destructive' }
          ])}>
            <Text style={{ fontSize: 22 }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mine hunder 🐕</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddDog')}>
              <Text style={styles.addBtnText}>+ Legg til</Text>
            </TouchableOpacity>
          </View>

          {dogs.length === 0 ? (
            <TouchableOpacity style={styles.emptyCard} onPress={() => navigation.navigate('AddDog')}>
              <Text style={{ fontSize: 48 }}>🐶</Text>
              <Text style={styles.emptyTitle}>Legg til din hund!</Text>
              <Text style={styles.emptySubtitle}>Trykk her for å opprette en profil.</Text>
            </TouchableOpacity>
          ) : (
            dogs.map(dog => {
              const isToday = dog.birthdate && isBirthdayToday(dog.birthdate)
              return (
                <View key={dog.id}>
                  {isToday && (
                    <View style={styles.birthdayBanner}>
                      <Text style={styles.birthdayText}>🎂🎉 Gratulerer med dagen, {dog.name}! 🎉🎂</Text>
                      <Text style={styles.birthdayConfetti}>🐾✨🎈🎁🐾✨🎈🎁🐾</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={[styles.dogCard, isToday && styles.dogCardBirthday]}
                    onPress={() => Alert.alert(dog.name, 'Hva vil du gjøre?', [
                      { text: 'Avbryt', style: 'cancel' },
                      { text: '🗑️ Slett hund', style: 'destructive', onPress: () => deleteDog(dog) },
                    ])}
                  >
                    {dog.photo_url ? (
                      <Image source={{ uri: dog.photo_url }} style={styles.dogPhoto} />
                    ) : (
                      <View style={styles.dogPhotoPlaceholder}>
                        <Text style={{ fontSize: 32 }}>🐕</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dogName}>{dog.name} {isToday ? '🎂' : ''}</Text>
                      <Text style={styles.dogBreed}>
                        {dog.breed ?? 'Ukjent rase'}
                        {dog.birthdate ? ` · ${getAge(dog.birthdate)}` : dog.age_years ? ` · ${dog.age_years} år` : ''}
                        {dog.size ? ` · ${dog.size}` : ''}
                      </Text>
                      {dog.birthdate && (
                        <Text style={styles.dogBirthdate}>
                          🎂 {new Date(dog.birthdate).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long' })}
                        </Text>
                      )}
                      {dog.temperament.length > 0 && (
                        <View style={styles.tempRow}>
                          {dog.temperament.map(t => (
                            <View key={t} style={styles.tempChip}>
                              <Text style={styles.tempChipText}>{TEMPERAMENT_LABELS[t] ?? t}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                    <Text style={{ fontSize: 20, opacity: 0.3 }}>⋮</Text>
                  </TouchableOpacity>
                </View>
              )
            })
          )}
        </View>

        <View style={styles.communitySection}>
          <TouchableOpacity style={styles.shareBtn} onPress={shareApp} activeOpacity={0.85}>
            <Text style={styles.communityIcon}>💚</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.shareTitle}>Del Hundeparken</Text>
              <Text style={styles.shareSub}>Tips en hundevenn – appen blir bedre jo flere vi er</Text>
            </View>
            <Text style={styles.shareArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.feedbackBtn} onPress={sendFeedback} activeOpacity={0.85}>
            <Text style={styles.communityIcon}>💬</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.feedbackTitle}>Send tilbakemelding</Text>
              <Text style={styles.feedbackSub}>Funnet en feil eller har et ønske? Vi hører gjerne fra deg</Text>
            </View>
            <Text style={styles.feedbackArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dangerSection}>
          <TouchableOpacity style={styles.deleteAccountBtn} onPress={deleteAccount}>
            <Text style={styles.deleteAccountText}>🗑️  Slett konto</Text>
          </TouchableOpacity>
          <Text style={styles.deleteAccountHint}>
            Sletter kontoen din permanent. Dette kan ikke angres.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,1.0)' },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, paddingTop: 60 },
  title: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.dark },
  subtitle: { fontSize: FontSize.sm, color: Colors.gray, marginTop: 2 },
  section: { padding: Spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.dark },
  addBtn: { backgroundColor: Colors.green, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  addBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
  emptyCard: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', borderWidth: 2, borderColor: Colors.greenPale },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.dark, marginTop: Spacing.md },
  emptySubtitle: { fontSize: FontSize.sm, color: Colors.gray, textAlign: 'center', marginTop: Spacing.sm },
  birthdayBanner: { backgroundColor: Colors.amber, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.sm, alignItems: 'center' },
  birthdayText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md, textAlign: 'center' },
  birthdayConfetti: { fontSize: 18, marginTop: 4 },
  dogCard: { flexDirection: 'row', gap: Spacing.md, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.md, alignItems: 'center' },
  dogCardBirthday: { borderWidth: 2.5, borderColor: Colors.amber },
  dogPhoto: { width: 70, height: 70, borderRadius: 35 },
  dogPhotoPlaceholder: { width: 70, height: 70, borderRadius: 35, backgroundColor: Colors.greenPale, alignItems: 'center', justifyContent: 'center' },
  dogName: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.dark },
  dogBreed: { fontSize: FontSize.sm, color: Colors.gray, marginTop: 2 },
  dogBirthdate: { fontSize: FontSize.xs, color: Colors.amber, marginTop: 2, fontWeight: '600' },
  tempRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: Spacing.sm },
  tempChip: { backgroundColor: Colors.greenPale, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  tempChipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.green },
  communitySection: { paddingHorizontal: Spacing.md, marginTop: Spacing.sm },
  communityIcon: { fontSize: 26 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.green, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.md },
  shareTitle: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
  shareSub: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.xs, marginTop: 2 },
  shareArrow: { color: Colors.white, fontSize: 26, fontWeight: '700' },
  feedbackBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1.5, borderColor: Colors.greenPale, borderRadius: Radius.xl, padding: Spacing.md },
  feedbackTitle: { color: Colors.dark, fontWeight: '800', fontSize: FontSize.md },
  feedbackSub: { color: Colors.gray, fontSize: FontSize.xs, marginTop: 2 },
  feedbackArrow: { color: Colors.green, fontSize: 26, fontWeight: '700' },
  dangerSection: { padding: Spacing.lg, marginTop: Spacing.lg, alignItems: 'center' },
  deleteAccountBtn: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e53935', borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: 12 },
  deleteAccountText: { color: '#e53935', fontWeight: '700', fontSize: FontSize.md },
  deleteAccountHint: { fontSize: FontSize.xs, color: Colors.gray, marginTop: Spacing.sm, textAlign: 'center' },
})
