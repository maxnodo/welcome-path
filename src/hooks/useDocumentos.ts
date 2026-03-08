import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export function useDocumentos() {
  const { user } = useAuth()

  async function uploadDocument(file: File, expedienteId: string, documentType: string) {
    if (!user) return { error: new Error('No autenticado') }

    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
    const filePath = `${user.id}/${expedienteId}/${timestamp}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('documentos-tramite')
      .upload(filePath, file, { contentType: file.type })

    if (uploadError) return { error: uploadError }

    const { error: dbError } = await supabase.from('documentos').insert({
      expediente_id: expedienteId,
      user_id: user.id,
      document_type: documentType,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      status: 'pendiente',
    })

    return { error: dbError }
  }

  async function getDocumentUrl(filePath: string) {
    const { data } = await supabase.storage
      .from('documentos-tramite')
      .createSignedUrl(filePath, 3600)
    return data?.signedUrl ?? null
  }

  return { uploadDocument, getDocumentUrl }
}
