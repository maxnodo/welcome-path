# WCE Welcome

Portal de clientes y panel de gestion para expedientes migratorios, preinscripciones, documentos, mensajes, alertas, citas, suscripciones y facturacion.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Easypanel + Docker/Nginx

## Desarrollo local

```sh
npm install
npm run dev
```

Crea un `.env` local basado en `.env.example`:

```sh
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Produccion

La app esta preparada para desplegarse en Easypanel usando el `Dockerfile` del repositorio. El contenedor sirve el build estatico de Vite con Nginx en el puerto `80`.
