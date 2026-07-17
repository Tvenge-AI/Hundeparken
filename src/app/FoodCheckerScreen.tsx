import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native'
import { Colors, Spacing, Radius, FontSize } from '../lib/theme'
import { AFFILIATE, AFFILIATE_DISCLOSURE } from '../lib/affiliate'

type Status = 'safe' | 'caution' | 'danger'

type Food = {
  name: string
  emoji: string
  status: Status
  description: string
  searchTerms?: string[]
}

// ~50 vanlige matvarer som folk lurer på
const FOODS: Food[] = [
  // FARLIG
  { name: 'Sjokolade', emoji: '🍫', status: 'danger', description: 'Inneholder teobromin som er giftig. Mørk sjokolade og bakesjokolade er verst. Selv små mengder kan være farlig.', searchTerms: ['sjokolade', 'chocolate', 'kakao'] },
  { name: 'Druer og rosiner', emoji: '🍇', status: 'danger', description: 'Kan forårsake akutt nyresvikt. Selv noen få druer/rosiner er farlig. Helt forbudt.', searchTerms: ['druer', 'rosiner', 'vindruer'] },
  { name: 'Xylitol (sukkerfritt)', emoji: '🍬', status: 'danger', description: 'Finnes i sukkerfri tyggegummi, godteri, og noen peanøttsmør. Ekstremt giftig — gir blodsukkerfall og leversvikt.', searchTerms: ['xylitol', 'sukkerfri', 'tyggegummi', 'birkesukker'] },
  { name: 'Løk', emoji: '🧅', status: 'danger', description: 'Skader røde blodceller. Farlig i alle former: rå, kokt, stekt, pulver, eller som krydder i mat.', searchTerms: ['løk', 'lok'] },
  { name: 'Hvitløk', emoji: '🧄', status: 'danger', description: 'Samme som løk — skader blodet. Spesielt farlig som pulver eller granulat.', searchTerms: ['hvitløk', 'hvitlok'] },
  { name: 'Macadamianøtter', emoji: '🌰', status: 'danger', description: 'Gir muskelsvakhet, oppkast, og feber. Selv få nøtter kan gi symptomer.', searchTerms: ['macadamia', 'macadamianøtter'] },
  { name: 'Avokado', emoji: '🥑', status: 'danger', description: 'Inneholder persin som er giftig for hunder. Stein og skall er verst.', searchTerms: ['avokado', 'avocado'] },
  { name: 'Alkohol', emoji: '🍺', status: 'danger', description: 'Selv små mengder kan gi koma, lavt blodsukker, og død. Pass på øl, vin, og deig som hever.', searchTerms: ['alkohol', 'øl', 'vin', 'sprit'] },
  { name: 'Kaffe og koffein', emoji: '☕', status: 'danger', description: 'Energidrikker, te, og kaffegrut er farlig. Kan gi hjerterytmeproblemer og kramper.', searchTerms: ['kaffe', 'koffein', 'te', 'energidrikk'] },
  { name: 'Rå deig (gjær)', emoji: '🥖', status: 'danger', description: 'Hever i magen og kan sprenge tarmen. Gjær produserer også alkohol — dobbel fare.', searchTerms: ['deig', 'gjær', 'rå brød'] },
  { name: 'Kokte ben', emoji: '🦴', status: 'danger', description: 'Splintres lett og kan stikke hull på tarm eller magesekk. Rå ben er tryggere, men sjekk med dyrlege.', searchTerms: ['ben', 'kokte ben', 'kyllingben'] },
  { name: 'Salt i store mengder', emoji: '🧂', status: 'danger', description: 'Saltet kjøtt, chips, popcorn med salt kan gi saltforgiftning. Begrens helt.', searchTerms: ['salt', 'chips', 'popcorn salt'] },
  { name: 'Rå poteter (grønne)', emoji: '🥔', status: 'danger', description: 'Grønne deler og spirer inneholder solanin som er giftig. Kokte og modne poteter er OK.', searchTerms: ['poteter', 'rå poteter'] },
  { name: 'Rabarbra', emoji: '🌿', status: 'danger', description: 'Bladene er svært giftige. Stilken inneholder oksalsyre som også er skadelig.', searchTerms: ['rabarbra'] },
  { name: 'Muskat', emoji: '🌶️', status: 'danger', description: 'Inneholder myristicin som kan gi kramper og hjerterytmeproblemer.', searchTerms: ['muskat', 'muskatnøtt'] },

  // FORSIKTIG (gult)
  { name: 'Melk', emoji: '🥛', status: 'caution', description: 'Mange voksne hunder er laktose-intolerante. Små mengder yoghurt eller cottage cheese er bedre.', searchTerms: ['melk', 'melkeprodukter'] },
  { name: 'Ost', emoji: '🧀', status: 'caution', description: 'OK i små mengder som godbit. Fettrik — kan gi diaré eller pankreatitt i store mengder.', searchTerms: ['ost', 'cheddar', 'gulost'] },
  { name: 'Brød', emoji: '🍞', status: 'caution', description: 'Trygt i små mengder hvis det ikke inneholder rosiner, sjokolade, eller xylitol. Lite næringsverdi.', searchTerms: ['brød', 'rundstykke'] },
  { name: 'Pasta', emoji: '🍝', status: 'caution', description: 'Kokt pasta uten saus er OK i små mengder. Saus med løk eller hvitløk er farlig.', searchTerms: ['pasta', 'spaghetti', 'makaroni'] },
  { name: 'Peanøttsmør', emoji: '🥜', status: 'caution', description: 'OK hvis det IKKE inneholder xylitol. Sjekk ingredienslisten nøye. Lite mengder.', searchTerms: ['peanøttsmør', 'peanut butter'] },
  { name: 'Honning', emoji: '🍯', status: 'caution', description: 'Trygt i små mengder for voksne hunder. Ikke gi til valper under 1 år.', searchTerms: ['honning'] },
  { name: 'Bacon', emoji: '🥓', status: 'caution', description: 'Veldig fettrik og saltrik. Kan gi pankreatitt. Sjelden og i små mengder.', searchTerms: ['bacon', 'spekkmat'] },
  { name: 'Aprikos / fersken', emoji: '🍑', status: 'caution', description: 'Fruktkjøttet er OK, men stein inneholder cyanid og kan også sette seg fast. Fjern alltid stein.', searchTerms: ['aprikos', 'fersken', 'plommer'] },
  { name: 'Nøtter (vanlige)', emoji: '🥜', status: 'caution', description: 'Mandler og hasselnøtter er ikke giftig, men vanskelig å fordøye. Macadamia er farlig.', searchTerms: ['nøtter', 'mandler', 'hasselnøtter'] },
  { name: 'Sopp', emoji: '🍄', status: 'caution', description: 'Vanlig matsjampignong fra butikken er OK. Ville sopper kan være dødelige — unngå alltid.', searchTerms: ['sopp', 'sjampinjong'] },
  { name: 'Sitrusfrukter', emoji: '🍋', status: 'caution', description: 'Sure og kan gi magesmerter. Skall inneholder oljer som irriterer. Unngå.', searchTerms: ['sitron', 'appelsin', 'mandarin', 'sitrus'] },
  { name: 'Kokosnøtt', emoji: '🥥', status: 'caution', description: 'Små mengder fruktkjøtt og olje er OK. Kokosvann har for mye kalium — unngå.', searchTerms: ['kokos', 'kokosnøtt'] },
  { name: 'Tunfisk (på boks)', emoji: '🐟', status: 'caution', description: 'OK lite, men ofte for salt og kan inneholde kvikksølv. Velg fersk fisk i stedet.', searchTerms: ['tunfisk', 'tuna'] },
  { name: 'Mais', emoji: '🌽', status: 'caution', description: 'Maiskorn er OK i små mengder. Kolben er FARLIG — kan sette seg fast i tarmen.', searchTerms: ['mais', 'maiskolbe'] },

  // TRYGT (grønt)
  { name: 'Eple', emoji: '🍎', status: 'safe', description: 'Trygt og sunt. Fjern alltid kjerne og frø (inneholder cyanid). Skall er OK.', searchTerms: ['eple', 'epler'] },
  { name: 'Banan', emoji: '🍌', status: 'safe', description: 'Trygt og kaliumrikt. Mye sukker — gi i moderasjon, gjerne som godbit eller frosset.', searchTerms: ['banan', 'bananer'] },
  { name: 'Blåbær', emoji: '🫐', status: 'safe', description: 'Trygt og rikt på antioksidanter. Fin som godbit.', searchTerms: ['blåbær', 'blueberries'] },
  { name: 'Jordbær', emoji: '🍓', status: 'safe', description: 'Trygt i moderate mengder. Fjern stilken. Vask grundig hvis ikke økologisk.', searchTerms: ['jordbær', 'bær'] },
  { name: 'Vannmelon', emoji: '🍉', status: 'safe', description: 'Trygt og forfriskende. Fjern frø og skall. Fin på varme dager.', searchTerms: ['vannmelon', 'melon'] },
  { name: 'Gulrot', emoji: '🥕', status: 'safe', description: 'Trygt og sunt — rå eller kokt. Også bra for tennene. Frossen gulrot er fin teether for valper.', searchTerms: ['gulrot', 'gulrøtter'] },
  { name: 'Brokkoli', emoji: '🥦', status: 'safe', description: 'OK i små mengder. Mer enn 10% av kosten kan gi mageproblemer.', searchTerms: ['brokkoli'] },
  { name: 'Grønnbønner', emoji: '🫛', status: 'safe', description: 'Trygt og fettfritt. Kokt eller rå. Gode godbiter for hunder på diett.', searchTerms: ['grønnbønner', 'bønner'] },
  { name: 'Søtpotet', emoji: '🍠', status: 'safe', description: 'Trygt og næringsrikt — bare kokt eller bakt. Aldri rå.', searchTerms: ['søtpotet', 'sweet potato'] },
  { name: 'Squash', emoji: '🥒', status: 'safe', description: 'Trygt rå eller kokt. Lavt i kalorier. Også agurk er trygt.', searchTerms: ['squash', 'agurk', 'zucchini'] },
  { name: 'Gresskar', emoji: '🎃', status: 'safe', description: 'Trygt og hjelper på fordøyelsen. Bruk vanlig hermetisert gresskar (ikke gresskarpai-fyll med krydder).', searchTerms: ['gresskar'] },
  { name: 'Kylling (kokt)', emoji: '🍗', status: 'safe', description: 'Trygt og protein-rikt. Kokt, uten ben, uten krydder. Bra ved mageproblemer.', searchTerms: ['kylling', 'kyllingkjøtt'] },
  { name: 'Kalkun (kokt)', emoji: '🦃', status: 'safe', description: 'Trygt — kokt og uten ben eller krydder. Magert protein.', searchTerms: ['kalkun'] },
  { name: 'Storfekjøtt (kokt)', emoji: '🥩', status: 'safe', description: 'Trygt — kokt, magert kjøtt uten krydder. Unngå fett rand.', searchTerms: ['storfe', 'biff', 'kjøtt'] },
  { name: 'Egg (kokt)', emoji: '🥚', status: 'safe', description: 'Trygt og næringsrikt — kokt eller stekt uten olje/salt. Råe egg er omdiskutert.', searchTerms: ['egg'] },
  { name: 'Laks (kokt)', emoji: '🐟', status: 'safe', description: 'Trygt — kokt eller bakt uten krydder. Aldri rå (kan ha parasitter).', searchTerms: ['laks', 'fisk'] },
  { name: 'Ris (kokt)', emoji: '🍚', status: 'safe', description: 'Trygt og lett å fordøye. Bra ved diaré eller mageproblemer. Hvit ris er enklest.', searchTerms: ['ris'] },
  { name: 'Havre / havregryn', emoji: '🌾', status: 'safe', description: 'Trygt og fiberrikt — kokt med vann (ikke melk). Bra for eldre hunder.', searchTerms: ['havre', 'havregryn', 'havregrøt'] },
  { name: 'Cottage cheese', emoji: '🧀', status: 'safe', description: 'Trygt i moderate mengder. God proteinkilde, lite laktose. Bra ved mageproblemer.', searchTerms: ['cottage cheese', 'kesam'] },
  { name: 'Yoghurt (naturell)', emoji: '🥛', status: 'safe', description: 'Trygt naturell, uten sukker eller xylitol. Probiotika kan hjelpe magen.', searchTerms: ['yoghurt', 'yogurt'] },
  // FARLIG – nye
  { name: 'Kirsebær', emoji: '🍒', status: 'danger', description: 'Steinen inneholder cyanid og er en kvelningsfare. Fruktkjøttet er OK, men ALDRI gi hele kirsebær til hunden.', searchTerms: ['kirsebær', 'morell'] },
  { name: 'Lakris', emoji: '🍬', status: 'danger', description: 'Inneholder glycyrrhizinsyre som kan gi forhøyet blodtrykk, lavt kalium, og hjerteproblemer. Også mye sukker.', searchTerms: ['lakris'] },
  { name: 'Plommestein / kjernefrukt', emoji: '🍑', status: 'danger', description: 'Stein/kjerne i plomme, fersken, aprikos og kirsebær inneholder cyanid. Fjern alltid steinen, så er fruktkjøttet OK.', searchTerms: ['plomme', 'stein', 'kjerne'] },
  { name: 'Søtningsstoffer (sukrin, stevia, isomalt)', emoji: '🧁', status: 'danger', description: 'Mange sukkerfrie produkter inneholder xylitol — sjekk alltid. Selv andre søtningsstoffer kan gi mageproblemer.', searchTerms: ['søtningsstoff', 'sukrin', 'stevia', 'isomalt'] },
  { name: 'Pølser fra grill / spekemat', emoji: '🌭', status: 'danger', description: 'Spekepølse, salami og krydret pølse inneholder ofte løk, hvitløk, og mye salt. Unngå.', searchTerms: ['pølse', 'spekepølse', 'salami'] },

  // FORSIKTIG – nye
  { name: 'Brunost', emoji: '🧀', status: 'caution', description: 'Norsk spesialitet, men inneholder mye sukker og fett. Smal skive som godbit OK — ikke daglig.', searchTerms: ['brunost', 'geitost'] },
  { name: 'Pinnekjøtt', emoji: '🍖', status: 'caution', description: 'Lammekjøttet er OK, men det er svært saltet. Skyll og bland med ris. Aldri ben.', searchTerms: ['pinnekjøtt', 'lammeribbe'] },
  { name: 'Ribbe', emoji: '🥓', status: 'caution', description: 'Svinekjøttet er ikke giftig, men fettet kan gi pankreatitt. Svor og ben er farlig. Hold deg unna.', searchTerms: ['ribbe', 'julemat'] },
  { name: 'Lutefisk', emoji: '🐟', status: 'caution', description: 'Lutekonsentrasjonen er normalt vasket ut, men fisken er sterkt krydret og servert med flesk/erter. Best å unngå.', searchTerms: ['lutefisk'] },
  { name: 'Bløtkake / kremkake', emoji: '🎂', status: 'caution', description: 'Mye sukker og fett. Marsipan og noen toppinger kan inneholde xylitol. Liten bit til høytid OK.', searchTerms: ['bløtkake', 'kake', 'marsipan'] },
  { name: 'Smør', emoji: '🧈', status: 'caution', description: 'Ikke giftig, men fettrik. Små mengder OK (f.eks. til medisin). Store mengder kan gi pankreatitt.', searchTerms: ['smør', 'margarin'] },
  { name: 'Fløte / kremfløte', emoji: '🥛', status: 'caution', description: 'Mye fett og laktose. Små mengder OK for de fleste hunder, men kan gi diaré.', searchTerms: ['fløte', 'kremfløte'] },
  { name: 'Skinke (kokt)', emoji: '🍖', status: 'caution', description: 'Saltet kjøtt. Ekstremt salt over tid kan gi nyreproblemer. Sjelden og i moderasjon.', searchTerms: ['skinke', 'kokt skinke'] },
  { name: 'Marshmallows', emoji: '☁️', status: 'caution', description: 'Ren sukker — ikke direkte giftig, men dårlig ernæring. Sjekk at det ikke er xylitol-versjon.', searchTerms: ['marshmallows', 'sukkertøy'] },
  { name: 'Popcorn', emoji: '🍿', status: 'caution', description: 'Plain popcorn (uten smør/salt) er OK. Uoppete korn er kvelningsfare. Smør/salt-versjoner unngås.', searchTerms: ['popcorn'] },
  { name: 'Knekkebrød', emoji: '🍞', status: 'caution', description: 'Trygt hvis det er usaltet og uten frø/krydder som mage ikke tåler. Sjekk ingredienser.', searchTerms: ['knekkebrød'] },
  { name: 'Pasta-saus', emoji: '🍝', status: 'caution', description: 'Mange sauser inneholder løk, hvitløk eller mye salt. Sjekk ingredienser. Plain tomatsaus uten krydder er OK.', searchTerms: ['pasta saus', 'tomatsaus'] },
  { name: 'Hvit bønner / linser', emoji: '🫘', status: 'caution', description: 'Kokte bønner og linser er OK i små mengder. Rå er giftig. Unngå hermetisk med salt.', searchTerms: ['bønner', 'linser'] },
  { name: 'Sjokoladekake / -mousse', emoji: '🍰', status: 'caution', description: 'Inneholder sjokolade (giftig) + mye sukker. Mengden sjokolade varierer — sjekk SOS Dyrlege ved usikkerhet.', searchTerms: ['sjokoladekake', 'mousse'] },

  // TRYGT – nye
  { name: 'Mango', emoji: '🥭', status: 'safe', description: 'Trygt — fjern skall og stein. Søtt, så gi i moderasjon.', searchTerms: ['mango'] },
  { name: 'Pasjonsfrukt', emoji: '🍈', status: 'safe', description: 'Selve fruktkjøttet er trygt i små mengder. Frøene er harde — finhakk eller la være.', searchTerms: ['pasjonsfrukt'] },
  { name: 'Kiwi', emoji: '🥝', status: 'safe', description: 'Trygt og C-vitaminrikt. Skjær opp og gi noen biter. Skall kan irritere magen.', searchTerms: ['kiwi'] },
  { name: 'Ananas', emoji: '🍍', status: 'safe', description: 'Trygt i moderasjon. Fjern skall og kjerne. Inneholder bromelain som kan hjelpe på fordøyelse.', searchTerms: ['ananas'] },
  { name: 'Pære', emoji: '🍐', status: 'safe', description: 'Trygt. Fjern alltid kjerne og frø (cyanid). Skall er OK å spise.', searchTerms: ['pære'] },
  { name: 'Plomme (uten stein)', emoji: '🍑', status: 'safe', description: 'Fruktkjøttet er trygt og fiberrikt. ALDRI gi steinen — den inneholder cyanid og kan sette seg fast.', searchTerms: ['plomme', 'fersken'] },
  { name: 'Tyttebær', emoji: '🔴', status: 'safe', description: 'Trygt og syrlig. Litt bittert — noen hunder liker det, andre ikke. Bra antioksidanter.', searchTerms: ['tyttebær'] },
  { name: 'Bringebær', emoji: '🫐', status: 'safe', description: 'Trygt og fiberrikt. Inneholder lite naturlig xylitol — i små mengder ufarlig.', searchTerms: ['bringebær'] },
  { name: 'Bjørnebær', emoji: '🫐', status: 'safe', description: 'Trygt og rikt på antioksidanter. Vask grundig hvis du plukker selv.', searchTerms: ['bjørnebær'] },
  { name: 'Rødbete', emoji: '🥬', status: 'safe', description: 'Trygt — kokt eller rå (revet). Rikt på folat og jern. NB: kan gjøre urin/avføring rødlig — det er ufarlig.', searchTerms: ['rødbete'] },
  { name: 'Spinat', emoji: '🥬', status: 'safe', description: 'Trygt i moderasjon. Store mengder kan binde kalsium pga oksalater. Som tilskudd, ikke hoveddel.', searchTerms: ['spinat'] },
  { name: 'Asparges', emoji: '🌱', status: 'safe', description: 'Trygt — kokt er enklest å fordøye. Lite næringsverdi, men ufarlig.', searchTerms: ['asparges'] },
  { name: 'Salat / isbergsalat', emoji: '🥗', status: 'safe', description: 'Trygt og friskt. Lite næring, men greit som godbit på varme dager.', searchTerms: ['salat', 'isbergsalat'] },
  { name: 'Kålrabi', emoji: '🥬', status: 'safe', description: 'Trygt rå eller kokt. Bra fiber. Inneholder noen forbindelser som kan irritere store mengder — moderat bruk.', searchTerms: ['kålrabi', 'kalrabi'] },
  { name: 'Reker (kokt)', emoji: '🦐', status: 'safe', description: 'Trygt — kokt, uten skall og hale. Magert protein. Aldri rå.', searchTerms: ['reker', 'rejer'] },
  { name: 'Sardiner (i vann)', emoji: '🐟', status: 'safe', description: 'Trygt — velg uten salt eller olje. Bra omega-3 og kalsium (bena er bløte).', searchTerms: ['sardiner'] },
  { name: 'Makrell (kokt)', emoji: '🐟', status: 'safe', description: 'Trygt — kokt eller bakt, uten salt. Rik på omega-3. Sjekk for ben.', searchTerms: ['makrell'] },
  { name: 'Sild (fersk, kokt)', emoji: '🐟', status: 'safe', description: 'Fersk sild er OK i moderasjon — uten salt. Salt sild og spekesild er IKKE OK.', searchTerms: ['sild', 'spekesild'] },
  { name: 'Risengrynsgrøt (uten sukker)', emoji: '🍚', status: 'safe', description: 'Trygt og mild for magen. Lag uten salt eller sukker. Bra ved diaré.', searchTerms: ['grøt', 'risengrynsgrøt'] },
  { name: 'Lever (kokt)', emoji: '🥩', status: 'safe', description: 'Trygt i moderasjon — kokt lever er proteinkilde. Max 1 gang i uka. For mye gir A-vitamin-forgiftning over tid.', searchTerms: ['lever'] },
  { name: 'Buljong (uten salt og løk)', emoji: '🍲', status: 'safe', description: 'Hjemmelaget buljong uten salt eller løk er bra. Kjøpt buljong er ofte for salt. Sjekk ingredienser.', searchTerms: ['buljong', 'kraft'] },
]

