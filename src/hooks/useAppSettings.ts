import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export function useAppSettings() {
  const { user, isAdmin } = useAuth()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    if (!user || !isAdmin) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase.from('app_settings').select('key, value')
    const map: Record<string, string> = {}
    ;(data ?? []).forEach((r: any) => { map[r.key] = r.value })
    setSettings(map)
    setLoading(false)
  }, [user?.id, isAdmin])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  async function saveSettings(entries: Record<string, string>) {
    const rows = Object.entries(entries).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }))
    const { error } = await supabase
      .from('app_settings')
      .upsert(rows, { onConflict: 'key' })
    if (!error) setSettings(prev => ({ ...prev, ...entries }))
    return { error }
  }

  return { settings, loading, saveSettings, refetch: fetchSettings }
}
