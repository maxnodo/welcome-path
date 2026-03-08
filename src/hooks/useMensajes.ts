import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Mensaje } from '@/types/database.types'

export function useMensajes() {
  const { user } = useAuth()
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchMensajes() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('mensajes')
      .select('*, sender:profiles!mensajes_sender_id_fkey(*), receiver:profiles!mensajes_receiver_id_fkey(*)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: true })
    setMensajes((data as Mensaje[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchMensajes()

    if (!user) return
    const channel = supabase
      .channel('mensajes-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes',
        filter: `receiver_id=eq.${user.id}`,
      }, () => fetchMensajes())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  async function sendMensaje(receiverId: string, content: string, expedienteId?: string, attachmentPath?: string, attachmentName?: string) {
    if (!user) return
    await supabase.from('mensajes').insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content,
      expediente_id: expedienteId ?? null,
      attachment_path: attachmentPath ?? null,
      attachment_name: attachmentName ?? null,
      conversation_type: 'tramite',
    })
    await fetchMensajes()
  }

  async function markAsRead(id: string) {
    await supabase.from('mensajes').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', id)
    await fetchMensajes()
  }

  const unreadCount = mensajes.filter(m => m.receiver_id === user?.id && !m.is_read).length

  return { mensajes, loading, sendMensaje, markAsRead, unreadCount, refetch: fetchMensajes }
}
