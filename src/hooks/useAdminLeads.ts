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
  advisor_id: string | null
  status: 'pending' | 'converted'
  created_at: string
}

export function useAdminLeads() {
  const { user, isGestor } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchLeads() {
    if (!user || !isGestor) return
    setLoading(true)
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    setLeads((data as Lead[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (!user || !isGestor) return
    const channelName = `leads-rt-${user.id}-${++mountCounter}`

    fetchLeads()

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeads()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, isGestor])

  async function updateLead(id: string, updates: Partial<Lead>) {
    const { error } = await supabase.from('leads').update(updates).eq('id', id)
    if (!error) await fetchLeads()
    return { error }
  }

  return { leads, loading, updateLead, refetch: fetchLeads }
}
