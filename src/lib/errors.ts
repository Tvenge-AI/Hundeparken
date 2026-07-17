// Oversetter rå feil (særlig nettverksfeil) til vennlige, norske meldinger.
// Brukes bl.a. i innlogging/registrering så brukere slipper skumle "network fail".

export function isNetworkError(error: any): boolean {
  const msg = (error?.message || String(error || '')).toLowerCase()
  return (
    error?.name === 'AuthRetryableFetchError' ||
    msg.includes('network request failed') ||
    msg.includes('network') ||
    msg.includes('failed to fetch') ||
    msg.includes('load failed') ||
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('connection')
  )
}

const NORWEGIAN_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Feil e-post eller passord. Prøv igjen.',
  'User already registered': 'Denne e-posten er allerede registrert. Prøv å logge inn i stedet.',
  'Password should be at least 6 characters': 'Passordet må være minst 6 tegn.',
  'Unable to validate email address: invalid format': 'E-postadressen ser ikke riktig ut.',
  'Email not confirmed': 'Du må bekrefte e-posten din før du kan logge inn.',
  'Signup requires a valid password': 'Skriv inn et gyldig passord.',
}

export function friendlyError(error: any): string {
  if (isNetworkError(error)) {
    return 'Får ikke kontakt med serveren akkurat nå. Sjekk at du har nett, og prøv igjen. 🐾'
  }
  const msg = error?.message
  if (!msg) return 'Noe gikk galt. Prøv igjen om litt.'
  return NORWEGIAN_MESSAGES[msg] || msg
}
