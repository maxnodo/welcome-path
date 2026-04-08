

## Plan: Añadir checkbox de consentimiento al Formulario Express

### Cambio

Agregar un checkbox obligatorio antes del botón "Enviar solicitud" con el texto:

> ☐ Acepto la [política de privacidad](https://go-welcome.com/politica-de-privacidad/)

### Archivo a modificar

**`src/components/FormularioExpress.tsx`**

1. Añadir estado `consentimiento` (boolean, default `false`)
2. Antes del botón de envío, insertar un bloque con `Checkbox` de shadcn/ui + label con link externo a la política de privacidad
3. En `handleSubmit`, validar que `consentimiento === true` antes de enviar (mostrar error si no está marcado)
4. Deshabilitar el botón "Enviar solicitud" si el checkbox no está marcado

### Detalles técnicos

- Usar el componente `Checkbox` existente en `src/components/ui/checkbox.tsx`
- El link abre en nueva pestaña (`target="_blank" rel="noopener noreferrer"`)
- No se añaden dependencias nuevas

