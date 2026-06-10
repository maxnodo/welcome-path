create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('user', 'gestor', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.expediente_status as enum (
    'no_iniciado',
    'documentacion_incompleta',
    'en_revision',
    'requerimiento_adicional',
    'presentado',
    'aprobado',
    'finalizado',
    'denegado',
    'archivado'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.alerta_type as enum (
    'urgente',
    'recordatorio',
    'presentacion_pendiente',
    'resolucion'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.documento_status as enum (
    'pendiente',
    'en_revision',
    'validado',
    'rechazado'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  nationality text,
  email text,
  document_type text,
  document_number text,
  birth_date date,
  second_nationality text,
  civil_status text,
  phone text,
  street text,
  street_number text,
  city text,
  province text,
  postal_code text,
  country text,
  migration_status text,
  visa_type text,
  entry_date date,
  permit_expiry date,
  expediente_number text,
  expediente_office text,
  acting_on_behalf boolean not null default false,
  representative_name text,
  representative_document text,
  representative_relation text,
  declaration_verified boolean not null default false,
  declaration_responsibility boolean not null default false,
  declaration_understood boolean not null default false,
  role public.user_role not null default 'user',
  advisor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tramites_catalog (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  badge text,
  badge_color text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.expedientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  tramite_code text not null references public.tramites_catalog(code),
  status public.expediente_status not null default 'no_iniciado',
  expediente_number text,
  origin_country text,
  requires_additional_validation boolean not null default false,
  solicitud_type text,
  internal_notes text,
  advisor_id uuid references public.profiles(id) on delete set null,
  submitted_at timestamptz,
  resolved_at timestamptz,
  result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  expediente_id uuid not null references public.expedientes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  status public.documento_status not null default 'pendiente',
  rejection_reason text,
  validated_by uuid references public.profiles(id) on delete set null,
  validated_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.mensajes (
  id uuid primary key default gen_random_uuid(),
  expediente_id uuid references public.expedientes(id) on delete set null,
  sender_id uuid not null constraint mensajes_sender_id_fkey references public.profiles(id) on delete cascade,
  receiver_id uuid not null constraint mensajes_receiver_id_fkey references public.profiles(id) on delete cascade,
  content text not null,
  attachment_path text,
  attachment_name text,
  is_read boolean not null default false,
  read_at timestamptz,
  conversation_type text not null default 'tramite',
  is_closed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.alertas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  expediente_id uuid references public.expedientes(id) on delete set null,
  type public.alerta_type not null default 'recordatorio',
  title text not null,
  description text,
  action_label text,
  action_url text,
  is_read boolean not null default false,
  read_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.suscripciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  status text not null default 'inactive' check (status in ('active', 'inactive', 'cancelled', 'past_due')),
  plan text not null default 'basic',
  amount numeric(10,2) not null default 0,
  currency text not null default 'EUR',
  payment_method text,
  start_date date,
  end_date date,
  next_billing_date date,
  auto_renew boolean not null default true,
  cancelled_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.facturas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null constraint facturas_user_id_fkey references public.profiles(id) on delete cascade,
  invoice_number text not null unique,
  period text not null,
  concept text not null,
  base_amount numeric(10,2) not null default 0,
  iva_rate numeric(5,2) not null default 21,
  iva_amount numeric(10,2),
  total_amount numeric(10,2) not null default 0,
  status text not null default 'pendiente' check (status in ('pagada', 'pendiente', 'fallida', 'cancelada')),
  payment_method text,
  payment_date date,
  stripe_invoice_id text,
  pdf_path text,
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.citas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null constraint citas_user_id_fkey references public.profiles(id) on delete cascade,
  advisor_id uuid constraint citas_advisor_id_fkey references public.profiles(id) on delete set null,
  expediente_id uuid references public.expedientes(id) on delete set null,
  type text not null check (type in ('llamada_telefonica', 'videollamada', 'reunion_extendida', 'presencial')),
  status text not null default 'pendiente' check (status in ('pendiente', 'confirmada', 'completada', 'cancelada', 'reprogramada')),
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 30,
  is_monthly_included boolean not null default true,
  notes text,
  cancel_reason text,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text,
  telefono text not null,
  pais_origen text,
  necesidad text,
  ubicacion text,
  cuando text,
  descripcion text,
  advisor_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'converted')),
  created_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists expedientes_touch_updated_at on public.expedientes;
create trigger expedientes_touch_updated_at
before update on public.expedientes
for each row execute function public.touch_updated_at();

drop trigger if exists suscripciones_touch_updated_at on public.suscripciones;
create trigger suscripciones_touch_updated_at
before update on public.suscripciones
for each row execute function public.touch_updated_at();

drop trigger if exists citas_touch_updated_at on public.citas;
create trigger citas_touch_updated_at
before update on public.citas
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_gestor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('gestor', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.tramites_catalog enable row level security;
alter table public.expedientes enable row level security;
alter table public.documentos enable row level security;
alter table public.mensajes enable row level security;
alter table public.alertas enable row level security;
alter table public.suscripciones enable row level security;
alter table public.facturas enable row level security;
alter table public.citas enable row level security;
alter table public.leads enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "profiles_select_own_or_staff" on public.profiles;
create policy "profiles_select_own_or_staff"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_gestor());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "tramites_read_all" on public.tramites_catalog;
create policy "tramites_read_all"
on public.tramites_catalog for select
to anon, authenticated
using (is_active = true or public.is_gestor());

drop policy if exists "tramites_manage_admin" on public.tramites_catalog;
create policy "tramites_manage_admin"
on public.tramites_catalog for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "expedientes_select_scope" on public.expedientes;
create policy "expedientes_select_scope"
on public.expedientes for select
to authenticated
using (user_id = auth.uid() or advisor_id = auth.uid() or public.is_admin());

drop policy if exists "expedientes_insert_staff" on public.expedientes;
create policy "expedientes_insert_staff"
on public.expedientes for insert
to authenticated
with check (public.is_gestor());

drop policy if exists "expedientes_update_staff" on public.expedientes;
create policy "expedientes_update_staff"
on public.expedientes for update
to authenticated
using (advisor_id = auth.uid() or public.is_admin())
with check (advisor_id = auth.uid() or public.is_admin());

drop policy if exists "expedientes_delete_admin" on public.expedientes;
create policy "expedientes_delete_admin"
on public.expedientes for delete
to authenticated
using (public.is_admin());

drop policy if exists "documentos_select_scope" on public.documentos;
create policy "documentos_select_scope"
on public.documentos for select
to authenticated
using (user_id = auth.uid() or public.is_gestor());

drop policy if exists "documentos_insert_owner" on public.documentos;
create policy "documentos_insert_owner"
on public.documentos for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "documentos_update_staff" on public.documentos;
create policy "documentos_update_staff"
on public.documentos for update
to authenticated
using (public.is_gestor())
with check (public.is_gestor());

drop policy if exists "documentos_delete_staff" on public.documentos;
create policy "documentos_delete_staff"
on public.documentos for delete
to authenticated
using (public.is_gestor());

drop policy if exists "mensajes_select_participants_or_staff" on public.mensajes;
create policy "mensajes_select_participants_or_staff"
on public.mensajes for select
to authenticated
using (sender_id = auth.uid() or receiver_id = auth.uid() or public.is_admin());

drop policy if exists "mensajes_insert_sender" on public.mensajes;
create policy "mensajes_insert_sender"
on public.mensajes for insert
to authenticated
with check (sender_id = auth.uid());

drop policy if exists "mensajes_update_receiver_or_staff" on public.mensajes;
create policy "mensajes_update_receiver_or_staff"
on public.mensajes for update
to authenticated
using (receiver_id = auth.uid() or public.is_gestor())
with check (receiver_id = auth.uid() or public.is_gestor());

drop policy if exists "alertas_select_owner_or_staff" on public.alertas;
create policy "alertas_select_owner_or_staff"
on public.alertas for select
to authenticated
using (user_id = auth.uid() or public.is_gestor());

drop policy if exists "alertas_insert_staff" on public.alertas;
create policy "alertas_insert_staff"
on public.alertas for insert
to authenticated
with check (public.is_gestor());

drop policy if exists "alertas_update_owner_or_staff" on public.alertas;
create policy "alertas_update_owner_or_staff"
on public.alertas for update
to authenticated
using (user_id = auth.uid() or public.is_gestor())
with check (user_id = auth.uid() or public.is_gestor());

drop policy if exists "alertas_delete_staff" on public.alertas;
create policy "alertas_delete_staff"
on public.alertas for delete
to authenticated
using (public.is_gestor());

drop policy if exists "suscripciones_select_owner_or_staff" on public.suscripciones;
create policy "suscripciones_select_owner_or_staff"
on public.suscripciones for select
to authenticated
using (user_id = auth.uid() or public.is_gestor());

drop policy if exists "suscripciones_update_owner_or_staff" on public.suscripciones;
create policy "suscripciones_update_owner_or_staff"
on public.suscripciones for update
to authenticated
using (user_id = auth.uid() or public.is_gestor())
with check (user_id = auth.uid() or public.is_gestor());

drop policy if exists "suscripciones_manage_staff" on public.suscripciones;
create policy "suscripciones_manage_staff"
on public.suscripciones for insert
to authenticated
with check (public.is_gestor());

drop policy if exists "facturas_select_owner_or_staff" on public.facturas;
create policy "facturas_select_owner_or_staff"
on public.facturas for select
to authenticated
using (user_id = auth.uid() or public.is_gestor());

drop policy if exists "facturas_insert_staff" on public.facturas;
create policy "facturas_insert_staff"
on public.facturas for insert
to authenticated
with check (public.is_gestor());

drop policy if exists "facturas_update_staff" on public.facturas;
create policy "facturas_update_staff"
on public.facturas for update
to authenticated
using (public.is_gestor())
with check (public.is_gestor());

drop policy if exists "citas_select_scope" on public.citas;
create policy "citas_select_scope"
on public.citas for select
to authenticated
using (user_id = auth.uid() or advisor_id = auth.uid() or public.is_admin());

drop policy if exists "citas_insert_owner_or_staff" on public.citas;
create policy "citas_insert_owner_or_staff"
on public.citas for insert
to authenticated
with check (user_id = auth.uid() or public.is_gestor());

drop policy if exists "citas_update_scope" on public.citas;
create policy "citas_update_scope"
on public.citas for update
to authenticated
using (user_id = auth.uid() or advisor_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or advisor_id = auth.uid() or public.is_admin());

drop policy if exists "leads_insert_public" on public.leads;
create policy "leads_insert_public"
on public.leads for insert
to anon, authenticated
with check (true);

drop policy if exists "leads_select_staff" on public.leads;
create policy "leads_select_staff"
on public.leads for select
to authenticated
using (public.is_gestor());

drop policy if exists "leads_update_staff" on public.leads;
create policy "leads_update_staff"
on public.leads for update
to authenticated
using (public.is_gestor())
with check (public.is_gestor());

drop policy if exists "app_settings_select_admin" on public.app_settings;
create policy "app_settings_select_admin"
on public.app_settings for select
to authenticated
using (public.is_admin());

drop policy if exists "app_settings_upsert_admin" on public.app_settings;
create policy "app_settings_upsert_admin"
on public.app_settings for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.tramites_catalog (code, name, description, badge, badge_color)
values
  ('regularizacion', 'Regularizacion de situacion', 'Asistencia para regularizar la situacion migratoria.', 'Popular', 'secondary'),
  ('renovacion', 'Renovacion de papeles', 'Gestion de renovacion de permisos y documentacion.', null, null),
  ('reagrupacion_familiar', 'Reagrupacion familiar', 'Tramites para traer a un familiar.', null, null),
  ('permiso_trabajo', 'Permiso de trabajo', 'Solicitud o modificacion de permiso de trabajo.', null, null),
  ('nacionalidad', 'Nacionalidad espanola', 'Acompanamiento para nacionalidad espanola.', null, null),
  ('consulta', 'Consulta inicial', 'Evaluacion inicial del caso.', null, null)
on conflict (code) do nothing;

insert into storage.buckets (id, name, public)
values ('documentos-tramite', 'documentos-tramite', false)
on conflict (id) do nothing;

drop policy if exists "documentos_storage_owner_upload" on storage.objects;
create policy "documentos_storage_owner_upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'documentos-tramite'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "documentos_storage_owner_or_staff_read" on storage.objects;
create policy "documentos_storage_owner_or_staff_read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'documentos-tramite'
  and (split_part(name, '/', 1) = auth.uid()::text or public.is_gestor())
);

drop policy if exists "documentos_storage_owner_or_staff_delete" on storage.objects;
create policy "documentos_storage_owner_or_staff_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'documentos-tramite'
  and (split_part(name, '/', 1) = auth.uid()::text or public.is_gestor())
);
