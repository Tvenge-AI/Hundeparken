import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native'
import { Colors, Spacing, Radius, FontSize } from '../lib/theme'
import { PARTNERS, AFFILIATE_DISCLOSURE } from '../lib/affiliate'

export default function RecommendedServicesScreen({ navigation }: any) {
  const featured = PARTNERS.find(p => p.featured)
  const others = PARTNERS.filter(p => !p.featured)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>◀ Tilbake</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💎 Anbefalt for deg</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Intro */}
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Tjenester vi anbefaler</Text>
          <Text style={styles.introBody}>
            Vi har samarbeid med utvalgte aktører som kan gjøre hverdagen lettere for deg og hunden din.
            Alle er valgt fordi de leverer reell verdi til norske hundeeiere.
          </Text>
          <Text style={styles.introDisclosure}>{AFFILIATE_DISCLOSURE}</Text>
        </View>

        {/* Featured partner — større kort */}
        {featured && (
          <TouchableOpacity
            style={[styles.featuredCard, { backgroundColor: featured.bg }]}
            onPress={() => Linking.openURL(featured.url)}
            activeOpacity={0.85}
          >
            <View style={styles.featuredHeader}>
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>UTVALGT</Text>
              </View>
            </View>
            <Text style={styles.featuredEmoji}>{featured.emoji}</Text>
            <Text style={styles.featuredCategory}>{featured.category}</Text>
            <Text style={styles.featuredName}>{featured.name}</Text>
            <Text style={styles.featuredPitch}>{featured.pitch}</Text>
            <View style={[styles.ctaBtn, { backgroundColor: featured.accent }]}>
              <Text style={styles.ctaBtnText}>{featured.cta} →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Andre partnere */}
        <Text style={styles.sectionLabel}>FLERE TILBUD</Text>

        {others.map(partner => (
          <TouchableOpacity
            key={partner.id}
            style={styles.partnerCard}
            onPress={() => Linking.openURL(partner.url)}
            activeOpacity={0.85}
          >
            <View style={[styles.partnerIconBox, { backgroundColor: partner.bg }]}>
              <Text style={styles.partnerEmoji}>{partner.emoji}</Text>
            </View>
            <View style={styles.partnerInfo}>
              <Text style={styles.partnerCategory}>{partner.category}</Text>
              <Text style={styles.partnerName}>{partner.name}</Text>
              <Text style={styles.partnerPitch} numberOfLines={2}>{partner.pitch}</Text>
              <Text style={[styles.partnerCta, { color: partner.accent }]}>{partner.cta} →</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Bunntekst */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Vi mottar provisjon fra noen av disse partnerne hvis du registrerer deg eller handler via våre lenker.
            Det gjør oss i stand til å holde Hundeparken-appen gratis for alle.
          </Text>
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
  headerTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '800', marginLeft: Spacing.md, flex: 1 },

  scroll: { flex: 1, paddingHorizontal: Spacing.md },

  intro: { paddingVertical: Spacing.lg },
  introTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.dark, marginBottom: Spacing.sm },
  introBody: { fontSize: FontSize.sm, color: Colors.dark, lineHeight: 22, marginBottom: Spacing.sm },
  introDisclosure: { fontSize: FontSize.xs, color: Colors.gray, fontStyle: 'italic' },

  // Featured (utvalgt) — stort, fremtredende
  featuredCard: { borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 2, borderColor: '#2e7d32' },
  featuredHeader: { flexDirection: 'row', justifyContent: 'flex-end' },
  featuredBadge: { backgroundColor: '#2e7d32', paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  featuredBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  featuredEmoji: { fontSize: 56, marginVertical: Spacing.sm },
  featuredCategory: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.gray, textTransform: 'uppercase', letterSpacing: 0.5 },
  featuredName: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.dark, marginTop: 4, marginBottom: Spacing.sm },
  featuredPitch: { fontSize: FontSize.sm, color: Colors.dark, lineHeight: 22, marginBottom: Spacing.lg },
  ctaBtn: { borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  ctaBtnText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },

  // Section label
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.gray, marginTop: Spacing.md, marginBottom: Spacing.md, letterSpacing: 0.5 },

  // Partner cards — mindre
  partnerCard: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md, alignItems: 'flex-start' },
  partnerIconBox: { width: 56, height: 56, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  partnerEmoji: { fontSize: 28 },
  partnerInfo: { flex: 1 },
  partnerCategory: { fontSize: 10, fontWeight: '700', color: Colors.gray, textTransform: 'uppercase', letterSpacing: 0.5 },
  partnerName: { fontSize: FontSize.md, fontWeight: '800', color: Colors.dark, marginTop: 2 },
  partnerPitch: { fontSize: FontSize.xs, color: Colors.dark, lineHeight: 16, marginTop: 4 },
  partnerCta: { fontSize: FontSize.sm, fontWeight: '800', marginTop: Spacing.sm },

  // Footer
  footer: { backgroundColor: Colors.greenPale, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.lg },
  footerText: { fontSize: FontSize.xs, color: Colors.dark, lineHeight: 18, fontStyle: 'italic' },
})
