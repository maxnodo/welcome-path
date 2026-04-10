import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Cita } from '@/types/database.types'

export function useAdminCitas() {
  const { user, isGestor, isAdmin } = useAuth()
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchCitas() {
    if (!user || !isGestor) return
    setLoading(true)
    let query = supabase
      .from('citas')
      .select('*, advisor:profiles!citas_advisor_id_fkey(*), user:profiles!citas_user_id_fkey(*)')
      .order('scheduled_at', { ascending: true })

    // Gestor (not admin) only sees citas where they are the advisor
    if (isGestor && !isAdmin) {
      query = query.eq('advisor_id', user.id)
    }

    const { data } = await query
    setCitas((data as any[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCitas()
  }, [user?.id, isGestor, isAdmin])

  async function updateCita(id: string, updates: Partial<Cita>) {
    const { error } = await supabase.from('citas').update(updates).eq('id', id)
    if (!error) await fetchCitas()
    return { error }
  }

  return { citas, loading, updateCita, refetch: fetchCitas }
}
