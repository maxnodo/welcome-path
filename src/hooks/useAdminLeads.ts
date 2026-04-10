import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

let mountCounter = 0

export interface Lead {
  id: string
  nombre: string
  email: string | null
  telefono: string
  pais_origen: string | null
  necesidad: string | null
  ubicacion: string | null
  cuando: string | null
  descripcion: string | null
  created_at: string
}

export function useAdminLeads() {
  const { user, isGestor } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !isGestor) return
    const channelName = `leads-rt-${user.id}-${++mountCounter}`

    async function fetch() {
      setLoading(true)
      const { data } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      setLeads((data as Lead[]) ?? [])
      setLoading(false)
    }

    fetch()

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
        setLeads(prev => [payload.new as Lead, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, isGestor])

  return { leads, loading }
}
