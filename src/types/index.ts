export type Park = {
  id: string
  name: string
  description: string | null
  lat: number
  lng: number
  address: string | null
  city: string | null
  county: string | null
  type: 'park' | 'slette' | 'friomrade' | 'strand'
  size: 'liten' | 'middels' | 'stor' | null
  fenced: boolean
  parking: boolean
  water: boolean
  lighting: boolean
  waste_bins: boolean
  photo_url: string | null
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  distance_meters?: number
  active_checkins?: number
  avg_rating?: number
}

export type Profile = {
  id: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export type Dog = {
  id: string
  owner_id: string
  name: string
  breed: string | null
  age_years: number | null
  birthdate?: string | null
  size: 'liten' | 'middels' | 'stor' | null
  temperament: string[]
  bio: string | null
  photo_url: string | null
  chip_id: string | null
  allergies: string | null
  medications: string | null
  health_notes: string | null
  neutered: boolean | null
  neutered_date: string | null
  next_vet_visit: string | null
  is_active: boolean
  created_at: string
}

export type Vaccination = {
  id: string
  dog_id: string
  vaccine_name: string
  vaccine_date: string
  next_due_date: string | null
  notes: string | null
  created_at: string
}

export type Checkin = {
  id: string
  park_id: string
  user_id: string
  dog_id: string
  note: string | null
  is_anonymous: boolean
  checked_in_at: string
  checked_out_at: string | null
  is_active: boolean
  dog?: Dog
  profile?: Profile
  park?: Park
}

export type Review = {
  id: string
  park_id: string
  user_id: string
  rating: number
  body: string | null
  photo_urls: string[]
  created_at: string
  profile?: Profile
}

export type Meetup = {
  id: string
  park_id: string
  organizer_id: string
  title: string
  description: string | null
  starts_at: string
  max_dogs: number | null
  is_public: boolean
  created_at: string
  park?: Park
  organizer?: Profile
  rsvp_count?: number
}
