

## Plan: Lazy loading de páginas en App.tsx

### Cambios en `src/App.tsx`

1. Reemplazar los ~25 imports estáticos de páginas por `React.lazy()`:
```ts
const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
// ... todas las páginas
```

2. Mantener imports estáticos para: `Layout`, `AdminLayout`, `AdminLogin`, `Logo`, route guards, UI components (Toaster, Sonner, etc.)

3. Envolver `<Routes>` en `<Suspense>` con el mismo spinner+Logo usado en los route guards:
```tsx
<Suspense fallback={
  <div className="min-h-screen flex items-center justify-center bg-muted/30">
    <div className="text-center space-y-4">
      <Logo size="lg" />
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
    </div>
  </div>
}>
  <Routes>...</Routes>
</Suspense>
```

### Archivos modificados
- `src/App.tsx` — único archivo afectado

