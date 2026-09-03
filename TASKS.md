# Execution Blueprint: TASKS.md

| Phase | Task | Why this is needed | Status |
|---|---|---|---|
| **Phase 1: Foundation** | Setup Next.js 14, Tailwind, TypeScript | Core framework for modern UI and type safety. | [ ] |
| | Setup Supabase Client & DB Migration | Establish database schema and client connections early. | [ ] |
| | Setup UI Library (shadcn/ui or similar) | Rapid prototyping of minimal, professional UI. | [ ] |
| **Phase 2: Authentication** | Setup Login / Signup Forms | Buyers must authenticate to join pools. | [ ] |
| | Create Supabase Auth Middleware | Protect dashboard and admin routes server-side. | [ ] |
| | Extended Profile Creation | Need `company_name` and `phone` for business context. | [ ] |
| **Phase 3: Public UI** | Develop Homepage (Hero, How it Works) | First impression & explaining the D2B pooling concept. | [ ] |
| | Active Pools Listing Page | Primary discovery mechanism for buyers. | [ ] |
| | Pool Detail Page | Show product info, progress bar, and PriceSlabsTable. | [ ] |
| **Phase 4: Core Logic** | Join Pool Server Action | Securely add buyer to a pool without client-side hacks. | [ ] |
| | Dynamic Pricing Engine | The core value prop: recalculate tier as total qty increases. | [ ] |
| | Realtime or Optimistic Updates | Show progress bar/price drops instantly to build trust. | [ ] |
| **Phase 5: Buyer Dashboard** | My Orders Listing | Allow buyers to track what they've joined. | [ ] |
| | Order Status Tracking | Show state transitions (joined -> confirmed -> shipped). | [ ] |
| **Phase 6: Admin Panel** | Create & Manage Pools | Admins need to initiate pools and define tiers. | [ ] |
| | View All Pool Orders | Necessary for aggregation before contacting suppliers. | [ ] |
| | QC Logging Interface | Record major QC status before dispatch to build buyer trust. | [ ] |
