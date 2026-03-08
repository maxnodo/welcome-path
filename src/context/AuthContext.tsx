import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
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

  useEffect(() => {
    // Set up listener BEFORE getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          // Set loading true while we fetch the profile
          setLoading(true)
          // Use setTimeout to avoid deadlock with Supabase auth
          setTimeout(() => fetchProfile(session.user.id), 0)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      if (!error && data) {
        setProfile(data as Profile)
      }
    } finally {
      setLoading(false)
    }
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id)
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
    setSession(null)
    setUser(null)
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
