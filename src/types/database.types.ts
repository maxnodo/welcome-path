export type UserRole = 'user' | 'gestor' | 'admin'

export type ExpedienteStatus =
  | 'no_iniciado'
  | 'documentacion_incompleta'
  | 'en_revision'
  | 'requerimiento_adicional'
  | 'presentado'
  | 'aprobado'
  | 'finalizado'
  | 'denegado'
  | 'archivado'

export type AlertaType =
  | 'urgente'
  | 'recordatorio'
  | 'presentacion_pendiente'
  | 'resolucion'

export type DocumentoStatus =
  | 'pendiente'
  | 'en_revision'
  | 'validado'
  | 'rechazado'

export interface Profile {
  id: string
  full_name: string | null
  nationality: string | null
  email: string | null
  document_type: string | null
  document_number: string | null
  birth_date: string | null
  second_nationality: string | null
  civil_status: string | null
  phone: string | null
  street: string | null
  street_number: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  country: string | null
  migration_status: string | null
  visa_type: string | null
  entry_date: string | null
  permit_expiry: string | null
  expediente_number: string | null
  expediente_office: string | null
  acting_on_behalf: boolean
  representative_name: string | null
  representative_document: string | null
  representative_relation: string | null
  declaration_verified: boolean
  declaration_responsibility: boolean
  declaration_understood: boolean
  role: UserRole
  advisor_id: string | null
  created_at: string
  updated_at: string
}

export interface TramiteCatalog {
  id: string
  code: string
  name: string
  description: string | null
  badge: string | null
  badge_color: string | null
  is_active: boolean
  created_at: string
}

export interface Expediente {
  id: string
  user_id: string
  tramite_code: string
  status: ExpedienteStatus
  expediente_number: string | null
  origin_country: string | null
  requires_additional_validation: boolean
  solicitud_type: string | null
  internal_notes: string | null
  advisor_id: string | null
  submitted_at: string | null
  resolved_at: string | null
  result: string | null
  created_at: string
  updated_at: string
  tramites_catalog?: TramiteCatalog
  documentos?: Documento[]
  advisor?: Partial<Profile>
}

export interface Documento {
  id: string
  expediente_id: string
  user_id: string
  document_type: string
  file_name: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  status: DocumentoStatus
  rejection_reason: string | null
  validated_by: string | null
  validated_at: string | null
  created_at: string
}

export interface Mensaje {
  id: string
  expediente_id: string | null
  sender_id: string
  receiver_id: string
  content: string
  attachment_path: string | null
  attachment_name: string | null
  is_read: boolean
  read_at: string | null
  conversation_type: string
  is_closed: boolean
  created_at: string
  sender?: Partial<Profile>
  receiver?: Partial<Profile>
  expediente?: Partial<Expediente>
}

export interface Alerta {
  id: string
  user_id: string
  expediente_id: string | null
  type: AlertaType
  title: string
  description: string | null
  action_label: string | null
  action_url: string | null
  is_read: boolean
  read_at: string | null
  created_by: string | null
  created_at: string
  expediente?: Partial<Expediente>
}

export interface Suscripcion {
  id: string
  user_id: string
  status: 'active' | 'inactive' | 'cancelled' | 'past_due'
  plan: string
  amount: number
  currency: string
  payment_method: string | null
  start_date: string | null
  end_date: string | null
  next_billing_date: string | null
  auto_renew: boolean
  cancelled_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export interface Factura {
  id: string
  user_id: string
  invoice_number: string
  period: string
  concept: string
  base_amount: number
  iva_rate: number
  iva_amount: number | null
  total_amount: number
  status: 'pagada' | 'pendiente' | 'fallida' | 'cancelada'
  payment_method: string | null
  payment_date: string | null
  stripe_invoice_id: string | null
  pdf_path: string | null
  issued_at: string
  created_at: string
}

export interface Cita {
  id: string
  user_id: string
  advisor_id: string | null
  expediente_id: string | null
  type: 'llamada_telefonica' | 'videollamada' | 'reunion_extendida' | 'presencial'
  status: 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'reprogramada'
  scheduled_at: string
  duration_minutes: number
  is_monthly_included: boolean
  notes: string | null
  cancel_reason: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  advisor?: Partial<Profile>
  expediente?: Partial<Expediente>
}
