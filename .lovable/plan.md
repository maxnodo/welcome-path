

# Welcome – Immigration & Foreign Affairs Platform

## Summary
Build a professional Spanish-language private immigration management platform with mock authentication, sidebar navigation, dashboard with interactive cards, and placeholder pages for all sections.

## Implementation

### 1. Design System (index.css + tailwind.config.ts)
- Update CSS variables: primary navy #1B2A4A, secondary #2E5EAA, alerts
- Add Inter font via Google Fonts in index.html

### 2. Mock Auth Context (src/context/AuthContext.tsx)
- React context with mock user session (Carlos García), login/logout state
- Wrap app in provider

### 3. Login Page (src/pages/Login.tsx)
- Centered WCE WELCOME logo, email+password form, forgot password link
- Mock login redirects to /dashboard

### 4. Main Layout (src/components/Layout.tsx)
- Fixed left sidebar: logo, 12 nav items with Lucide icons + badge counters, contact info at bottom
- Fixed top header: dynamic page title, user avatar + greeting, notification bell
- Scrollable content area
- Active route highlighting via React Router

### 5. Dashboard (src/pages/Dashboard.tsx)
- Left card: user profile summary (avatar initials, name, nationality, email)
- Right: 2×5 grid of 10 clickable cards with icons, titles, counters, hover effects
- Bottom CTA banner to contact advisor

### 6. Placeholder Pages (10 files)
- /perfil, /tramites, /mensajes, /alertas, /suscripcion, /historico, /ayuda, /chat, /facturas, /citas
- Each shows section title + "Sección en construcción" within the main layout

### 7. Routing (App.tsx)
- /login (public), all other routes wrapped in layout with mock auth guard
- /dashboard as default authenticated route

### Files to create/modify
- `index.html` – add Inter font
- `src/index.css` – update color variables
- `tailwind.config.ts` – add custom colors
- `src/context/AuthContext.tsx` – new
- `src/components/Layout.tsx` – new (sidebar + header)
- `src/components/Logo.tsx` – new
- `src/pages/Login.tsx` – new
- `src/pages/Dashboard.tsx` – new
- `src/pages/Perfil.tsx` – new placeholder
- `src/pages/Tramites.tsx` – new placeholder
- `src/pages/Mensajes.tsx` – new placeholder
- `src/pages/Alertas.tsx` – new placeholder
- `src/pages/Suscripcion.tsx` – new placeholder
- `src/pages/Historico.tsx` – new placeholder
- `src/pages/Ayuda.tsx` – new placeholder
- `src/pages/Chat.tsx` – new placeholder
- `src/pages/Facturas.tsx` – new placeholder
- `src/pages/Citas.tsx` – new placeholder
- `src/App.tsx` – update routes

