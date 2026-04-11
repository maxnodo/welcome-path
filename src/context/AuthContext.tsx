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
  const [userId, setUserId] = useState<string | null>(null)
  const isFetching = useRef(false)

  // Effect 1: Auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          if (session?.user) {
            setLoading(true)
            setUserId(session.user.id)
          } else {
            setProfile(null)
            setUserId(null)
            setLoading(false)
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
          setUserId(null)
          setLoading(false)
        }
        // TOKEN_REFRESHED: session/user updated above, no loading/profile change
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Effect 2: Fetch profile when userId changes
  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }

    if (isFetching.current) return

    let cancelled = false
    isFetching.current = true

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()
        if (!cancelled) {
          if (!error && data) {
            setProfile(data as Profile)
          }
          setLoading(false)
        }
      } finally {
        isFetching.current = false
      }
    }
    fetchProfile()

    return () => {
      cancelled = true
    }
  }, [userId])

  async function refreshProfile() {
    if (!user) return
    if (isFetching.current) return

    isFetching.current = true
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      if (!error && data) {
        setProfile(data as Profile)
      }
    } finally {
      isFetching.current = false
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
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
