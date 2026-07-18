import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Colors, Spacing, Radius, FontSize } from '../lib/theme'

const SPRING_DANGERS = [
  {
    emoji: '🤧',
    title: 'Pollen og vårallergi',
    desc: 'Hunder kan også bli allergiske om våren. Tegn: kløe, poteslikking, rød hud og ørebetennelser. Tørk poter og pels etter tur, og snakk med dyrlege hvis plagene vedvarer.',
  },
  {
    emoji: '🕷️',
    title: 'Flåtten våkner',
    desc: 'Flått blir aktiv når det blir mildere. Sjekk hunden etter hver tur i skog og høyt gress, start med flåttmiddel, og fjern flått raskt med flåttfjerner.',
  },
  {
    emoji: '💩',
    title: 'Vårløsning',
    desc: 'Når snøen smelter dukker skjulte farer opp: gammel avføring (parasitter), søppel, glass, døde dyr og rester av frostvæske. Følg med på hva hunden snuser på og prøver å spise.',
  },
]

export default function SpringSafetyScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>◀ Tilbake</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌱 Trygg vår</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 60 }}>
        <Text style={styles.subtitle}>Våren vekker hundelivet til live igjen – her er tingene å følge med på når naturen våkner.</Text>

        {/* Vårens farer */}
        <Text style={styles.sectionTitle}>🌦️ Når naturen våkner</Text>
        {SPRING_DANGERS.map((d, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardEmoji}>{d.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{d.title}</Text>
              <Text style={styles.cardDesc}>{d.desc}</Text>
            </View>
          </View>
        ))}

        {/* Giftige vårblomster */}
        <Text style={styles.sectionTitle}>🌷 Giftige vårblomster</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Påskelilje</Text> – giftig, særlig løken.</Text>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Tulipan- og hyasintløk</Text> – giftige.</Text>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Krokus, snøklokke og liljekonvall</Text> – giftige.</Text>
          <Text style={styles.infoText}>• Ikke la hunden grave opp eller tygge på blomsterløk i bedet.</Text>
          <Text style={[styles.infoText, { marginTop: Spacing.sm }]}>Mistanke om at hunden har spist noe? Ring <Text style={styles.bold}>Giftinformasjonen 22 59 13 00</Text> (åpen 24/7).</Text>
        </View>

        {/* Påske */}
        <Text style={styles.sectionTitle}>🐣 Påske og høytid</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Sjokolade</Text> (påskeegg) – giftig, mørk sjokolade er verst.</Text>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Rosiner og druer</Text> i påskebakst – kan gi nyresvikt.</Text>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Søtsaker med xylitol</Text> (sukkerfritt) – ekstremt farlig.</Text>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Påskeliljer</Text> på bordet – hold dem utenfor rekkevidde.</Text>
        </View>

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
          <Text style={styles.tipTitle}>💡 Vårens gylne vane</Text>
          <Text style={styles.tipText}>Tørk poter og pels etter tur for å fjerne pollen, og hold øye med hva hunden finner når snøen smelter. Da får dere en frisk og trygg vår sammen.</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: { backgroundColor: '#4E9B3D', paddingTop: 60, paddingBottom: 20, paddingHorizontal: Spacing.md, flexDirection: 'row', alignItems: 'center' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  backText: { color: Colors.white, fontWeight: '700' },
  headerTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '800', marginLeft: Spacing.md },
  scroll: { flex: 1, paddingHorizontal: Spacing.md },
  subtitle: { fontSize: FontSize.sm, color: Colors.gray, textAlign: 'center', marginTop: Spacing.md, marginBottom: Spacing.lg, fontStyle: 'italic' },

  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.dark, marginTop: Spacing.lg, marginBottom: Spacing.sm },

  card: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md },
  cardEmoji: { fontSize: 28 },
  cardTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.dark, marginBottom: 4 },
  cardDesc: { fontSize: FontSize.xs, color: Colors.dark, lineHeight: 18 },

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
