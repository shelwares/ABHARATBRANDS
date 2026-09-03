# Project Tree: Abhartbrands

```text
Abhartbrands
├── UI Components
│   ├── Navigation
│   │   ├── Navbar
│   │   ├── Footer
│   │   └── AdminSidebar
│   ├── Landing / Marketing
│   │   ├── HeroSection
│   │   └── HowItWorks
│   ├── Pools
│   │   ├── ActivePoolsCards
│   │   ├── PoolDetailHeader
│   │   ├── PriceSlabsTable
│   │   └── JoinPoolModal
│   ├── Dashboard
│   │   ├── OrderStatusCard
│   │   └── UserProfileWidget
│   └── Admin
│       ├── CreatePoolForm
│       ├── ManageOrdersTable
│       └── QCLogger
├── Business Logic (Core Mechanisms)
│   ├── Aggregator Engine
│   │   ├── CalculateCurrentTier()
│   │   └── BroadcastPriceUpdate()
│   └── Dynamic Pricing Calculator
│       ├── GetCurrentPrice()
│       └── PredictNextTierPrice()
└── Data Flow Pipeline
    ├── 1. Admin creates Pool and Tiers
    ├── 2. Buyer views Active Pools
    ├── 3. Buyer joins Pool -> Pool Total Qty increments
    ├── 4. Server evaluates new Qty against Tiers
    ├── 5. IF Tier changes -> Update unit price for ALL buyers in Pool
    ├── 6. Pool ends -> Final confirmation & offline Supplier engagement
    └── 7. QC phase & Shipping status updates
```
