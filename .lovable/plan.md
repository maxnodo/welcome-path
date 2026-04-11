

## Plan: Remove user card from Dashboard

The left-column user card (avatar, name, nationality, email) takes up significant space and duplicates info already visible in the top nav.

### Changes

**`src/pages/Dashboard.tsx`**
- Remove the entire left column `<div className="w-64 shrink-0 hidden lg:block">` block with the user card
- Simplify the outer container from `flex gap-6` to just the cards grid (remove the flex wrapper since there's only one column now)
- Keep all dashboard cards and the CTA banner as-is

