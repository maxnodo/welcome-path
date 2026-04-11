

## Plan: Refactorizar código duplicado entre AdminDashboard y AdminExpedientes

### Archivos nuevos a crear

**1. `src/lib/expediente-utils.ts`**
- Exportar `allStatuses`, `statusLabels`, `statusColor`
- Tipos importados desde `database.types.ts`

**2. `src/hooks/useGestores.ts`** (modificar)
- Agregar función `getGestorName(gestores, advisorId)` exportada, que reciba el array de gestores y el ID
- El hook sigue igual, pero ahora también exporta esta utilidad

**3. `src/components/admin/ExpedienteDetailDialog.tsx`**
- Componente que encapsula el modal completo de detalle de expediente
- Props:
  - `expediente: Expediente | null` (controla open/close)
  - `gestores: Gestor[]`
  - `isAdmin: boolean`
  - `onSave: (data: { status, advisorId, notes }) => Promise<void>`
  - `onDelete: () => void` (abre el diálogo de delete)
  - `onClose: () => void`
  - `onValidateDoc?: (docId: string) => Promise<void>`
  - `onRejectDoc?: (docId: string) => void` (abre el reject dialog)
  - `onResetDoc?: (docId: string) => Promise<void>`
  - `onDownloadDoc?: (doc: Documento) => Promise<void>`
  - `showDocumentActions?: boolean` (true en AdminExpedientes, false/simplified en Dashboard)
- Maneja internamente el estado de `detailStatus`, `detailAdvisorId`, `notes` (se inicializan con useEffect cuando cambia el expediente)

**4. `src/components/admin/DeleteExpedienteDialog.tsx`**
- Props: `open`, `onOpenChange`, `onConfirm`, `deleting`
- Contiene el AlertDialog de confirmación de eliminación

**5. `src/components/admin/RejectDocumentDialog.tsx`**
- Props: `open`, `onOpenChange`, `onConfirm`
- Maneja internamente el `rejectionReason` state
- Contiene el AlertDialog con textarea para motivo de rechazo

### Archivos a refactorizar

**6. `src/pages/admin/AdminExpedientes.tsx`**
- Eliminar `allStatuses`, `statusLabels`, `statusColor`, `getGestorName` locales
- Importar desde `expediente-utils.ts` y `useGestores`
- Reemplazar el modal de detalle por `<ExpedienteDetailDialog>`
- Reemplazar diálogos por `<DeleteExpedienteDialog>` y `<RejectDocumentDialog>`
- Se reduce de ~453 líneas a ~200

**7. `src/pages/admin/AdminDashboard.tsx`**
- Eliminar `allStatuses`, `statusLabels`, `statusColor`, `getGestorName` locales
- Importar desde `expediente-utils.ts` y `useGestores`
- Reemplazar el modal de detalle por `<ExpedienteDetailDialog>` con `showDocumentActions={false}` (el Dashboard muestra docs simplificados)
- Reemplazar diálogo de eliminación por `<DeleteExpedienteDialog>`
- Se reduce de ~621 líneas a ~420

### Nota sobre diferencias entre ambos modales
- AdminExpedientes muestra acciones completas de documentos (validar, rechazar, descargar, resetear) y muestra `solicitud_type`
- AdminDashboard muestra documentos en modo solo lectura (nombre + estado) y muestra `expediente_number`
- El componente `ExpedienteDetailDialog` usará la prop `showDocumentActions` para controlar esto

