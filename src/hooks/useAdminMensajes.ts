import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Mensaje } from '@/types/database.types'

let adminMensajesCounter = 0

const PAGE_SIZE = 25

export function useAdminMensajes() {
  const { user, isGestor, isAdmin } = useAuth()
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  async function fetchMensajes() {
    if (!user || !isGestor) return
    setLoading(true)

    let query = supabase
      .from('mensajes')
      .select('*, sender:profiles!mensajes_sender_id_fkey(*), receiver:profiles!mensajes_receiver_id_fkey(*)', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (isGestor && !isAdmin) {
      query = query.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    }

    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    query = query.range(from, to)

    const { data, count } = await query
    setMensajes((data as Mensaje[]) ?? [])
    setTotalCount(count ?? 0)
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
  }, [user?.id, isGestor, isAdmin, page])

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

  return {
    mensajes, loading, sendReply, refetch: fetchMensajes,
    page, totalCount, pageSize: PAGE_SIZE,
    hasMore: (page + 1) * PAGE_SIZE < totalCount,
    nextPage: () => setPage(p => p + 1),
    prevPage: () => setPage(p => Math.max(0, p - 1)),
  }
}
