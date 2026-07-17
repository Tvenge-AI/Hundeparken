// Affiliate-lenker og partnerdata for Hundeparken
//
// VIKTIG: Bytt URL-ene under når affiliate-program er godkjent (via Adtraction eller direkte).
// Når lenken er klar, oppdater bare verdien her - alle skjermer som bruker den oppdateres automatisk.
//
// Status (5. juni 2026):
// - Agria: placeholder, venter på Adtraction-godkjenning
// - DyreID: placeholder, søker via NKK/Adtraction
// - Buddy.no: placeholder, søker via Adtraction
// - Zooplus: placeholder, internasjonalt affiliate-nettverk
//
// Disclosure: alle skjermer som bruker affiliate-lenker skal vise tydelig
// "Hundeparken kan motta provisjon"-tekst (norsk markedsføringslov + Apple-retningslinjer).

export const AFFILIATE = {
  // Hundeforsikring
  agria: 'https://www.agria.no/hund/',

  // Chip-registrering
  dyreid: 'https://www.dyreid.no/',

  // Hundeutstyr og foder
  buddy: 'https://www.buddy.no/',
  zooplus: 'https://www.zooplus.no/',
} as const

// Felles disclosure-tekst
export const AFFILIATE_DISCLOSURE = 'Hundeparken kan motta provisjon for nye signups.'

// Strukturert partnerdata - brukes av "Anbefalt tjenester"-skjermen
export type Partner = {
  id: string
  emoji: string
  name: string
  category: string
  pitch: string
  cta: string
  url: string
  bg: string
  accent: string
  featured?: boolean
}

export const PARTNERS: Partner[] = [
  {
    id: 'agria',
    emoji: '🛡️',
    name: 'Agria Dyreforsikring',
    category: 'Hundeforsikring',
    pitch: 'Norges største på dyreforsikring. Dekker uventede veterinærutgifter, kirurgi, sykdom og ulykke. Trygghet for både hund og lommebok.',
    cta: 'Sjekk forsikring',
    url: AFFILIATE.agria,
    bg: '#E8F5E9',
    accent: '#2e7d32',
    featured: true,
  },
  {
    id: 'dyreid',
    emoji: '🆔',
    name: 'DyreID',
    category: 'Chip-registrering',
    pitch: 'Norges offisielle ID-register for hunder. Registrer Chip-ID-en din her — det gjør det mye lettere å finne hunden om den blir borte.',
    cta: 'Registrer chip',
    url: AFFILIATE.dyreid,
    bg: '#E8F0FF',
    accent: '#1976d2',
  },
  {
    id: 'buddy',
    emoji: '🦴',
    name: 'Buddy.no',
    category: 'Mat og godbiter',
    pitch: 'Norsk butikk med bredt utvalg av hundemat, godbiter og kosttilskudd. Levering til hele Norge.',
    cta: 'Utforsk mat',
    url: AFFILIATE.buddy,
    bg: '#FFF3E8',
    accent: '#e67e22',
  },
  {
    id: 'zooplus',
    emoji: '🛍️',
    name: 'Zooplus',
    category: 'Utstyr og leker',
    pitch: 'Stort europeisk utvalg av halsbånd, bånd, leker, kurver og alt annet du trenger til hunden. Konkurransedyktige priser.',
    cta: 'Se utvalg',
    url: AFFILIATE.zooplus,
    bg: '#F0E8FF',
    accent: '#8e44ad',
  },
]
