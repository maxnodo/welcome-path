import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/database.types'

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean
  isGestor: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const isFetching = useRef(false)

  async function fetchProfileByUserId(userId: string | null) {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }

    if (isFetching.current) return

    isFetching.current = true
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (!error && data) {
        setProfile(data as Profile)
      } else if (!data) {
        setProfile(null)
      }
    } finally {
      isFetching.current = false
      setLoading(false)
    }
  }

  // Effect 1: auth bootstrap and session listener
  useEffect(() => {
    let cancelled = false

    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return

      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        setLoading(true)
        await fetchProfileByUserId(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    }

    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (event === 'SIGNED_OUT') {
          setProfile(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          setLoading(true)
          await fetchProfileByUserId(session.user.id)
          return
        }

        setProfile(null)
        setLoading(false)
      }
    )

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  async function refreshProfile() {
    if (!user) return
    if (isFetching.current) return

    await fetchProfileByUserId(user.id)
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    })
    if (!error && data.session?.user) {
      setSession(data.session)
      setUser(data.session.user)
      setLoading(true)
      await fetchProfileByUserId(data.session.user.id)
    }
    return { error: error as Error | null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const isAuthenticated = !!session
  const isGestor = profile?.role === 'gestor' || profile?.role === 'admin'
  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{
      session, user, profile, loading, isAuthenticated,
      isGestor, isAdmin, signIn, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
