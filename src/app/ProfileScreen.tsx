import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ImageBackground } from 'react-native'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { Colors, Spacing, Radius, FontSize } from '../lib/theme'

const TEMPERAMENT_LABELS: Record<string, string> = {
  sosial: '😊 Sosial', leken: '⚡ Leken', rolig: '😌 Rolig',
  sky: '🙈 Sky', beskyttende: '🛡️ Beskyttende', aktiv: '🏃 Aktiv',
}

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

  const deleteDog = (dog: any) => {
    Alert.alert(`Slett ${dog.name}`, `Er du sikker?`, [
      { text: 'Avbryt', style: 'cancel' },
      { text: '🗑️ Slett', style: 'destructive', onPress: async () => {
        await supabase.from('dogs').delete().eq('id', dog.id)
        await fetchDogs()
      }}
    ])
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
})
