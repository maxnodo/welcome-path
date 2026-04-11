

## Plan: 3 correcciones en gestión de expedientes

### Corrección 1: Opción "Sin asignar" en selectores de gestor

**Problema**: Una vez asignado un gestor, no se puede des-asignar porque falta una opción vacía.

**Cambios**:
- **AdminDashboard.tsx** (línea ~440): Agregar `<SelectItem value="__none__">Sin asignar</SelectItem>` como primera opción en el selector de gestor del modal de detalle.
- **AdminDashboard.tsx** (`openDetail`): Inicializar `detailAdvisorId` como `"__none__"` cuando `advisor_id` es null.
- **AdminDashboard.tsx** (`saveChanges`): Convertir `"__none__"` a `null` antes de guardar.
- **AdminExpedientes.tsx** (línea ~217): Mismo cambio en el selector de gestor del modal de detalle.
- **AdminExpedientes.tsx** (`openDetail` y `saveChanges`): Misma lógica de conversión.

> Nota: Radix Select no permite `value=""`, por eso se usa un valor centinela `"__none__"`.

### Corrección 2: Admin en la card de carga de trabajo

**Problema**: Línea 136 de AdminDashboard filtra `g.role !== 'admin'`, excluyendo al admin de la card de workload, pero los selectores de gestor sí lo incluyen.

**Cambio**:
- **AdminDashboard.tsx** (línea 136): Eliminar el filtro `.filter(g => g.role !== 'admin')` para que el admin aparezca en la card de carga de trabajo junto a los gestores.

### Corrección 3: `bg-current/5` en ExpedientesList

**Problema**: La clase `bg-current/5` en los badges de estado (línea ~69) no funciona correctamente en Tailwind.

**Cambio**:
- **ExpedientesList.tsx**: Agregar una propiedad `bg` a cada entrada de `statusConfig` con clases explícitas de background, y usarla en el badge en lugar de `bg-current/5`.

Mapa de colores:
| Estado | Background |
|--------|-----------|
| no_iniciado | `bg-muted` |
| documentacion_incompleta | `bg-warning/10` |
| en_revision | `bg-secondary/10` |
| requerimiento_adicional | `bg-orange-500/10` |
| presentado | `bg-purple-500/10` |
| aprobado | `bg-success/10` |
| finalizado | `bg-primary/10` |
| denegado | `bg-destructive/10` |
| archivado | `bg-muted` |

### Archivos afectados
1. `src/pages/admin/AdminDashboard.tsx` — correcciones 1 y 2
2. `src/pages/admin/AdminExpedientes.tsx` — corrección 1
3. `src/components/ExpedientesList.tsx` — corrección 3

