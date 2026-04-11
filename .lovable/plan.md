

## Plan: Corregir race condition en AuthContext.tsx

### Problema
`onAuthStateChange` y `getSession` disparan `fetchProfile` concurrentemente. El `setTimeout` puede ejecutar tras desmontaje. `TOKEN_REFRESHED` pone `loading: true` innecesariamente causando pantalla en blanco.

### Cambios en `src/context/AuthContext.tsx`

**Nuevo estado y refs:**
- Agregar `const [userId, setUserId] = useState<string | null>(null)`
- Agregar `const isFetching = useRef(false)` para evitar fetches duplicados

**useEffect 1 — Auth listener (modificar el existente):**
- `onAuthStateChange`: para `INITIAL_SESSION` y `SIGNED_IN`, actualizar session/user/userId y poner `loading: true`. Para `TOKEN_REFRESHED`, solo actualizar session y user, **no tocar loading ni userId**. Para `SIGNED_OUT`, limpiar todo y poner `loading: false`.
- Eliminar el `setTimeout` y la llamada directa a `fetchProfile`.
- Eliminar el bloque `getSession().then(...)` — `INITIAL_SESSION` ya lo cubre.

**useEffect 2 — Fetch profile (nuevo):**
- Depende de `[userId]`
- Si `userId` es null, limpiar profile y poner `loading: false`, return
- Si `isFetching.current` es true, return (evitar duplicados)
- Crear variable `cancelled = false` para cleanup
- Poner `isFetching.current = true`, hacer fetch, si no `cancelled` entonces `setProfile` y `setLoading(false)`
- En finally: `isFetching.current = false`
- Cleanup: `cancelled = true`

**refreshProfile:** cambia a re-ejecutar el fetch directamente (sin pasar por userId) usando la misma lógica con la ref de protección.

### Resultado
- Un solo punto de entrada para fetchProfile (el useEffect de userId)
- Sin setTimeout
- TOKEN_REFRESHED no causa loading ni refetch
- Ref previene fetches duplicados
- Cleanup previene setState en componente desmontado

