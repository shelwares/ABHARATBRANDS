# System Architecture: Abhartbrands

## High-Level Architecture
- **Frontend/Backend:** Next.js 14 App Router
- **Database/Auth:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS

## Core Constraints
- **Supplier logic is completely excluded from the frontend.** Admin manages suppliers offline via WhatsApp/Phone.
- The platform is strictly D2B (Direct-to-Business) for buyers (small retailers, D2C founders).
- Dynamic Pricing is managed server-side via Supabase Edge Functions or Next.js Server Actions.

## Folder Structure
```
/bharatbrand
├── app/                  # Next.js App Router
│   ├── (auth)/           # Login/Signup routes
│   ├── (public)/         # Home, Pools Listing, Pool Detail
│   ├── dashboard/        # Buyer dashboard (My Orders)
│   └── admin/            # Admin Panel
├── components/           # UI Components
│   ├── ui/               # Base UI elements (Tailwind/Radix)
│   ├── pools/            # PoolCard, PriceSlabsTable
│   └── layout/           # Navbar, Footer, Sidebar
├── lib/                  # Services & Config
│   ├── supabase/         # Supabase client & admin client
│   └── actions/          # Server actions for mutations
├── types/                # TypeScript types & Zod schemas
└── utils/                # Helper functions (formatting, pricing)
```
