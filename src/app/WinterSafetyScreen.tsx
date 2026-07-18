import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Colors, Spacing, Radius, FontSize } from '../lib/theme'

const COLD_DANGERS = [
  {
    emoji: '❄️',
    title: 'Nedkjøling og frysing',
    desc: 'Kortsnutede, tynnpelsede, små, unge og eldre hunder fryser lettere. Bruk hundedekken i sterk kulde og kort ned turene. Tegn på nedkjøling: skjelving, slapphet og stive bevegelser – ta hunden inn og varm den gradvis.',
  },
  {
    emoji: '🐾',
    title: 'Poter, veisalt og is',
    desc: 'Veisalt og strøkjemikalier svir i potene, og is kan klumpe seg mellom putene. Skyll og tørk potene etter tur. Vurder potevoks eller booties, og klipp pelsen mellom putene.',
  },
  {
    emoji: '🧊',
    title: 'Snø og is',
    desc: 'Ikke la hunden spise store mengder snø – det kan gi magetrøbbel og nedkjøling. Vær ekstra forsiktig ved islagt vann; usikker is er livsfarlig.',
  },
]

const HIDDEN_DANGERS = [
  {
    emoji: '🧪',
    title: 'Frostvæske (glykol)',
    desc: 'Lekker fra biler og har en søt smak som lokker hunder. EKSTREMT giftig – selv en liten slikk kan være dødelig. Ved mistanke: ring dyrlege straks.',
  },
]

export default function WinterSafetyScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>◀ Tilbake</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>❄️ Trygg vinter</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 60 }}>
        <Text style={styles.subtitle}>Vinterturer er flotte – med litt ekstra omtanke for kulde, poter og de søte, men farlige fellene.</Text>

        {/* Kulde */}
        <Text style={styles.sectionTitle}>🌨️ Kulde og poter</Text>
        {COLD_DANGERS.map((d, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardEmoji}>{d.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{d.title}</Text>
              <Text style={styles.cardDesc}>{d.desc}</Text>
            </View>
          </View>
        ))}

        {/* Jul og høytid */}
        <Text style={styles.sectionTitle}>🎄 Jul og høytid</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Sjokolade og kakao</Text> – giftig, mørk sjokolade er verst.</Text>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Rosiner og druer</Text> (i julekaker) – kan gi nyresvikt.</Text>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Fete restemåltider</Text> (ribbe- og pinnekjøttfett) – kan gi bukspyttkjertelbetennelse.</Text>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Julestjerne, kristtorn og misteltein</Text> – giftige planter.</Text>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Stearinlys, pynt og gavebånd</Text> – svelging og brannfare.</Text>
        </View>

        {/* Mørke og glatt */}
        <Text style={styles.sectionTitle}>🔦 Mørke og glatt føre</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>• Bruk <Text style={styles.bold}>refleks og lys</Text> – det er mørkt store deler av døgnet.</Text>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Glatt føre:</Text> gå rolig, unngå at hunden sklir eller trekker deg over ende.</Text>
          <Text style={styles.infoText}>• Korte, hyppige turer er bedre enn én lang i bitende kulde.</Text>
        </View>

        {/* Livsfarlig */}
        <Text style={styles.sectionTitle}>⚠️ Livsfarlig om vinteren</Text>
        {HIDDEN_DANGERS.map((d, i) => (
          <View key={i} style={[styles.card, styles.cardUrgent]}>
            <Text style={styles.cardEmoji}>{d.emoji}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{d.title}</Text>
                <View style={styles.urgentBadge}>
                  <Text style={styles.urgentBadgeText}>VIKTIG</Text>
                </View>
              </View>
              <Text style={styles.cardDesc}>{d.desc}</Text>
            </View>
          </View>
        ))}

        {/* SOS-snarvei */}
        <TouchableOpacity style={styles.sosBtn} onPress={() => navigation.navigate('SOSVet')} activeOpacity={0.85}>
          <Text style={styles.sosEmoji}>🚨</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.sosTitle}>Ved akutt: SOS Dyrlege</Text>
            <Text style={styles.sosDesc}>Finn dyrlegevakt og Giftinformasjonen raskt</Text>
          </View>
          <Text style={styles.sosArrow}>›</Text>
        </TouchableOpacity>

        {/* Tips */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Vinterens gylne vane</Text>
          <Text style={styles.tipText}>Skyll og tørk potene etter hver tur for å fjerne veisalt og is. Da unngår du såre poter og at hunden slikker i seg kjemikalier.</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: { backgroundColor: '#2E5E8C', paddingTop: 60, paddingBottom: 20, paddingHorizontal: Spacing.md, flexDirection: 'row', alignItems: 'center' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  backText: { color: Colors.white, fontWeight: '700' },
  headerTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '800', marginLeft: Spacing.md },
  scroll: { flex: 1, paddingHorizontal: Spacing.md },
  subtitle: { fontSize: FontSize.sm, color: Colors.gray, textAlign: 'center', marginTop: Spacing.md, marginBottom: Spacing.lg, fontStyle: 'italic' },

  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.dark, marginTop: Spacing.lg, marginBottom: Spacing.sm },

  card: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md },
  cardUrgent: { borderLeftWidth: 4, borderLeftColor: '#2E5E8C' },
  cardEmoji: { fontSize: 28 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  cardTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.dark, marginBottom: 4 },
  cardDesc: { fontSize: FontSize.xs, color: Colors.dark, lineHeight: 18 },
  urgentBadge: { backgroundColor: '#2E5E8C', borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4 },
  urgentBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  sosBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#c0392b', borderRadius: Radius.xl, padding: Spacing.md, marginTop: Spacing.lg, gap: Spacing.md },
  sosEmoji: { fontSize: 30 },
  sosTitle: { color: Colors.white, fontSize: FontSize.md, fontWeight: '800' },
  sosDesc: { color: 'rgba(255,255,255,0.9)', fontSize: FontSize.xs, marginTop: 2 },
  sosArrow: { color: Colors.white, fontSize: 22 },

  infoCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.md },
  infoText: { fontSize: FontSize.sm, color: Colors.dark, lineHeight: 22, marginBottom: 4 },
  bold: { fontWeight: '800' },

  tipCard: { backgroundColor: Colors.greenPale, borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.lg },
  tipTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.dark, marginBottom: 6 },
  tipText: { fontSize: FontSize.sm, color: Colors.dark, lineHeight: 22 },
})
