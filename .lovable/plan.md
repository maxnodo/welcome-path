

## Análisis de la paleta propuesta

| Rol | Color | Observación |
|-----|-------|-------------|
| Primary | `#F91942` (rojo-rosa vibrante) | Muy llamativo, buen CTA. Contrasta bien sobre blanco |
| Accent | `#E4C969` (dorado) | Transmite premium/lujo. Buen complemento al rojo |
| Background | `#FFFFFF` | Limpio, estándar |
| Text Primary | `#192B43` (azul marino oscuro) | Excelente legibilidad. Coincide con el navy actual |
| Link | `#192B43` | Funciona, aunque podría confundirse con texto normal |

**Opinión**: La combinación rojo-rosa + dorado + navy es audaz y premium. Funciona bien para una firma de inmigración que quiere proyectar confianza (navy) con energía (rojo) y exclusividad (dorado). El contraste es bueno en todos los casos.

**Una consideración**: El primary actual (navy) se usa en el sidebar y muchos botones. Cambiar primary a rojo-rosa significa que todos los botones, sidebar y elementos principales serán rojos. Si prefieres mantener el sidebar navy y usar el rojo solo para CTAs, podríamos invertir: dejar navy como primary y rojo como accent/destructive.

## Plan de implementación

### Opción A: Aplicar tal cual (rojo = primary)
### Opción B: Navy sigue como primary, rojo como secondary/accent

En ambos casos, los cambios son en **2 archivos**:

1. **`src/index.css`** — Actualizar las variables CSS HSL en `:root`
2. **`tailwind.config.ts`** — Sin cambios estructurales (ya usa las variables)

### Valores HSL a aplicar (Opción A)

```
--primary: 349 95% 54%;        /* #F91942 */
--accent: 43 72% 65%;          /* #E4C969 */
--background: 0 0% 100%;       /* #FFFFFF */
--foreground: 218 46% 18%;     /* #192B43 */
--sidebar-background: 218 46% 18%;  /* mantener navy en sidebar */
```

Se actualizarán también las variantes (muted, card, border, etc.) para armonizar con la nueva paleta.

