import { supabase } from '@/lib/supabase'

/**
 * Creates an automatic alert for a gestor when they are assigned a new expediente.
 * Called when: creating expediente, reassigning advisor, converting lead.
 */
export async function notifyGestorAssignment({
  advisorId,
  tramiteName,
  userName,
  expedienteId,
  createdBy,
}: {
  advisorId: string
  tramiteName: string
  userName: string
  expedienteId?: string | null
  createdBy: string
}) {
  await supabase.from('alertas').insert({
    user_id: advisorId,
    type: 'recordatorio',
    title: 'Nuevo expediente asignado',
    description: `Trámite: ${tramiteName} — Usuario: ${userName}`,
    expediente_id: expedienteId ?? null,
    created_by: createdBy,
  })
}
