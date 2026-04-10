import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

let adminMensajesCounter = 0
import { useAuth } from '@/context/AuthContext'
import { Mensaje } from '@/types/database.types'

export function useAdminMensajes() {
  const { user, isGestor, isAdmin } = useAuth()
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchMensajes() {
    if (!user || !isGestor) return
    setLoading(true)

    let query = supabase
      .from('mensajes')
      .select('*, sender:profiles!mensajes_sender_id_fkey(*), receiver:profiles!mensajes_receiver_id_fkey(*)')
      .order('created_at', { ascending: false })

    // Gestor (not admin) only sees conversations they are part of
    if (isGestor && !isAdmin) {
      query = query.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    }

    const { data } = await query
    setMensajes((data as Mensaje[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchMensajes()

    if (!user) return
    const channel = supabase
      .channel(`admin-mensajes-rt-${++adminMensajesCounter}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes',
      }, () => fetchMensajes())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, isGestor, isAdmin])

  async function sendReply(receiverId: string, content: string, expedienteId?: string) {
    if (!user) return
    await supabase.from('mensajes').insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content,
      expediente_id: expedienteId ?? null,
      conversation_type: 'tramite',
    })
    await fetchMensajes()
  }

  return { mensajes, loading, sendReply, refetch: fetchMensajes }
}