const STATUS_LABELS: Record<Status, { label: string; emoji: string; color: string; bg: string }> = {
  safe: { label: 'Trygt', emoji: '🟢', color: '#1e7e34', bg: '#d4edda' },
  caution: { label: 'Med forsiktighet', emoji: '🟡', color: '#856404', bg: '#fff3cd' },
  danger: { label: 'Farlig', emoji: '🔴', color: '#721c24', bg: '#f8d7da' },
}

export default function FoodCheckerScreen({ navigation }: any) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Status | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = FOODS
    if (filter !== 'all') list = list.filter(f => f.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.searchTerms?.some(t => t.toLowerCase().includes(q))
      )
    }
    // Sortering: farlig først, så caution, så safe (eller alfabetisk hvis filtrert)
    return list.sort((a, b) => {
      const order: Record<Status, number> = { danger: 0, caution: 1, safe: 2 }
      if (a.status !== b.status) return order[a.status] - order[b.status]
      return a.name.localeCompare(b.name, 'nb')
    })
  }, [search, filter])

  const counts = useMemo(() => ({
    danger: FOODS.filter(f => f.status === 'danger').length,
    caution: FOODS.filter(f => f.status === 'caution').length,
    safe: FOODS.filter(f => f.status === 'safe').length,
  }), [])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>◀ Tilbake</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🥩 Kan hunden spise dette?</Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Søk etter matvare..."
          placeholderTextColor={Colors.gray}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <TouchableOpacity style={[styles.chip, filter === 'all' && styles.chipActive]} onPress={() => setFilter('all')}>
            <Text style={[styles.chipText, filter === 'all' && styles.chipTextActive]}>Alle ({FOODS.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, filter === 'danger' && styles.chipActive]} onPress={() => setFilter('danger')}>
            <Text style={[styles.chipText, filter === 'danger' && styles.chipTextActive]}>🔴 Farlig ({counts.danger})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, filter === 'caution' && styles.chipActive]} onPress={() => setFilter('caution')}>
            <Text style={[styles.chipText, filter === 'caution' && styles.chipTextActive]}>🟡 Forsiktig ({counts.caution})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, filter === 'safe' && styles.chipActive]} onPress={() => setFilter('safe')}>
            <Text style={[styles.chipText, filter === 'safe' && styles.chipTextActive]}>🟢 Trygt ({counts.safe})</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 60 }}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>Ingen treff på "{search}"</Text>
            <Text style={styles.emptyHint}>
              Vi har {FOODS.length} matvarer registrert. Hvis du er usikker, ring dyrlege eller Giftinformasjonen.
            </Text>
          </View>
        ) : (
          filtered.map(food => {
            const statusInfo = STATUS_LABELS[food.status]
            const isExpanded = expanded === food.name
            return (
              <TouchableOpacity
                key={food.name}
                style={[styles.foodCard, { borderLeftColor: statusInfo.color }]}
                onPress={() => setExpanded(isExpanded ? null : food.name)}
                activeOpacity={0.8}
              >
                <View style={styles.foodHeader}>
                  <Text style={styles.foodEmoji}>{food.emoji}</Text>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
                      {statusInfo.emoji} {statusInfo.label}
                    </Text>
                  </View>
                </View>
                {isExpanded && (
                  <Text style={styles.foodDesc}>{food.description}</Text>
                )}
              </TouchableOpacity>
            )
          })
        )}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ Dette er en generell guide. Hvis hunden har spist noe farlig, ring{' '}
            <Text style={styles.bold}>Giftinformasjonen på 22 59 13 00</Text> eller en dyrlege.
          </Text>
          <TouchableOpacity style={styles.sosLink} onPress={() => navigation.navigate('SOSVet')}>
            <Text style={styles.sosLinkText}>→ Åpne SOS Dyrlege</Text>
          </TouchableOpacity>
        </View>

        {/* Buddy.no affiliate – diskret, kontekstuell */}
        <View style={styles.partnerCard}>
          <Text style={styles.partnerTitle}>🦴 Kvalitetsmat og godbiter</Text>
          <Text style={styles.partnerBody}>
            God hundemat er den beste forebyggingen. Buddy.no har et bredt utvalg av norsk hundemat, godbiter og kosttilskudd.
          </Text>
          <TouchableOpacity style={styles.partnerBtn} onPress={() => Linking.openURL(AFFILIATE.buddy)}>
            <Text style={styles.partnerBtnText}>Utforsk hundemat på Buddy.no →</Text>
          </TouchableOpacity>
          <Text style={styles.partnerDisclosure}>{AFFILIATE_DISCLOSURE}</Text>
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
  headerTitle: { color: Colors.white, fontSize: FontSize.md, fontWeight: '800', marginLeft: Spacing.md, flex: 1 },

  searchSection: { backgroundColor: Colors.white, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.grayLight },
  searchInput: { backgroundColor: Colors.grayLight, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.dark },
  filterRow: { gap: Spacing.sm, paddingVertical: 4 },
  chip: { backgroundColor: Colors.grayLight, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 6, marginRight: 6 },
  chipActive: { backgroundColor: Colors.green },
  chipText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.dark },
  chipTextActive: { color: Colors.white },

  scroll: { flex: 1, padding: Spacing.md },

  foodCard: { backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderLeftWidth: 4 },
  foodHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  foodEmoji: { fontSize: 24 },
  foodName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.dark, flex: 1 },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  statusBadgeText: { fontSize: 11, fontWeight: '800' },
  foodDesc: { fontSize: FontSize.sm, color: Colors.dark, marginTop: Spacing.sm, lineHeight: 20 },

  empty: { alignItems: 'center', padding: Spacing.xl, gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.dark },
  emptyHint: { fontSize: FontSize.sm, color: Colors.gray, textAlign: 'center', lineHeight: 20 },

  disclaimer: { backgroundColor: '#fff3cd', borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.lg },
  disclaimerText: { fontSize: FontSize.xs, color: '#856404', lineHeight: 18 },
  bold: { fontWeight: '800' },
  sosLink: { marginTop: Spacing.sm, alignSelf: 'flex-start' },
  sosLinkText: { color: '#c0392b', fontWeight: '800', fontSize: FontSize.sm },

  // Partner (Buddy.no – diskret affiliate)
  partnerCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.md, borderWidth: 1, borderColor: Colors.greenPale },
  partnerTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.dark, marginBottom: Spacing.sm },
  partnerBody: { fontSize: FontSize.sm, color: Colors.dark, lineHeight: 20, marginBottom: Spacing.md },
  partnerBtn: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.green, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  partnerBtnText: { color: Colors.green, fontWeight: '700', fontSize: FontSize.sm },
  partnerDisclosure: { fontSize: 10, color: Colors.gray, marginTop: Spacing.sm, textAlign: 'center', fontStyle: 'italic' },
})
