import { create } from 'zustand'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Profile, Dog } from '../types'

type AuthStore = {
  session: Session | null
  user: User | null
  profile: Profile | null
  dogs: Dog[]
  loading: boolean
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setDogs: (dogs: Dog[]) => void
  fetchProfile: () => Promise<void>
  fetchDogs: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  dogs: [],
  loading: true,
  setSession: (session) => set({ session, user: session?.user ?? null, loading: false }),
  setProfile: (profile) => set({ profile }),
  setDogs: (dogs) => set({ dogs }),
  fetchProfile: async () => {
    const { user } = get()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) set({ profile: data })
  },
  fetchDogs: async () => {
    const { user } = get()
    if (!user) return
    const { data } = await supabase.from('dogs').select('*').eq('owner_id', user.id).eq('is_active', true).order('created_at')
    if (data) set({ dogs: data })
  },
  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null, profile: null, dogs: [] })
  },
}))
