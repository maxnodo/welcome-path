

## Plan: Workload cards en fila horizontal con scroll

### Cambio

En `src/pages/admin/AdminDashboard.tsx` (línea 322), reemplazar la grid responsiva por un contenedor flex horizontal con scroll:

```
// Antes
<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">

// Después
<div className="flex gap-3 overflow-x-auto pb-2">
```

Cada tarjeta de gestor recibirá `min-w-[180px] flex-shrink-0` para mantener un ancho mínimo consistente y evitar que se compriman. El contenedor mostrará una barra de scroll horizontal cuando haya más gestores de los que caben en pantalla.

### Archivo afectado
- `src/pages/admin/AdminDashboard.tsx` — una línea cambiada (grid → flex scroll), una clase añadida a las tarjetas hijas.

