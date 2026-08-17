import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Colors, Spacing, Radius, FontSize } from '../lib/theme'

const HEAT_DANGERS = [
  {
    emoji: '🚗',
    title: 'Aldri alene i bil',
    desc: 'Selv med vindu på gløtt og i skyggen kan en bil bli dødelig varm på få minutter. La aldri hunden vente i bilen om sommeren.',
    urgent: true,
  },
  {
    emoji: '🔥',
    title: 'Varm asfalt brenner potene',
    desc: '7-sekunders-testen: legg håndbaken på asfalten. Klarer du ikke å holde i 7 sekunder, er det for varmt for potene. Gå på gress, tidlig morgen eller sen kveld.',
    urgent: false,
  },
  {
    emoji: '🌡️',
    title: 'Tegn på heteslag',
    desc: 'Kraftig pesing, sikling, slapphet, oppkast eller ustøhet. Kjøl ned med LUNKENT (ikke iskaldt) vann på poter og mage, gi vann å drikke, og ring dyrlege straks.',
    urgent: true,
  },
]

const SUMMER_PLANTS = [
  'Liljekonvall', 'Revebjelle (digitalis)', 'Rododendron', 'Azalea',
  'Gullregn', 'Barlind', 'Tulipanløk', 'Påskelilje',
]

export default function SummerSafetyScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>◀ Tilbake</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>☀️ Trygg sommer</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 60 }}>
        <Text style={styles.subtitle}>Sommer er gull for hundelivet – med noen enkle grep holder du firbeinet trygt i varmen.</Text>

        {/* Varme */}
        <Text style={styles.sectionTitle}>🌞 Pass på varmen</Text>
        {HEAT_DANGERS.map((d, i) => (
          <View key={i} style={[styles.card, d.urgent && styles.cardUrgent]}>
            <Text style={styles.cardEmoji}>{d.emoji}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{d.title}</Text>
                {d.urgent && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentBadgeText}>VIKTIG</Text>
                  </View>
                )}
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

        {/* Hoggorm */}
        <Text style={styles.sectionTitle}>🐍 Hoggorm</Text>
        <View style={[styles.card, styles.cardUrgent]}>
          <Text style={styles.cardEmoji}>🐍</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Hoggormbitt</Text>
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentBadgeText}>AKUTT</Text>
              </View>
            </View>
            <Text style={styles.cardDesc}>Norges eneste giftslange er aktiv om sommeren og ligger gjerne i lyng, høyt gress, steinrøyser og skogkanter i solvarmen. Hunder blir oftest bitt i snute eller poter når de snuser.</Text>
          </View>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Tegn:</Text> plutselig hevelse (ofte i ansikt/pote), smerte, hunden hyler, to små stikkmerker, sikling, slapphet.</Text>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Hold hunden i ro</Text> – bær den om du kan. Bevegelse sprer giften raskere.</Text>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Til dyrlege straks</Text> – hoggormbitt er alltid akutt. Ring gjerne på veien.</Text>
          <Text style={styles.infoText}>• <Text style={styles.bold}>IKKE</Text> sug ut gift, klem på såret eller legg på trykkbandasje.</Text>
          <Text style={styles.infoText}>• Hold hunden i bånd i hoggorm-terreng på varme dager.</Text>
        </View>

        {/* Flått */}
        <Text style={styles.sectionTitle}>🕷️ Flått</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Sjekk hunden</Text> etter hver tur i skog og høyt gress.</Text>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Fjern flått</Text> med flåttfjerner eller pinsett – dra rett ut, ikke vri.</Text>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Følg med</Text> på rødhet, hevelse, slapphet eller feber dagene etter.</Text>
          <Text style={styles.infoText}>• Snakk med dyrlegen om <Text style={styles.bold}>flåttmiddel</Text> som passer din hund.</Text>
        </View>

        {/* Giftige planter */}
        <Text style={styles.sectionTitle}>🌸 Giftige sommerplanter</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Vanlige hage- og turplanter som kan være giftige for hund:</Text>
          <View style={styles.plantWrap}>
            {SUMMER_PLANTS.map((p) => (
              <View key={p} style={styles.plantChip}>
                <Text style={styles.plantChipText}>{p}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.infoText, { marginTop: Spacing.sm }]}>Har hunden spist noe du er usikker på? Ring <Text style={styles.bold}>Giftinformasjonen 22 59 13 00</Text> (åpen 24/7).</Text>
        </View>

        {/* Vann og bading */}
        <Text style={styles.sectionTitle}>🌊 Vann og bading</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Alltid friskt drikkevann</Text> tilgjengelig – ta med på tur.</Text>
          <Text style={styles.infoText}>• Ikke la hunden <Text style={styles.bold}>drikke saltvann</Text> eller stillestående vann (kan inneholde giftige alger).</Text>
          <Text style={styles.infoText}>• <Text style={styles.bold}>Tørk ørene</Text> etter bading for å unngå ørebetennelse.</Text>
          <Text style={styles.infoText}>• Pass på <Text style={styles.bold}>strøm og bølger</Text> – ikke alle hunder er sterke svømmere.</Text>
        </View>

        {/* Ekstra utsatte */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Ekstra utsatt for varme</Text>
          <Text style={styles.tipText}>Kortsnutede raser (mops, fransk bulldog, boxer), tunge pelser, valper, eldre og overvektige hunder tåler varme dårligere. Gi dem ekstra skygge, hvile og vann.</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: { backgroundColor: Colors.amber, paddingTop: 60, paddingBottom: 20, paddingHorizontal: Spacing.md, flexDirection: 'row', alignItems: 'center' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  backText: { color: Colors.white, fontWeight: '700' },
  headerTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '800', marginLeft: Spacing.md },
  scroll: { flex: 1, paddingHorizontal: Spacing.md },
  subtitle: { fontSize: FontSize.sm, color: Colors.gray, textAlign: 'center', marginTop: Spacing.md, marginBottom: Spacing.lg, fontStyle: 'italic' },

  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.dark, marginTop: Spacing.lg, marginBottom: Spacing.sm },

  card: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md },
  cardUrgent: { borderLeftWidth: 4, borderLeftColor: Colors.amber },
  cardEmoji: { fontSize: 28 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  cardTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.dark },
  cardDesc: { fontSize: FontSize.xs, color: Colors.dark, lineHeight: 18 },
  urgentBadge: { backgroundColor: Colors.amber, borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2 },
  urgentBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  sosBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#c0392b', borderRadius: Radius.xl, padding: Spacing.md, marginTop: Spacing.sm, gap: Spacing.md },
  sosEmoji: { fontSize: 30 },
  sosTitle: { color: Colors.white, fontSize: FontSize.md, fontWeight: '800' },
  sosDesc: { color: 'rgba(255,255,255,0.9)', fontSize: FontSize.xs, marginTop: 2 },
  sosArrow: { color: Colors.white, fontSize: 22 },

  infoCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.md },
  infoText: { fontSize: FontSize.sm, color: Colors.dark, lineHeight: 22, marginBottom: 4 },
  bold: { fontWeight: '800' },

  plantWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: Spacing.sm },
  plantChip: { backgroundColor: Colors.greenPale, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  plantChipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.green },

  tipCard: { backgroundColor: Colors.greenPale, borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.lg },
  tipTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.dark, marginBottom: 6 },
  tipText: { fontSize: FontSize.sm, color: Colors.dark, lineHeight: 22 },
})
