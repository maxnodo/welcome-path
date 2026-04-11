

## Plan: Scalable Workload Visualization

### Problem
The current list format (name + progress bar + badges per row) won't scale when there are 10+ gestors — it becomes a long, hard-to-scan wall of rows.

### Proposed Alternative: Compact Card Grid with Summary Bar

**Layout**: Replace the single list with a responsive grid of compact cards (3-4 per row on desktop). Each card shows one gestor with:
- Name (truncated)
- A donut/ring chart showing active vs capacity (lightweight, CSS-only)
- Key metrics as small numbers below (activos, revisión, citas)
- Color-coded border: green (low load), amber (medium), red (high)

**Additional element**: A top summary row showing:
- Total active expedientes across all gestors
- Average load per gestor
- Number of gestors at high capacity

### Why this scales
- Grid wraps naturally — 5 gestors = 2 rows, 20 gestors = 5-7 rows, all compact
- Visual color coding lets admins spot overloaded gestors at a glance without reading every number
- Cards can be sorted/filtered (e.g., "show only overloaded")

### Technical Changes

**`src/pages/admin/AdminDashboard.tsx`**
- Replace the workload list section (lines 271-294) with a card grid
- Each card: `bg-card rounded-lg border-l-4` with color based on load threshold
- Use CSS ring/donut via `conic-gradient` for the mini chart (no new dependencies)
- Add a small summary row above the grid with aggregate stats
- Cards arranged in `grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3`

### Visual Reference
```text
┌─ Summary: 12 activos total │ Promedio: 3/gestor │ 1 sobrecargado ─┐

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ 🟢 María │  │ 🟡 Pedro │  │ 🔴 Admin │  │ 🟢 Laura │
│  ◉ 3     │  │  ◉ 5     │  │  ◉ 8     │  │  ◉ 1     │
│ 1rev 0ci │  │ 2rev 1ci │  │ 3rev 2ci │  │ 0rev 0ci │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

### Load thresholds (configurable)
- Green: 0-3 active expedientes
- Amber: 4-6
- Red: 7+

