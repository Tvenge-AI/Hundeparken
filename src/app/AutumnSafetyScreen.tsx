import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Colors, Spacing, Radius, FontSize } from '../lib/theme'

const WET_DANGERS = [
  {
    emoji: '💧',
    title: 'Våteksem',
    desc: 'Fuktig pels gir grobunn for hudirritasjon. Tørk hunden godt etter våte turer – særlig mage, poter og mellom tærne. Se etter røde, kløende eller sviende flekker, og kontakt dyrlege hvis de sprer seg.',
  },
  {
    emoji: '👂',
    title: 'Ørebetennelse',
    desc: 'Fukt i ørene – særlig hos hunder med hengeører – kan gi betennelse. Tørk ørene etter regn og bading. Tegn: risting på hodet, kløe, vond lukt eller rødhet.',
  },
  {
    emoji: '🐾',
    title: 'Gjørmete poter',
    desc: 'Skyll av gjørme etter tur og tørk godt mellom putene. Sjekk for sår, kvister eller opphovning – og skyll av veisalt når vinteren nærmer seg.',
  },
]

const HIDDEN_DANGERS = [
  {
    emoji: '🧪',
    title: 'Frostvæske (glykol)',
    desc: 'Lekker fra biler og har en søt smak som lokker hunder. EKSTREMT giftig – selv en liten slikk kan være dødelig. Ved mistanke: ring dyrlege straks.',
  },
  {
    emoji: '🐀',
    title: 'Musegift',
    desc: 'Blir vanligere om høsten når mus søker innendørs. Livsfarlig for hund. Oppbevar utilgjengelig, og ring straks ved mistanke om at hunden har fått i seg noe.',
  },
]

export default function AutumnSafetyScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>◀ Tilbake</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🍂 Trygg høst</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 60 }}>
        <Text style={styles.subtitle}>Høsten er herlig turvær for hund – med litt ekstra oppmerksomhet holder du firbeinet frisk gjennom regn og mørke.</Text>

        {/* Regn og fukt */}
        <Text style={styles.sectionTitle}>🌧️ Regn og fukt</Text>
        {WET_DANGERS.map((d, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardEmoji}>{d.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{d.title}</Text>
              <Text style={styles.cardDesc}>{d.desc}</Text>
            </View>
          </View>
        ))}

        {/* Skogen */}
        <Text style={styles.sectionTitle}>🍄 Skogen om høsten</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>• Mange <Text style={styles.bold}>høstsopp er giftige</Text> for hund – ikke la den tygge på sopp i skogen.</Text>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Eikenøtter og hestekastanjer</Text> kan gi magetrøbbel og tarmblokkering i store mengder.</Text>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Rådne nøtter og fallfrukt</Text> som har begynt å gjære kan gi alkoholforgiftning.</Text>
          <Text style={styles.infoText}>• Ikke la hunden spise <Text style={styles.bold}>kadaver eller vilt</Text> – kan inneholde bakterier og parasitter.</Text>
          <Text style={styles.infoText}>• Unngå at hunden spiser <Text style={styles.bold}>snegler</Text> (kan bære lungeorm).</Text>
        </View>

        {/* Mørke turer */}
        <Text style={styles.sectionTitle}>🔦 Mørke turer</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>• Det blir mørkt tidlig – bruk <Text style={styles.bold}>refleks og lys</Text> på både hund og deg selv.</Text>
          <Text style={styles.infoText}>• Et <Text style={styles.bold}>lys-halsbånd eller refleksvest</Text> gjør hunden synlig for biler og syklister.</Text>
          <Text style={styles.infoText}>• Hold hunden <Text style={styles.bold}>nærmere i mørket</Text>, særlig langs vei.</Text>
          <Text style={styles.infoText}>• Husk <Text style={styles.bold}>båndtvang</Text> og vis hensyn i jakt-sesongen.</Text>
        </View>

        {/* Livsfarlig om høsten */}
        <Text style={styles.sectionTitle}>⚠️ Livsfarlig om høsten</Text>
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
          <Text style={styles.tipTitle}>💡 Høstens gylne vane</Text>
          <Text style={styles.tipText}>Tørk hunden – pels, poter og ører – etter hver våt tur. En tørr og ren hund holder hud og ører friske gjennom hele høsten.</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: { backgroundColor: '#A34A2A', paddingTop: 60, paddingBottom: 20, paddingHorizontal: Spacing.md, flexDirection: 'row', alignItems: 'center' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  backText: { color: Colors.white, fontWeight: '700' },
  headerTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '800', marginLeft: Spacing.md },
  scroll: { flex: 1, paddingHorizontal: Spacing.md },
  subtitle: { fontSize: FontSize.sm, color: Colors.gray, textAlign: 'center', marginTop: Spacing.md, marginBottom: Spacing.lg, fontStyle: 'italic' },

  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.dark, marginTop: Spacing.lg, marginBottom: Spacing.sm },

  card: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md },
  cardUrgent: { borderLeftWidth: 4, borderLeftColor: '#A34A2A' },
  cardEmoji: { fontSize: 28 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  cardTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.dark, marginBottom: 4 },
  cardDesc: { fontSize: FontSize.xs, color: Colors.dark, lineHeight: 18 },
  urgentBadge: { backgroundColor: '#A34A2A', borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4 },
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
